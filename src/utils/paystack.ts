/**
 * Hardened Paystack Integration Utility
 *
 * Security Rules:
 * - Secret keys NEVER touch the browser.
 * - Every transaction is initialized on the backend (/api/paystack/initialize) using
 *   server-authoritative pricing and cryptographically random references.
 * - Browser callbacks NEVER prove payment; backend verification (/api/paystack/verify)
 *   confirms status, exact amount, currency, and order ownership before issuing a
 *   short-lived signed PDF download token.
 */

declare global {
  interface Window {
    PaystackPop?: {
      setup: (options: {
        key: string;
        access_code: string;
        callback: (response: { reference: string; status?: string; trans?: string; trxref?: string; message?: string }) => void;
        onClose: () => void;
      }) => {
        openIframe: () => void;
      };
      new (): any;
    };
  }
}

export type PaystackGatewayMode = 'live' | 'test' | 'unconfigured' | 'unavailable';

export interface PaystackGatewayConfig {
  isConfigured: boolean;
  isLiveMode: boolean;
  mode: PaystackGatewayMode;
  backendReachable: boolean;
  keyModeMismatch?: boolean;
  persistenceConfigured?: boolean;
  errorMessage?: string;
  publicKey: string | null;
  supportedChannels?: string[];
}

export type PaystackPaymentOptionId =
  | 'all'
  | 'card'
  | 'bank_transfer'
  | 'ussd'
  | 'bank'
  | 'mobile_money'
  | 'qr'
  | 'wallets';

export interface PaystackPaymentMethodMeta {
  id: PaystackPaymentOptionId;
  label: string;
  shortLabel: string;
  subtitle: string;
  channels?: string[];
}

export const PAYSTACK_PAYMENT_METHODS: PaystackPaymentMethodMeta[] = [
  {
    id: 'all',
    label: 'All Paystack Payment Methods',
    shortLabel: 'All Options',
    subtitle: 'Shows every method enabled on your Paystack account',
    channels: undefined,
  },
  {
    id: 'card',
    label: 'Debit / Credit Card',
    shortLabel: 'Card',
    subtitle: 'Visa, Mastercard & Verve',
    channels: ['card'],
  },
  {
    id: 'bank_transfer',
    label: 'Bank Transfer',
    shortLabel: 'Transfer',
    subtitle: 'Instant Nigerian bank transfer',
    channels: ['bank_transfer'],
  },
  {
    id: 'ussd',
    label: 'USSD Code',
    shortLabel: 'USSD',
    subtitle: '*737#, *919#, *901#, *894#',
    channels: ['ussd'],
  },
  {
    id: 'bank',
    label: 'Bank Account',
    shortLabel: 'Bank',
    subtitle: 'Pay directly from bank account',
    channels: ['bank'],
  },
  {
    id: 'mobile_money',
    label: 'Mobile Money / OPay',
    shortLabel: 'OPay / Wallet',
    subtitle: 'OPay, PalmPay & mobile wallets',
    channels: ['mobile_money'],
  },
  {
    id: 'qr',
    label: 'Pay with QR',
    shortLabel: 'QR Code',
    subtitle: 'Scan & pay with bank app',
    channels: ['qr'],
  },
  {
    id: 'wallets',
    label: 'Apple Pay / Google Pay',
    shortLabel: 'Apple / Google Pay',
    subtitle: 'Express device wallet + Card',
    channels: ['card', 'apple_pay', 'google_pay'],
  },
];

export const formatPaystackChannelName = (channel?: string): string => {
  const map: Record<string, string> = {
    card: 'Debit / Credit Card',
    bank_transfer: 'Bank Transfer',
    ussd: 'USSD',
    bank: 'Direct Bank Account',
    mobile_money: 'Mobile Money / OPay',
    qr: 'QR Code',
    apple_pay: 'Apple Pay',
    google_pay: 'Google Pay',
    eft: 'Instant EFT',
  };
  if (!channel) return 'Paystack Checkout';
  const key = channel.toLowerCase().trim();
  return map[key] || channel.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
};

let cachedConfig: PaystackGatewayConfig | null = null;

