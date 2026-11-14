/**
 * Client-Side Database Security Boundary Notice
 *
 * Direct browser-to-database order writes, reads, and download logging have been
 * intentionally removed to prevent price tampering, fake payment confirmations,
 * and customer PII leaks via public anon keys.
 *
 * All order persistence, Paystack verification, and download audit logs are
 * executed exclusively on the trusted Node.js backend using service_role credentials.
 */

export const isServerManagedDatabase = true;
