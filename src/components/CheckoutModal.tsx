import React, { useState, useEffect } from 'react';
import {
  X,
  CreditCard,
  CheckCircle,
  Download,
  Lock,
  ArrowRight,
  Loader2,
  ShieldCheck,
  ExternalLink,
  AlertCircle,
  ShoppingBag,
  Sparkles,
  RefreshCw,
} from 'lucide-react';
import {
  fetchPaystackConfig,
  formatPaystackChannelName,
  initiatePaystackPayment,
  verifyPaystackTransaction,
} from '../utils/paystack';

// Official external Selar storefront link
export const SELAR_PURCHASE_URL = 'https://selar.com/452722f141';

const EMAIL_VALIDATION_REGEX =
  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PENDING_ORDER_STORAGE_KEY = 'hg_pending_paystack';

export const CheckoutModal: React.FC<CheckoutModalProps> = ({ isOpen, onClose }) => {
  const [step, setStep] = useState<'details' | 'payment' | 'processing' | 'success'>('details');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [honeypot, setHoneypot] = useState('');
  const [paystackTxRef, setPaystackTxRef] = useState('');
  const [verifiedChannel, setVerifiedChannel] = useState('');
  const [downloadToken, setDownloadToken] = useState('');
  const [downloadExpiresAt, setDownloadExpiresAt] = useState<number | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [isVerifyingPending, setIsVerifyingPending] = useState(false);
  const [fallbackAuthUrl, setFallbackAuthUrl] = useState('');
  const [processingStatus, setProcessingStatus] = useState('Opening secure Paystack gateway...');
  const [isLive, setIsLive] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchPaystackConfig().then((cfg) => {
        setIsLive(cfg.isLiveMode);
      });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleDetailsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = fullName.trim();
    const cleanEmail = email.trim().toLowerCase();
    const digitsOnly = phone.replace(/\D/g, '');

    if (cleanName.length < 2 || !cleanEmail || !phone.trim()) {
      setErrorMsg('Please complete all fields to proceed with your order.');
      return;
    }

    if (!EMAIL_VALIDATION_REGEX.test(cleanEmail) || cleanEmail.length > 254) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }

    if (digitsOnly.length < 10 || digitsOnly.length > 15) {
      setErrorMsg('Please enter a valid Nigerian mobile phone number.');
      return;
    }

    setErrorMsg('');
    setStep('payment');
  };

  const verifyAndUnlockOrder = async (refToVerify: string, silentIfUnpaid = false): Promise<boolean> => {
    const cleanEmail = email.trim().toLowerCase();
    if (!refToVerify) return false;

    setIsVerifyingPending(true);
    try {
      const verifyRes = await verifyPaystackTransaction(refToVerify, cleanEmail);
      if (verifyRes.verified && verifyRes.downloadToken) {
        try {
          sessionStorage.removeItem(PENDING_ORDER_STORAGE_KEY);
        } catch {
          // ignore storage restrictions
        }
        setPaystackTxRef(verifyRes.data.reference || refToVerify);
        setVerifiedChannel(verifyRes.data.channel || '');
        setDownloadToken(verifyRes.downloadToken);
        setDownloadExpiresAt(verifyRes.downloadExpiresAt || null);
        setErrorMsg('');
        setStep('success');

        if (typeof window !== 'undefined') {
          window.dispatchEvent(
            new CustomEvent('herbal_guide_purchase', {
              detail: {
                event: 'purchase',
                product: 'Herbal Guide PDF',
                price: 3000,
                currency: 'NGN',
                reference: verifyRes.data.reference,
                channel: verifyRes.data.channel,
                gateway: 'Paystack',
              },
            })
          );
        }
        return true;
      }

      if (!silentIfUnpaid) {
        setStep('payment');
        setErrorMsg(
          verifyRes.message ||
            'Payment has not been confirmed yet. If you just completed a Bank Transfer, USSD, or OPay payment, wait 10 seconds and click Verify Payment Again.'
        );
      }
      return false;
    } catch (verifyErr: any) {
      if (!silentIfUnpaid) {
        setStep('payment');
        setErrorMsg(
          verifyErr?.message ||
            'Payment verification failed. If you were debited, please click Verify Payment Again or email support.'
        );
      }
      return false;
    } finally {
      setIsVerifyingPending(false);
    }
  };

  const handlePaystackPayment = async () => {
    setErrorMsg('');
    setFallbackAuthUrl('');
    setProcessingStatus('Opening secure Paystack gateway...');
    setStep('processing');

    let activeRef = '';

    try {
      await initiatePaystackPayment({
        email: email.trim().toLowerCase(),
        fullName: fullName.trim(),
        phone: phone.trim(),
        productId: 'herbal-guide-pdf',
        honeypot,
        onInitialized: (info) => {
          if (info.reference) {
            activeRef = info.reference;
            setPaystackTxRef(info.reference);
            try {
              sessionStorage.setItem(
                PENDING_ORDER_STORAGE_KEY,
                JSON.stringify({
                  reference: info.reference,
                  email: email.trim().toLowerCase(),
                })
              );
            } catch {
              // ignore storage restrictions
            }
          }
          if (info.authorizationUrl) setFallbackAuthUrl(info.authorizationUrl);
        },
        onLoad: () => {
          setProcessingStatus('Complete your payment inside Paystack...');
        },
        onSuccess: async (response) => {
          const finalRef = response.reference || response.trxref || activeRef;
          if (!finalRef) {
            setStep('payment');
            setErrorMsg('Could not confirm payment reference. Please contact support.');
            return;
          }

          // Never trust browser callback directly: verify strictly on backend server
          setProcessingStatus('Verifying payment directly with Paystack servers...');
          setStep('processing');
          await verifyAndUnlockOrder(finalRef, false);
        },
        onClose: async () => {
          const refToCheck = activeRef || paystackTxRef;
          if (refToCheck) {
            setProcessingStatus('Checking if your Paystack payment already settled...');
            const unlocked = await verifyAndUnlockOrder(refToCheck, true);
            if (unlocked) return;
          }
          setStep('payment');
          setErrorMsg(
            refToCheck
              ? 'Paystack checkout was closed. If you completed a Bank Transfer, USSD, or OPay transfer, click "Verify Completed Payment" below.'
              : 'Paystack checkout was closed. You can retry anytime.'
          );
        },
        onError: (err: any) => {
          if (err?.authorizationUrl) {
            setFallbackAuthUrl(err.authorizationUrl);
          }
          setStep('payment');
          setErrorMsg(
            typeof err?.message === 'string' && err.message
              ? err.message
              : 'Could not initialize Paystack checkout. Please check your connection and try again.'
          );
        },
      });
    } catch (err: any) {
      setStep('payment');
      setErrorMsg(err?.message || 'Payment initialization error. Please try again.');
    }
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
    <div
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto overscroll-contain"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl sm:rounded-3xl max-w-lg w-full max-h-[92dvh] flex flex-col overflow-hidden shadow-[0_25px_60px_-15px_rgba(6,26,14,0.4)] border border-[#D4AF37]/35 relative my-auto ring-1 ring-[#D4AF37]/20"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="bg-gradient-to-r from-[#061A0E] via-[#0F3822] to-[#061A0E] text-white px-5 sm:px-6 py-3.5 sm:py-4 flex items-center justify-between border-b border-[#D4AF37]/30 shadow-md shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] sm:text-[11px] text-[#F5D061] font-bold tracking-wider uppercase flex items-center gap-1.5">
                <Lock className="w-3 h-3 text-[#D4AF37]" />
                Secure Checkout · Instant Delivery
              </span>
              <span
                className={`text-[9px] sm:text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                  isLive
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/40'
                    : 'bg-amber-500/20 text-amber-300 border-amber-400/40'
                }`}
              >
                {isLive ? '● Live Gateway' : '● Test Mode'}
              </span>
            </div>
            <h3 className="text-base sm:text-lg font-bold font-editorial text-white flex items-center gap-2 mt-0.5">
              <span>Herbal Guide PDF</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-[#D4AF37]/25 text-[#F5D061] border border-[#D4AF37]/50 font-mono font-bold">
                ₦3,000
              </span>
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition-colors cursor-pointer border border-transparent hover:border-[#D4AF37]/30"
            aria-label="Close Checkout"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Modal Body */}
        <div className="overflow-y-auto overscroll-contain flex-1">
          {/* Step 1: Customer Details for Paystack (Top) + Selar Option (Below) */}
          {step === 'details' && (
            <div className="p-4 sm:p-6 sm:p-7 space-y-4">
              <form onSubmit={handleDetailsSubmit} className="space-y-3.5">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-[#0D2818] uppercase tracking-wider flex items-center gap-1.5">
                      <CreditCard className="w-4 h-4 text-[#D4AF37]" />
                      <span>Pay with Paystack (Official Gateway)</span>
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-800 border border-emerald-500/30">
                      Cards · Transfer · USSD · OPay · QR
                    </span>
                  </div>
                  <p className="text-xs text-[#4A6354]">
                    Where should we send your digital PDF download link and Paystack receipt?
                  </p>
                  {errorMsg && (
                    <div className="p-3 mt-2 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{errorMsg}</span>
                    </div>
                  )}
                </div>

                {/* Invisible Honeypot Field for Bot Prevention */}
                <input
                  type="text"
                  name="website"
                  tabIndex={-1}
                  autoComplete="off"
                  value={honeypot}
                  onChange={(e) => setHoneypot(e.target.value)}
                  className="hidden"
                  aria-hidden="true"
                />

                <div>
                  <label className="block text-xs font-semibold text-[#0D2818] mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={100}
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Adebayo Ogunlesi"
                    className="w-full px-4 py-2.5 rounded-xl border border-[#D5CCB6] bg-[#FAF8F5] text-base sm:text-sm text-[#0D2818] focus:bg-white focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#0D2818] mb-1">
                    Email Address (For Paystack Receipt & PDF Delivery)
                  </label>
                  <input
                    type="email"
                    required
                    maxLength={254}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="adebayo@example.com"
                    className="w-full px-4 py-2.5 rounded-xl border border-[#D5CCB6] bg-[#FAF8F5] text-base sm:text-sm text-[#0D2818] focus:bg-white focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#0D2818] mb-1">
                    Mobile Phone Number
                  </label>
                  <input
                    type="tel"
                    required
                    maxLength={20}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="0803 123 4567"
                    className="w-full px-4 py-2.5 rounded-xl border border-[#D5CCB6] bg-[#FAF8F5] text-base sm:text-sm text-[#0D2818] focus:bg-white focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] transition-colors"
                  />
                  <span className="text-[11px] text-[#6B7280] mt-1 block">
                    Used strictly for payment confirmation and receipt verification.
                  </span>
                </div>

                {/* Order Summary Pill */}
                <div className="pt-2.5 border-t border-[#E8DFC7] flex items-center justify-between text-xs bg-[#FAF8F5] -mx-6 sm:-mx-7 px-6 sm:px-7 py-3 my-1">
                  <span className="text-[#4A6354] font-medium">Total Amount to Pay:</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-[#7A8C80] line-through">₦5,000</span>
                    <span className="font-bold text-[#061A0E] text-base tabular-nums text-emerald-900 font-mono">
                      ₦3,000
                    </span>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#D4AF37]/25 text-[#7A6010] border border-[#D4AF37]/40">
                      SAVE 40%
                    </span>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-4 px-5 rounded-xl bg-gradient-to-r from-[#061A0E] via-[#0F3822] to-[#061A0E] text-white font-bold text-sm border border-[#D4AF37]/50 hover:border-[#F5D061] hover:-translate-y-0.5 hover:shadow-[0_10px_25px_rgba(212,175,55,0.25)] active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
                >
                  <Lock className="w-4 h-4 text-[#F5D061]" />
                  <span>Continue to Pay ₦3,000 with Paystack</span>
                  <ArrowRight className="w-4 h-4 text-[#F5D061]" />
                </button>
              </form>

              {/* Divider */}
              <div className="relative flex py-1 items-center">
                <div className="flex-grow border-t border-[#E8DFC7]"></div>
                <span className="flex-shrink mx-3 text-[11px] uppercase tracking-wider text-[#7A8C80] font-semibold">
                  Or Alternative Payment
                </span>
                <div className="flex-grow border-t border-[#E8DFC7]"></div>
              </div>

              {/* Option Below: Buy on Selar */}
              <div className="p-3.5 rounded-2xl bg-gradient-to-r from-[#FAF4E6] via-[#FFFDF8] to-[#F5EEDC] border border-[#D4AF37]/50 shadow-xs">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-[#061A0E] text-[#F5D061] flex items-center justify-center shrink-0 border border-[#D4AF37]/40 shadow-xs">
                      <ShoppingBag className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-[#061A0E]">Prefer to Buy on Selar?</span>
                        <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-amber-500/15 text-[#8B6E14]">
                          ₦3,000
                        </span>
                      </div>
                      <p className="text-[11px] text-[#556D5F]">
                        Instant checkout & international cards supported.
                      </p>
                    </div>
                  </div>
                  <a
                    href={SELAR_PURCHASE_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-2 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#B89025] hover:from-[#E2BF48] hover:to-[#C79E30] text-[#061A0E] font-bold text-xs shrink-0 flex items-center gap-1 shadow-xs hover:shadow-md transition-all active:scale-95"
                  >
                    <span>Buy on Selar</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Payment Step (Paystack Gateway + Selar Option) */}
          {step === 'payment' && (
            <div className="p-6 sm:p-7 space-y-4">
              <div className="flex items-center justify-between text-xs text-[#4A6354] pb-2 border-b border-[#E8DFC7]">
                <span>
                  Customer: <strong>{fullName}</strong>
                </span>
                <span className="font-mono text-[#061A0E]">{email.trim().toLowerCase()}</span>
              </div>

              {errorMsg && (
                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
                  <div className="flex-1">
                    <span>{errorMsg}</span>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between">
                <p className="text-xs font-bold text-[#0D2818] uppercase tracking-wider">
                  Choose Payment Method:
                </p>
              </div>

              {/* Option A: Paystack Payment Gateway Card */}
              <div className="p-4.5 rounded-2xl border-2 border-[#D4AF37] bg-gradient-to-br from-[#FAF8F5] via-[#FDFBF7] to-[#F5EEDC] shadow-sm ring-1 ring-[#D4AF37]/30 space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-bold text-[#0D2818] flex items-center gap-2">
                    <CreditCard className="w-4.5 h-4.5 text-[#D4AF37]" />
                    <span>Option 1: Paystack Checkout</span>
                  </span>
                  <span className="text-[10px] font-bold text-[#061A0E] bg-[#D4AF37]/25 border border-[#D4AF37]/40 px-2 py-0.5 rounded-full">
                    Cards · Transfer · USSD
                  </span>
                </div>

                <p className="text-xs text-[#4A6354] leading-relaxed">
                  Pay safely via Debit/Credit Card, Bank Transfer, USSD, Bank Account, OPay/Mobile Money, QR, or Apple/Google Pay inside Paystack.
                </p>

                <div className="pt-1 flex items-center justify-between text-xs">
                  <span className="text-[#6E8576]">Price:</span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs text-[#7A8C80] line-through">₦5,000</span>
                    <span className="text-base font-bold text-emerald-900 font-mono">
                      ₦3,000 NGN
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handlePaystackPayment}
                  className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-[#061A0E] via-[#0F3822] to-[#061A0E] text-white font-bold text-sm border border-[#D4AF37]/50 hover:border-[#F5D061] hover:-translate-y-0.5 hover:shadow-[0_10px_25px_rgba(212,175,55,0.25)] active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
                >
                  <Lock className="w-4 h-4 text-[#F5D061]" />
                  <span>Pay ₦3,000 with Paystack</span>
                </button>

                {paystackTxRef && (
                  <button
                    type="button"
                    disabled={isVerifyingPending}
                    onClick={() => verifyAndUnlockOrder(paystackTxRef, false)}
                    className="w-full py-2.5 px-4 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 font-bold text-xs hover:bg-emerald-100 transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-60"
                  >
                    <RefreshCw
                      className={`w-3.5 h-3.5 ${isVerifyingPending ? 'animate-spin' : ''}`}
                    />
                    <span>
                      {isVerifyingPending
                        ? 'Checking Paystack Confirmation...'
                        : 'Already Paid via Transfer / USSD / OPay? Verify Now'}
                    </span>
                  </button>
                )}

                {fallbackAuthUrl && (
                  <a
                    href={fallbackAuthUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-2.5 px-4 rounded-xl bg-white border border-[#D4AF37] text-[#061A0E] font-semibold text-xs hover:bg-[#FAF8F5] transition-all flex items-center justify-center gap-1.5"
                  >
                    <ExternalLink className="w-3.5 h-3.5 text-[#B89025]" />
                    <span>Open Hosted Paystack Checkout Page</span>
                  </a>
                )}
              </div>

              {/* Option B: Selar Purchase Card */}
              <div className="p-4.5 rounded-2xl border border-[#D5CCB6] bg-white hover:border-[#D4AF37] transition-all space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-[#0D2818] flex items-center gap-2">
                    <ShoppingBag className="w-4.5 h-4.5 text-[#B89025]" />
                    <span>Option 2: Buy on Selar</span>
                  </span>
                  <span className="text-[10px] font-bold text-[#8B6E14] bg-[#F5EEDC] border border-[#D4AF37]/30 px-2 py-0.5 rounded-full">
                    ₦3,000 · Selar Official
                  </span>
                </div>
                <p className="text-xs text-[#4A6354] leading-relaxed">
                  Prefer using Selar? Access Prince Emmanuel&apos;s verified Selar product page for instant checkout.
                </p>
                <a
                  href={SELAR_PURCHASE_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#B89025] hover:from-[#E2BF48] hover:to-[#C79E30] text-[#061A0E] font-bold text-xs flex items-center justify-center gap-2 shadow-xs hover:shadow-md transition-all active:scale-[0.99] cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Open Selar Checkout (₦3,000)</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>

              {/* Navigation back and security info */}
              <div className="pt-1 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setStep('details')}
                  className="text-xs font-semibold text-[#0D2818] hover:underline cursor-pointer"
                >
                  ← Edit Customer Details
                </button>
              </div>

              <p className="text-[11px] text-center text-[#6B7280] flex items-center justify-center gap-1.5 pt-1">
                <ShieldCheck className="w-3.5 h-3.5 text-[#256F4A]" />
                <span>PCI-DSS Level 1 Certified · Secured by Paystack Nigeria</span>
              </p>
            </div>
          )}

          {/* Step: Processing / Server Verification State */}
          {step === 'processing' && (
            <div className="p-10 text-center space-y-4">
              <Loader2 className="w-12 h-12 text-[#D4AF37] animate-spin mx-auto" />
              <h4 className="text-lg font-bold text-[#0D2818]">{processingStatus}</h4>
              <p className="text-xs text-[#4A6354] max-w-xs mx-auto leading-relaxed">
                Please wait while we verify your secure Paystack session.
              </p>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setStep('payment')}
                  className="text-xs text-[#7A8C80] underline hover:text-[#061A0E] cursor-pointer"
                >
                  Return to payment choices
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Success & Authenticated Short-Lived PDF Access */}
          {step === 'success' && (
            <div className="p-6 sm:p-7 space-y-4 text-center">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#061A0E] to-[#0F3822] text-[#F5D061] border border-[#D4AF37]/50 flex items-center justify-center mx-auto shadow-[0_0_25px_rgba(212,175,55,0.3)]">
                <CheckCircle className="w-9 h-9 text-[#F5D061]" />
              </div>

              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>
                    Verified via {formatPaystackChannelName(verifiedChannel)}
                  </span>
                </div>
                <h4 className="text-xl sm:text-2xl font-serif font-bold text-[#0D2818] mt-2 font-editorial">
                  Thank You, {fullName}!
                </h4>
                <p className="text-xs sm:text-sm text-[#4A6354] mt-1 max-w-sm mx-auto">
                  Your payment of <strong>₦3,000</strong> has been verified. Your copy of{' '}
                  <strong>Herbal Guide</strong> is ready to download to your device now.
                </p>
                <div className="mt-2 text-[11px] font-mono text-[#6E8576]">
                  Transaction Ref: <strong className="text-[#061A0E]">{paystackTxRef}</strong>
                </div>
                <div className="mt-1 text-[11px] text-[#7A8C80]">
                  Secure download link expires in {expiryMinutes} minutes.
                </div>
              </div>

              {/* Authenticated PDF Download & Inline Reader */}
              <div className="space-y-2.5 pt-2">
                <a
                  href={downloadPdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-disabled={!downloadToken}
                  onClick={(e) => {
                    if (!downloadToken) e.preventDefault();
                  }}
                  className={`w-full py-4 px-4 rounded-xl bg-gradient-to-r from-[#061A0E] via-[#0F3822] to-[#061A0E] text-white font-bold text-sm border-2 border-[#D4AF37] hover:border-[#F5D061] hover:-translate-y-0.5 hover:shadow-[0_12px_30px_rgba(212,175,55,0.35)] transition-all flex items-center justify-center gap-2.5 cursor-pointer shadow-md ${
                    !downloadToken ? 'opacity-60 pointer-events-none' : ''
                  }`}
                >
                  <Download className="w-5 h-5 text-[#F5D061]" />
                  <span>Download PDF Handbook to Your Device</span>
                </a>

                <a
                  href={inlinePdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3 px-4 rounded-xl bg-white border border-[#D4AF37] hover:bg-[#FAF8F5] text-[#061A0E] font-bold text-xs hover:-translate-y-0.5 hover:shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <ExternalLink className="w-4 h-4 text-[#B89025]" />
                  <span>Open Official PDF in Browser</span>
                </a>

                <a
                  href={`/payment-success?reference=${encodeURIComponent(paystackTxRef)}`}
                  className="w-full py-2.5 px-4 rounded-xl border border-[#D5CCB6] text-xs font-semibold text-[#4A6354] hover:bg-[#FAF8F5] hover:text-[#061A0E] transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-[#D4AF37]" />
                  <span>View Full Verified Server Receipt</span>
                </a>
              </div>

              <div className="pt-2 border-t border-[#E8DFC7] text-xs text-[#6B7280]">
                Need assistance? Email support directly at{' '}
                <a
                  href="mailto:aladesunloyeemmanuel@gmail.com"
                  className="font-semibold text-[#133E28] underline"
                >
                  aladesunloyeemmanuel@gmail.com
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