/**
 * Retrieves public Paystack configuration strictly from the backend API.
 * Never silently falls back to Test Mode when the backend is unavailable or misconfigured.
 */
export const fetchPaystackConfig = async (): Promise<PaystackGatewayConfig> => {
  try {
    const res = await fetch('/api/paystack/config', {
      method: 'GET',
      credentials: 'same-origin',
      cache: 'no-store',
    });

    const contentType = (res.headers.get('content-type') || '').toLowerCase();
    if (!res.ok || !contentType.includes('application/json')) {
      cachedConfig = null;
      return {
        isConfigured: false,
        isLiveMode: false,
        mode: 'unavailable',
        backendReachable: false,
        publicKey: null,
        errorMessage:
          'Payment backend API is unreachable. Ensure the backend server or Netlify Functions are deployed and /api/* routes correctly.',
      };
    }

    const raw = (await res.json()) as Partial<PaystackGatewayConfig>;
    const mode: PaystackGatewayMode =
      raw.mode || (raw.isConfigured ? (raw.isLiveMode ? 'live' : 'test') : 'unconfigured');

    const normalized: PaystackGatewayConfig = {
      isConfigured: Boolean(raw.isConfigured),
      isLiveMode: Boolean(raw.isConfigured && mode === 'live'),
      mode,
      backendReachable: true,
      keyModeMismatch: Boolean(raw.keyModeMismatch),
      persistenceConfigured: raw.persistenceConfigured,
      errorMessage: raw.errorMessage,
      publicKey: raw.publicKey || null,
      supportedChannels: raw.supportedChannels,
    };

    cachedConfig = normalized;
    return normalized;
  } catch {
    cachedConfig = null;
    return {
      isConfigured: false,
      isLiveMode: false,
      mode: 'unavailable',
      backendReachable: false,
      publicKey: null,
      errorMessage:
        'Unable to reach the payment configuration backend. Please check your connection or server deployment.',
    };
  }
};

export const getCachedPaystackPublicKey = (): string => {
  if (cachedConfig?.isConfigured && cachedConfig.publicKey) {
    return cachedConfig.publicKey;
  }
  return '';
};

export const isLiveKey = (key?: string): boolean => {
  if (cachedConfig) return Boolean(cachedConfig.isConfigured && cachedConfig.isLiveMode);
  const k = key || getCachedPaystackPublicKey();
  return k.startsWith('pk_live_');
};

export interface PaystackTransactionParams {
  email: string;
  fullName: string;
  phone: string;
  productId?: string;
  channels?: string[];
  honeypot?: string;
  onInitialized?: (info: { reference: string; authorizationUrl?: string; channelFallback?: boolean }) => void;
  onLoad?: () => void;
  onSuccess: (response: { reference: string; status?: string; trans?: string; trxref?: string; message?: string }) => void;
  onClose?: () => void;
  onError?: (error: Error | string) => void;
}

/**
 * Dynamically ensures Paystack Inline v2 script is loaded in the DOM as fallback
 */
export const loadPaystackScript = (): Promise<boolean> => {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') {
      resolve(false);
      return;
    }

    if (window.PaystackPop) {
      resolve(true);
      return;
    }

    const existingScript = document.getElementById('paystack-inline-script');
    if (existingScript) {
      existingScript.addEventListener('load', () => resolve(true));
      existingScript.addEventListener('error', () => resolve(false));
      return;
    }

    const script = document.createElement('script');
    script.id = 'paystack-inline-script';
    script.src = 'https://js.paystack.co/v2/inline.js';
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.head.appendChild(script);
  });
};

export interface BackendInitResponse {
  success: boolean;
  access_code: string;
  reference: string;
  authorization_url?: string;
  channelFallback?: boolean;
  message?: string;
}

async function parseJsonApiResponse(res: Response, unavailableMessage: string): Promise<any> {
  const contentType = (res.headers.get('content-type') || '').toLowerCase();
  if (!contentType.includes('application/json')) {
    throw new Error(unavailableMessage);
  }
  return res.json();
}

/**
 * Initializes transaction strictly on the backend endpoint.
 * Price and currency are determined authoritatively by the server.
 */
