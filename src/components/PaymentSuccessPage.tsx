import React, { useEffect, useState } from 'react';
import {
  CheckCircle,
  Download,
  ShieldCheck,
  ArrowLeft,
  RefreshCw,
  AlertCircle,
  FileText,
  Calendar,
  CreditCard,
  Mail,
  Lock,
  ExternalLink,
} from 'lucide-react';
import {
  formatPaystackChannelName,
  verifyPaystackTransaction,
  VerifiedTransactionData,
} from '../utils/paystack';

interface PaymentSuccessPageProps {
  onBackToHome: () => void;
}

export const PaymentSuccessPage: React.FC<PaymentSuccessPageProps> = ({ onBackToHome }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [txData, setTxData] = useState<VerifiedTransactionData | null>(null);
  const [reference, setReference] = useState('');
  const [downloadToken, setDownloadToken] = useState('');
  const [downloadExpiresAt, setDownloadExpiresAt] = useState<number | null>(null);
  const [requiresEmailConfirm, setRequiresEmailConfirm] = useState(false);
  const [confirmEmail, setConfirmEmail] = useState('');
  const [isPendingTransfer, setIsPendingTransfer] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ref = params.get('reference') || params.get('trxref') || '';
    setReference(ref);

    if (!ref) {
      setError('No transaction reference found in the URL. Please verify your payment receipt.');
      setLoading(false);
      return;
    }

    verifyTransaction(ref);
  }, []);

  const verifyTransaction = async (ref: string, emailOverride?: string) => {
    setLoading(true);
    setError(null);

    try {
      const res = await verifyPaystackTransaction(ref, emailOverride);

      if (res.success && res.verified) {
        setIsPendingTransfer(false);
        setTxData(res.data);
        setRequiresEmailConfirm(Boolean(res.requiresEmailConfirmation));
        if (res.downloadToken) {
          setDownloadToken(res.downloadToken);
          setDownloadExpiresAt(res.downloadExpiresAt || null);
        }
      } else {
        setIsPendingTransfer(Boolean(res.pending));
        setError(
          res.message ||
            'We could not verify this transaction with Paystack. Please contact support.'
        );
      }
    } catch (err: any) {
      setError(err?.message || 'Unable to connect to Paystack verification server.');
    } finally {
      setLoading(false);
    }
  };

  const handleEmailConfirmSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reference || !confirmEmail.trim()) return;
    verifyTransaction(reference, confirmEmail.trim());
  };

  const downloadPdfUrl = downloadToken
    ? `/api/pdf/download?token=${encodeURIComponent(downloadToken)}`
    : '#';

  const inlinePdfUrl = downloadToken
    ? `/api/pdf/download?token=${encodeURIComponent(downloadToken)}&disposition=inline`
    : '#';

  const expiryMinutes = downloadExpiresAt
    ? Math.max(1, Math.round((downloadExpiresAt - Date.now()) / 60000))
    : 30;

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#061A0E] flex flex-col justify-between">
      {/* Top Navigation Bar */}
      <header className="border-b border-[#D4AF37]/30 bg-gradient-to-r from-[#061A0E] via-[#0F3822] to-[#061A0E] text-white py-4 px-4 sm:px-8 shadow-md">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <button
            type="button"
            onClick={onBackToHome}
            className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-[#E8DFC7] hover:text-[#F5D061] transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Herbal Guide</span>
          </button>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs text-[#F5D061] font-mono tracking-wider uppercase font-bold">
              Paystack Secure Verification
            </span>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-3xl w-full mx-auto p-4 sm:p-8 my-auto">
        {loading && (
          <div className="bg-white rounded-3xl p-10 sm:p-14 border border-[#D4AF37]/35 shadow-xl text-center space-y-4">
            <RefreshCw className="w-12 h-12 text-[#D4AF37] animate-spin mx-auto" />
            <h2 className="text-2xl font-bold font-editorial text-[#061A0E]">
              Verifying Your Paystack Payment...
            </h2>
            <p className="text-sm text-[#4A6354] max-w-md mx-auto leading-relaxed">
              We are verifying transaction reference{' '}
              <span className="font-mono font-bold text-[#061A0E]">{reference}</span> directly
              with Paystack&apos;s secure servers.
            </p>
          </div>
        )}

        {!loading && error && (
          <div className="bg-white rounded-3xl p-8 sm:p-12 border border-red-200 shadow-xl text-center space-y-5">
            <div className="w-16 h-16 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto">
              <AlertCircle className="w-9 h-9" />
            </div>
            <div>
              <h2 className="text-2xl font-bold font-editorial text-[#061A0E]">
                {isPendingTransfer ? 'Confirming Your Transfer / Payment...' : 'Payment Verification Notice'}
              </h2>
              <p className="text-sm text-[#4A6354] mt-2 max-w-md mx-auto leading-relaxed">
                {error}
              </p>
              {reference && (
                <div className="mt-3 p-3 rounded-xl bg-gray-50 border border-gray-200 text-xs font-mono text-gray-700 max-w-sm mx-auto">
                  Reference: <strong>{reference}</strong>
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-3">
              <button
                type="button"
                onClick={() => verifyTransaction(reference, confirmEmail || undefined)}
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#061A0E] text-white text-xs sm:text-sm font-bold hover:bg-[#0F3822] transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-md"
              >
                <RefreshCw className="w-4 h-4" />
                <span>{isPendingTransfer ? 'Check Transfer Confirmation Now' : 'Retry Verification'}</span>
              </button>

              <a
                href={`mailto:aladesunloyeemmanuel@gmail.com?subject=${encodeURIComponent(
                  `Payment verification inquiry (Ref: ${reference || 'Pending'})`
                )}`}
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-white border border-[#D5CCB6] text-[#061A0E] text-xs sm:text-sm font-bold hover:bg-[#FAF8F5] hover:border-[#D4AF37] transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs"
              >
                <Mail className="w-4 h-4" />
                <span>Email Support</span>
              </a>
            </div>
          </div>
        )}

        {!loading && txData && (
          <div className="bg-white rounded-3xl overflow-hidden border border-[#D4AF37]/35 shadow-[0_25px_60px_-15px_rgba(6,26,14,0.3)] ring-1 ring-[#D4AF37]/20">
            {/* Success Banner */}
            <div className="bg-gradient-to-r from-[#061A0E] via-[#0F3822] to-[#061A0E] text-white p-6 sm:p-8 text-center relative border-b border-[#D4AF37]/30">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#D4AF37] to-[#996515] text-[#061A0E] flex items-center justify-center mx-auto shadow-[0_0_30px_rgba(212,175,55,0.4)] mb-4">
                <CheckCircle className="w-10 h-10 text-[#061A0E]" />
              </div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#D4AF37]/20 text-[#F5D061] border border-[#D4AF37]/40 text-xs font-bold mb-2">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Paystack Transaction Verified</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold font-editorial text-white">
                Payment Successful!
              </h1>
              <p className="text-xs sm:text-sm text-[#E8DFC7] mt-1 max-w-md mx-auto">
                Thank you{txData.customerName ? `, ${txData.customerName}` : ''}. Your payment for{' '}
                <strong>Herbal Guide</strong> has been securely confirmed by Paystack.
              </p>
            </div>

            {/* Receipt Summary Card */}
            <div className="p-6 sm:p-8 space-y-6">
              <div className="bg-[#FAF8F5] rounded-2xl border border-[#E8DFC7] p-5 space-y-3.5 text-xs sm:text-sm">
                <div className="flex items-center justify-between pb-3 border-b border-[#E8DFC7]">
                  <span className="text-[#6E8576] flex items-center gap-2">
                    <FileText className="w-4 h-4 text-[#D4AF37]" />
                    <span>Product Purchased</span>
                  </span>
                  <span className="font-bold text-[#061A0E]">Herbal Guide Digital PDF</span>
                </div>

                <div className="flex items-center justify-between pb-3 border-b border-[#E8DFC7]">
                  <span className="text-[#6E8576] flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-[#D4AF37]" />
                    <span>Amount Paid</span>
                  </span>
                  <span className="font-bold text-emerald-900 text-base">
                    ₦{txData.amount ? txData.amount.toLocaleString() : '3,000'} NGN
                  </span>
                </div>

                {txData.channel && (
                  <div className="flex items-center justify-between pb-3 border-b border-[#E8DFC7]">
                    <span className="text-[#6E8576] flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-[#D4AF37]" />
                      <span>Payment Option Used</span>
                    </span>
                    <span className="font-semibold text-[#061A0E]">
                      {formatPaystackChannelName(txData.channel)}
                    </span>
                  </div>
                )}

                <div className="flex items-center justify-between pb-3 border-b border-[#E8DFC7]">
                  <span className="text-[#6E8576] flex items-center gap-2">
                    <Lock className="w-4 h-4 text-[#D4AF37]" />
                    <span>Paystack Reference</span>
                  </span>
                  <span className="font-mono font-bold text-[#061A0E] text-xs sm:text-sm break-all">
                    {txData.reference}
                  </span>
                </div>

                {txData.customerEmail && (
                  <div className="flex items-center justify-between pb-3 border-b border-[#E8DFC7]">
                    <span className="text-[#6E8576] flex items-center gap-2">
                      <Mail className="w-4 h-4 text-[#D4AF37]" />
                      <span>Receipt Sent To</span>
                    </span>
                    <span className="font-medium text-[#061A0E]">{txData.customerEmail}</span>
                  </div>
                )}

                {txData.paidAt && (
                  <div className="flex items-center justify-between">
                    <span className="text-[#6E8576] flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-[#D4AF37]" />
                      <span>Verification Timestamp</span>
                    </span>
                    <span className="text-[#061A0E]">
                      {new Date(txData.paidAt).toLocaleString('en-GB', {
                        dateStyle: 'medium',
                        timeStyle: 'short',
                      })}
                    </span>
                  </div>
                )}
              </div>

              {/* IDOR Ownership Confirmation if opened from a different browser/device */}
              {requiresEmailConfirm && !downloadToken && (
                <form
                  onSubmit={handleEmailConfirmSubmit}
                  className="p-5 rounded-2xl bg-[#FAF4E6] border border-[#D4AF37]/60 space-y-3"
                >
                  <div className="text-xs sm:text-sm font-bold text-[#061A0E] flex items-center gap-2">
                    <Lock className="w-4 h-4 text-[#D4AF37]" />
                    <span>Confirm Checkout Email to Unlock PDF Download</span>
                  </div>
                  <p className="text-xs text-[#4A6354]">
                    For your security, please enter the email address you used during payment to generate your 30-minute download link.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-2.5">
                    <input
                      type="email"
                      required
                      value={confirmEmail}
                      onChange={(e) => setConfirmEmail(e.target.value)}
                      placeholder="Enter checkout email address"
                      className="flex-1 px-4 py-2.5 rounded-xl border border-[#D5CCB6] bg-white text-sm text-[#061A0E]"
                    />
                    <button
                      type="submit"
                      className="px-5 py-2.5 rounded-xl bg-[#061A0E] text-[#F5D061] font-bold text-xs sm:text-sm hover:bg-[#0F3822] transition-colors cursor-pointer"
                    >
                      Unlock Download
                    </button>
                  </div>
                </form>
              )}

              {/* Authenticated Action Buttons */}
              {downloadToken && (
                <div className="space-y-3 pt-2">
                  <a
                    href={downloadPdfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-4.5 px-6 rounded-2xl bg-gradient-to-r from-[#061A0E] via-[#0F3822] to-[#061A0E] text-white font-bold text-sm sm:text-base border-2 border-[#D4AF37]/80 hover:border-[#F5D061] hover:-translate-y-0.5 hover:shadow-[0_12px_35px_rgba(212,175,55,0.4)] transition-all flex items-center justify-center gap-3 cursor-pointer shadow-lg"
                  >
                    <Download className="w-5 h-5 text-[#F5D061]" />
                    <span>Download PDF Handbook to Your Device</span>
                  </a>

                  <a
                    href={inlinePdfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-4 px-6 rounded-2xl bg-white border border-[#D4AF37] hover:bg-[#FAF8F5] text-[#061A0E] font-bold text-sm sm:text-base hover:-translate-y-0.5 hover:shadow-xs transition-all flex items-center justify-center gap-2.5 cursor-pointer shadow-xs"
                  >
                    <ExternalLink className="w-5 h-5 text-[#B89025]" />
                    <span>Open Official PDF in Browser</span>
                  </a>

                  <p className="text-[11px] text-center text-[#6E8576]">
                    Secure download link expires in {expiryMinutes} minutes. Need a fresh link? Refresh this page to re-verify.
                  </p>
                </div>
              )}

              {/* Support footnote */}
              <div className="pt-4 border-t border-[#E8DFC7] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#6E8576]">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-[#D4AF37]" />
                  <span>
                    Need help with your download? Email{' '}
                    <a
                      href="mailto:aladesunloyeemmanuel@gmail.com"
                      className="font-semibold text-[#061A0E] underline"
                    >
                      aladesunloyeemmanuel@gmail.com
                    </a>
                  </span>
                </div>
                <button
                  type="button"
                  onClick={onBackToHome}
                  className="font-semibold text-[#061A0E] hover:underline cursor-pointer"
                >
                  Back to Homepage
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer copyright */}
      <footer className="text-center py-6 text-xs text-[#7A8C80] border-t border-[#E8DFC7]">
        <span>
          © {new Date().getFullYear()} Herbal Guide · Authored by Prince Emmanuel · Powered by Paystack Nigeria
        </span>
      </footer>
    </div>
  );
};
