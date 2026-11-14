import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import {
  type ProductId,
  hashValue,
  maskEmail,
  maskReference,
  securityLog,
} from './security.ts';

export type OrderStatus = 'pending' | 'completed' | 'failed' | 'refunded';

export interface ServerOrderRecord {
  reference: string;
  productId: ProductId;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  expectedAmountKobo: number;
  expectedAmountNgn: number;
  currency: 'NGN';
  status: OrderStatus;
  paymentGateway: 'paystack';
  paystackTransactionId?: string;
  channel?: string;
  paidAt?: string;
  downloadCount: number;
  emailSent: boolean;
  createdAt: string;
  updatedAt: string;
}

// Authoritative in-process store (paired with Supabase Service Role persistence when configured)
const ordersMap = new Map<string, ServerOrderRecord>();
const processedWebhookEvents = new Set<string>();
const inFlightOrderLocks = new Set<string>();

let supabaseAdminClient: SupabaseClient | null = null;
let supabaseInitAttempted = false;

export function getSupabaseAdminClient(): SupabaseClient | null {
  if (supabaseInitAttempted) return supabaseAdminClient;
  supabaseInitAttempted = true;

  const url = (process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '').trim();
  const serviceRoleKey = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();

  if (
    !url ||
    !serviceRoleKey ||
    url.includes('your-project-ref') ||
    serviceRoleKey.includes('your-service-role-key')
  ) {
    return null;
  }

  try {
    supabaseAdminClient = createClient(url, serviceRoleKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
    return supabaseAdminClient;
  } catch (err: any) {
    securityLog('error', 'supabase_admin_init_failed', {
      error: err?.message || 'Initialization error',
    });
    return null;
  }
}

/**
 * Persists a newly initialized PENDING order BEFORE Paystack checkout starts.
 */
export async function createPendingOrder(params: {
  reference: string;
  productId: ProductId;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  expectedAmountKobo: number;
  expectedAmountNgn: number;
  currency: 'NGN';
}): Promise<ServerOrderRecord> {
  const now = new Date().toISOString();
  const record: ServerOrderRecord = {
    reference: params.reference,
    productId: params.productId,
    customerName: params.customerName,
    customerEmail: params.customerEmail.toLowerCase(),
    customerPhone: params.customerPhone,
    expectedAmountKobo: params.expectedAmountKobo,
    expectedAmountNgn: params.expectedAmountNgn,
    currency: params.currency,
    status: 'pending',
    paymentGateway: 'paystack',
    downloadCount: 0,
    emailSent: false,
    createdAt: now,
    updatedAt: now,
  };

  ordersMap.set(params.reference, record);

  const db = getSupabaseAdminClient();
  if (db) {
    try {
      const { error } = await db.from('orders').insert({
        order_ref: record.reference,
        product_id: record.productId,
        customer_name: record.customerName,
        customer_email: record.customerEmail,
        customer_phone: record.customerPhone,
        amount: record.expectedAmountNgn,
        currency: record.currency,
        payment_gateway: 'paystack',
        payment_status: 'pending',
        paystack_reference: record.reference,
      });
      if (error) {
        securityLog('warn', 'db_create_pending_order_error', {
          ref: maskReference(record.reference),
          code: error.code || 'unknown',
        });
      }
    } catch {
      securityLog('warn', 'db_create_pending_order_exception', {
        ref: maskReference(record.reference),
      });
    }
  }

  return record;
}

/**
 * Fetches an order from memory or Supabase Admin database.
 */
export async function getOrderByReference(reference: string): Promise<ServerOrderRecord | null> {
  const cached = ordersMap.get(reference);
  if (cached) return cached;

  const db = getSupabaseAdminClient();
  if (!db) return null;

  try {
    const { data, error } = await db
      .from('orders')
      .select(
        'order_ref, product_id, customer_name, customer_email, customer_phone, amount, currency, payment_status, paystack_transaction_id, channel, paid_at, pdf_download_count, created_at, updated_at'
      )
      .eq('order_ref', reference)
      .maybeSingle();

    if (error || !data) return null;

    const amountNgn = Number(data.amount) || 3000;
    const record: ServerOrderRecord = {
      reference: data.order_ref,
      productId: (data.product_id as ProductId) || 'herbal-guide-pdf',
      customerName: data.customer_name || 'Verified Reader',
      customerEmail: (data.customer_email || '').toLowerCase(),
      customerPhone: data.customer_phone || '',
      expectedAmountNgn: amountNgn,
      expectedAmountKobo: Math.round(amountNgn * 100),
      currency: 'NGN',
      status: (data.payment_status as OrderStatus) || 'pending',
      paymentGateway: 'paystack',
      paystackTransactionId: data.paystack_transaction_id || undefined,
      channel: data.channel || 'card',
      paidAt: data.paid_at || undefined,
      downloadCount: Number(data.pdf_download_count) || 0,
      emailSent: false,
      createdAt: data.created_at || new Date().toISOString(),
      updatedAt: data.updated_at || new Date().toISOString(),
    };

    ordersMap.set(reference, record);
    return record;
  } catch {
    return null;
  }
}

/**
 * Marks an order as completed idempotently.
 * Returns { order, newlyCompleted } so callers never send duplicate notifications or tokens.
 */
export async function markOrderCompletedIdempotent(params: {
  reference: string;
  productId: ProductId;
  customerName: string;
  customerEmail: string;
  amountNgn: number;
  amountKobo: number;
  paystackTransactionId?: string;
  channel?: string;
  paidAt: string;
}): Promise<{ order: ServerOrderRecord; newlyCompleted: boolean }> {
  // Simple spin-wait lock for concurrent verify + webhook race on same reference
  while (inFlightOrderLocks.has(params.reference)) {
    await new Promise((r) => setTimeout(r, 25));
  }
  inFlightOrderLocks.add(params.reference);

  try {
    let existing = await getOrderByReference(params.reference);
    const now = new Date().toISOString();

    if (existing && existing.status === 'completed') {
      return { order: existing, newlyCompleted: false };
    }

    if (!existing) {
      existing = {
        reference: params.reference,
        productId: params.productId,
        customerName: params.customerName || 'Verified Reader',
        customerEmail: params.customerEmail.toLowerCase(),
        customerPhone: '',
        expectedAmountKobo: params.amountKobo,
        expectedAmountNgn: params.amountNgn,
        currency: 'NGN',
        status: 'completed',
        paymentGateway: 'paystack',
        paystackTransactionId: params.paystackTransactionId,
        channel: params.channel || 'card',
        paidAt: params.paidAt,
        downloadCount: 0,
        emailSent: false,
        createdAt: now,
        updatedAt: now,
      };
    } else {
      existing.status = 'completed';
      existing.paystackTransactionId = params.paystackTransactionId || existing.paystackTransactionId;
      existing.channel = params.channel || existing.channel || 'card';
      existing.paidAt = params.paidAt || existing.paidAt || now;
      existing.updatedAt = now;
      if (params.customerEmail && !existing.customerEmail) {
        existing.customerEmail = params.customerEmail.toLowerCase();
      }
    }

    ordersMap.set(params.reference, existing);

    const db = getSupabaseAdminClient();
    if (db) {
      try {
        const { error } = await db.from('orders').upsert(
          {
            order_ref: existing.reference,
            product_id: existing.productId,
            customer_name: existing.customerName,
            customer_email: existing.customerEmail,
            customer_phone: existing.customerPhone,
            amount: existing.expectedAmountNgn,
            currency: existing.currency,
            payment_gateway: 'paystack',
            payment_status: 'completed',
            paystack_reference: existing.reference,
            paystack_transaction_id: existing.paystackTransactionId || null,
            channel: existing.channel || 'card',
            paid_at: existing.paidAt,
          },
          { onConflict: 'order_ref' }
        );
        if (error) {
          securityLog('warn', 'db_complete_order_error', {
            ref: maskReference(existing.reference),
            code: error.code || 'unknown',
          });
        }
      } catch {
        securityLog('warn', 'db_complete_order_exception', {
          ref: maskReference(existing.reference),
        });
      }
    }

    securityLog('info', 'order_completed', {
      ref: maskReference(existing.reference),
      email: maskEmail(existing.customerEmail),
      amountNgn: existing.expectedAmountNgn,
    });

    return { order: existing, newlyCompleted: true };
  } finally {
    inFlightOrderLocks.delete(params.reference);
  }
}

/**
 * Idempotency guard for Paystack webhook events.
 * Returns true if this event is NEW and claimed; false if duplicate.
 */
export async function claimWebhookEvent(
  eventKey: string,
  eventType: string,
  reference: string,
  paystackEventId?: string
): Promise<boolean> {
  if (processedWebhookEvents.has(eventKey)) {
    return false;
  }

  const db = getSupabaseAdminClient();
  if (db) {
    try {
      const { error } = await db.from('webhook_events').insert({
        event_key: eventKey,
        event_type: eventType,
        order_ref: reference,
        paystack_event_id: paystackEventId || null,
        status: 'processed',
      });

      if (error) {
        // PostgreSQL unique_violation (23505) means duplicate event
        if (error.code === '23505') {
          processedWebhookEvents.add(eventKey);
          return false;
        }
        securityLog('warn', 'db_webhook_idempotency_notice', {
          ref: maskReference(reference),
          code: error.code || 'unknown',
        });
      }
    } catch {
      // Fall back to in-memory lock if DB is temporarily unreachable
    }
  }

  processedWebhookEvents.add(eventKey);
  return true;
}

/**
 * Records a PDF download audit entry and increments the order's download counter.
 */
export async function recordDownloadAttempt(params: {
  reference: string;
  customerEmail: string;
  tokenJti: string;
  clientIp: string;
  userAgent: string;
}): Promise<number> {
  const order = ordersMap.get(params.reference);
  let newCount = 1;
  if (order) {
    order.downloadCount += 1;
    order.updatedAt = new Date().toISOString();
    newCount = order.downloadCount;
  }

  const db = getSupabaseAdminClient();
  if (db) {
    try {
      await db.from('download_logs').insert({
        order_ref: params.reference,
        customer_email: params.customerEmail,
        token_jti: params.tokenJti,
        ip_hash: hashValue(params.clientIp).slice(0, 24),
        user_agent: params.userAgent.slice(0, 250),
      });

      await db
        .from('orders')
        .update({
          pdf_download_count: newCount,
          last_download_at: new Date().toISOString(),
        })
        .eq('order_ref', params.reference);
    } catch {
      // Non-fatal logging fallback
    }
  }

  securityLog('info', 'pdf_download_authorized', {
    ref: maskReference(params.reference),
    email: maskEmail(params.customerEmail),
    downloadCount: newCount,
  });

  return newCount;
}