export const initializeBackendTransaction = async (params: {
  email: string;
  fullName: string;
  phone: string;
  productId?: string;
  channels?: string[];
  website?: string;
}): Promise<BackendInitResponse> => {
  const res = await fetch('/api/paystack/initialize', {
    method: 'POST',
    credentials: 'same-origin',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email: params.email,
      fullName: params.fullName,
      phone: params.phone,
      productId: params.productId || 'herbal-guide-pdf',
      channels: params.channels && params.channels.length > 0 ? params.channels : undefined,
      website: params.website || '',
    }),
  });

  const data = await parseJsonApiResponse(
    res,
    'Payment backend API is unavailable. Please ensure /api/* routes to your backend function.'
  );
  if (!res.ok || !data.success || !data.access_code || !data.reference) {
    throw new Error(data.message || 'Unable to initialize secure payment session.');
  }

  return data;
};

export interface VerifiedTransactionData {
  reference: string;
  status: string;
  amount: number;
  currency: string;
  customerName?: string;
  customerEmail?: string;
  paidAt?: string;
  channel?: string;
}

export interface VerifyResponse {
  success: boolean;
  verified: boolean;
  pending?: boolean;
  requiresEmailConfirmation?: boolean;
  downloadToken?: string;
  downloadExpiresAt?: number;
  message?: string;
  data: VerifiedTransactionData;
}

/**
 * Verifies a transaction strictly on the backend using Paystack's Verify API.
 */
export const verifyPaystackTransaction = async (
  reference: string,
  emailConfirmation?: string
): Promise<VerifyResponse> => {
  const url = emailConfirmation
    ? `/api/paystack/verify/${encodeURIComponent(reference)}?email=${encodeURIComponent(emailConfirmation.trim())}`
    : `/api/paystack/verify/${encodeURIComponent(reference)}`;

  const res = await fetch(url, {
    method: 'GET',
    credentials: 'same-origin',
  });
  const data = await parseJsonApiResponse(
    res,
    'Payment verification backend is unavailable. Please try again or contact support.'
  );

  if (!res.ok) {
    throw new Error(data.message || 'Payment verification failed.');
  }

  return data;
};

/**
 * Downloads a verified PDF via fetch + Blob with automatic token refresh on expiry.
 * Prevents saving error JSON pages as broken .pdf files.
 */
export async function downloadVerifiedPdfFile(params: {
  token: string;
  reference?: string;
  email?: string;
  filename?: string;
  onTokenRefreshed?: (newToken: string, newExpiresAt?: number) => void;
}): Promise<void> {
  let activeToken = params.token;
  if (!activeToken) {
    throw new Error('Download token is missing. Please verify your payment first.');
  }

  let response = await fetch(
    `/api/pdf/download?token=${encodeURIComponent(activeToken)}`,
    { method: 'GET', credentials: 'same-origin' }
  );

  // If short-lived link expired (403) and reference is available, automatically re-verify & refresh token once
  if (response.status === 403 && params.reference) {
    const refreshed = await verifyPaystackTransaction(params.reference, params.email);
    if (refreshed.verified && refreshed.downloadToken) {
      activeToken = refreshed.downloadToken;
      params.onTokenRefreshed?.(refreshed.downloadToken, refreshed.downloadExpiresAt);
      response = await fetch(
        `/api/pdf/download?token=${encodeURIComponent(activeToken)}`,
        { method: 'GET', credentials: 'same-origin' }
      );
    }
  }

  const contentType = (response.headers.get('content-type') || '').toLowerCase();
  if (!response.ok || !contentType.includes('application/pdf')) {
    let errorMessage = 'Unable to download PDF right now. Please try again.';
    try {
      const errJson = await response.json();
      if (typeof errJson?.message === 'string' && errJson.message) {
        errorMessage = errJson.message;
      }
    } catch {
      // ignore non-JSON parse errors
    }
    throw new Error(errorMessage);
  }

  const pdfBlob = await response.blob();
  if (!pdfBlob || pdfBlob.size === 0) {
    throw new Error('Received empty PDF file. Please retry your download.');
  }

  const blobUrl = URL.createObjectURL(pdfBlob);
  const link = document.createElement('a');
  link.href = blobUrl;
  link.download = params.filename || 'Herbal_Guide_Traditional_Wellness_Handbook.pdf';
  link.style.display = 'none';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(blobUrl), 60_000);
}

/**
 * Initiates Paystack Inline payment strictly from a server-generated access_code.
 */
export const initiatePaystackPayment = async ({
  email,
  fullName,
  phone,
  productId = 'herbal-guide-pdf',
  channels,
  honeypot = '',
  onInitialized,
  onLoad,
  onSuccess,
  onClose,
  onError,
}: PaystackTransactionParams): Promise<void> => {
  try {
    const config = await fetchPaystackConfig();
    if (!config.backendReachable || !config.isConfigured || !config.publicKey) {
      throw new Error(
        config.errorMessage || 'Payment gateway is not configured yet. Please contact support.'
      );
    }
    const publicKey = config.publicKey;

    // Strictly initialize transaction on the backend (no insecure client-side fallback)
    const initData = await initializeBackendTransaction({
      email: email.trim(),
      fullName: fullName.trim(),
      phone: phone.trim(),
      productId,
      channels,
      website: honeypot,
    });

    const currentRef = initData.reference;
    const accessCode = initData.access_code;

    onInitialized?.({
      reference: currentRef,
      authorizationUrl: initData.authorization_url,
      channelFallback: initData.channelFallback,
    });

    let PaystackPopModule: any = null;
    try {
      const module = await import('@paystack/inline-js');
      PaystackPopModule = module.default || module;
    } catch {
      // Fallback to v2 CDN inline script
    }

    if (PaystackPopModule && typeof PaystackPopModule === 'function') {
      const popup = new PaystackPopModule();
      popup.resumeTransaction(accessCode, {
        onLoad: () => {
          onLoad?.();
        },
        onSuccess: (transaction: any) => {
          onSuccess({
            reference: transaction?.reference || currentRef,
            status: transaction?.status || 'success',
            trans: transaction?.trans || '',
            message: transaction?.message || 'Completed',
          });
        },
        onCancel: () => {
          if (onClose) onClose();
        },
        onError: (err: any) => {
          const errorObj = new Error(
            err?.message || 'Paystack checkout window could not open. You can use the hosted Paystack link below.'
          );
          (errorObj as any).authorizationUrl = initData.authorization_url;
          if (onError) onError(errorObj);
        },
      });
      return;
    }

    await loadPaystackScript();

    // CDN v2 exposes `new window.PaystackPop()` with `resumeTransaction`
    if (window.PaystackPop && typeof window.PaystackPop === 'function') {
      const popup = new window.PaystackPop();
      if (typeof popup?.resumeTransaction === 'function') {
        popup.resumeTransaction(accessCode, {
          onLoad: () => onLoad?.(),
          onSuccess: (transaction: any) => {
            onSuccess({
              reference: transaction?.reference || currentRef,
              status: transaction?.status || 'success',
              trans: transaction?.trans || '',
              message: transaction?.message || 'Completed',
            });
          },
          onCancel: () => {
            if (onClose) onClose();
          },
          onError: (err: any) => {
            const errorObj = new Error(
              err?.message || 'Paystack checkout window could not open. You can use the hosted Paystack link below.'
            );
            (errorObj as any).authorizationUrl = initData.authorization_url;
            if (onError) onError(errorObj);
          },
        });
        return;
      }
    }

    // Legacy v1 fallback
    if (window.PaystackPop && typeof window.PaystackPop.setup === 'function') {
      const handler = window.PaystackPop.setup({
        key: publicKey,
        access_code: accessCode,
        callback: (response: any) => {
          onSuccess({
            reference: response?.reference || currentRef,
            status: response?.status || 'success',
            trans: response?.trans || '',
            trxref: response?.trxref || currentRef,
            message: response?.message || 'Completed',
          });
        },
        onClose: () => {
          if (onClose) onClose();
        },
      });
      handler.openIframe();
      return;
    }

    const loadErr = new Error(
      'Paystack popup could not be loaded. Use the hosted Paystack checkout link below.'
    );
    (loadErr as any).authorizationUrl = initData.authorization_url;
    throw loadErr;
  } catch (err: any) {
    if (onError) {
      onError(err);
    }
  }
};
