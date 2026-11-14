import React from 'react';
import { 
  Check, 
  Download, 
  Smartphone, 
  CreditCard, 
  ShieldCheck, 
  Headphones, 
  ArrowRight,
  FileCheck,
  Mail,
  Sparkles,
  Lock
} from 'lucide-react';

interface OfferSectionProps {
  onOpenCheckout: () => void;
}

export const OfferSection: React.FC<OfferSectionProps> = ({ onOpenCheckout }) => {
  return (
    <section id="pricing" className="py-20 md:py-28 bg-gradient-to-b from-[#FAF8F5] via-white to-[#FAF8F5] border-t border-[#D4AF37]/30 relative overflow-hidden">
      {/* Radiant ambient glow orb */}
      <div aria-hidden="true" className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[48rem] h-[34rem] bg-gradient-to-tr from-[#D4AF37]/20 via-[#0B351E]/15 to-transparent rounded-full blur-3xl pointer-events-none -z-10 animate-ambient-float" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-[#D4AF37]/70 text-xs font-bold text-[#8B6E16] uppercase tracking-wider mb-4 shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>Official Digital Edition · Instant Delivery</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-[2.8rem] font-serif font-bold text-[#061A0E] tracking-tight font-editorial leading-[1.18]">
            Get Your Copy of <span className="gold-gradient-text italic font-serif">Herbal Guide</span> Today
          </h2>
          <p className="mt-3 text-base md:text-lg text-[#1E3A2B] leading-relaxed max-w-xl mx-auto font-normal">
            An authoritative educational handbook for understanding traditional botanical wellness, 
            safe preparation, and responsible home care for all 29 conditions.
          </p>
        </div>

        {/* The Luxury Purchase Box */}
        <div className="bg-white/95 backdrop-blur-xl rounded-3xl border-2 border-[#D4AF37] p-6 sm:p-10 lg:p-12 shadow-[0_25px_70px_rgba(4,21,11,0.16)] relative overflow-hidden">
          {/* Top Decorative Gold Banner */}
          <div className="absolute top-0 right-0 bg-gradient-to-r from-[#D4AF37] via-[#FFF4CC] to-[#D4AF37] text-[#061A0E] px-6 py-2.5 rounded-bl-2xl text-xs sm:text-sm font-extrabold tracking-wider uppercase shadow-md flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#061A0E] animate-ping" />
            <span>Instant Digital Access · Nigeria</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
            {/* Left: Product & Inclusions */}
            <div className="lg:col-span-7 space-y-6">
              <div>
                <span className="text-xs sm:text-sm font-mono font-semibold text-[#8B6E16] tracking-wider uppercase">
                  Digital E-Book Edition
                </span>
                <h3 className="text-2xl sm:text-3xl font-serif font-bold text-[#061A0E] mt-1 font-editorial">
                  Herbal Guide: Traditional Wellness & Home Care Handbook
                </h3>
                <p className="mt-2.5 text-sm sm:text-base text-[#1E3A2B] leading-relaxed">
                  Authored by Prince Emmanuel. A structured educational handbook covering 
                  botanical profiles, infusion temperatures, critical safety cautions, and lifestyle practices.
                </p>
              </div>

              {/* What Buyer Receives */}
              <div className="space-y-3.5 pt-2">
                <h4 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-[#061A0E]">
                  What You Receive Immediately:
                </h4>
                <ul className="space-y-3 text-sm sm:text-base text-[#1E3A2B]">
                  <li className="flex items-start gap-3">
                    <span className="w-5 h-5 rounded-full bg-[#D4AF37]/20 border border-[#D4AF37]/50 flex items-center justify-center shrink-0 mt-0.5">
                      <Check className="w-3.5 h-3.5 text-[#B89223]" />
                    </span>
                    <span>
                      <strong className="text-[#061A0E]">Complete digital PDF handbook:</strong> High-resolution, readable on all mobile phones, tablets, and laptops.
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-5 h-5 rounded-full bg-[#D4AF37]/20 border border-[#D4AF37]/50 flex items-center justify-center shrink-0 mt-0.5">
                      <Check className="w-3.5 h-3.5 text-[#B89223]" />
                    </span>
                    <span>
                      <strong className="text-[#061A0E]">All 29 Ailments Detailed:</strong> Exact preparation steps, water ratios, and morning/evening timetable.
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-5 h-5 rounded-full bg-[#D4AF37]/20 border border-[#D4AF37]/50 flex items-center justify-center shrink-0 mt-0.5">
                      <Check className="w-3.5 h-3.5 text-[#B89223]" />
                    </span>
                    <span>
                      <strong className="text-[#061A0E]">Printable Quick-Reference Chart:</strong> For handy kitchen or bedside consultation.
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-5 h-5 rounded-full bg-[#D4AF37]/20 border border-[#D4AF37]/50 flex items-center justify-center shrink-0 mt-0.5">
                      <Check className="w-3.5 h-3.5 text-[#B89223]" />
                    </span>
                    <span>
                      <strong className="text-[#061A0E]">Direct Device Download & Google Drive Access:</strong> Permanent lifetime ownership.
                    </span>
                  </li>
                </ul>
              </div>

              {/* Delivery Guarantee Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2 text-xs sm:text-sm">
                <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#E8DFC7]/80 hover:border-[#D4AF37]/50 transition-colors">
                  <div className="flex items-center gap-2 font-bold text-[#061A0E] mb-1">
                    <Download className="w-4 h-4 text-[#D4AF37]" />
                    <span>Instant Delivery</span>
                  </div>
                  <p className="text-[#2E4A38] leading-relaxed">
                    Automated download to your phone & official Google Drive link upon checkout.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#E8DFC7]/80 hover:border-[#D4AF37]/50 transition-colors">
                  <div className="flex items-center gap-2 font-bold text-[#061A0E] mb-1">
                    <CreditCard className="w-4 h-4 text-[#D4AF37]" />
                    <span>Payment Options</span>
                  </div>
                  <p className="text-[#2E4A38] leading-relaxed">
                    Secured by <strong>Paystack &amp; Selar</strong> (Debit/Credit Cards, Bank Transfer, USSD, Bank Account, OPay/Mobile Money, QR &amp; Apple/Google Pay).
                  </p>
                </div>
              </div>
            </div>

            {/* Right: Luxury Price Box & CTA */}
            <div className="lg:col-span-5 bg-gradient-to-b from-[#FAF8F5] to-[#F4EFE6] rounded-3xl p-6 sm:p-8 border-2 border-[#D4AF37]/70 shadow-[0_12px_35px_rgba(212,175,55,0.22)] flex flex-col justify-between h-full">
              <div>
                <div className="text-center pb-6 border-b border-[#E8DFC7]">
                  <span className="text-xs sm:text-sm text-[#7A8C80] uppercase tracking-wider font-bold">
                    Special Introductory Price
                  </span>
                  <div className="flex items-center justify-center gap-2 mt-2">
                    <span className="text-4xl sm:text-5xl lg:text-6xl font-bold text-[#061A0E] tabular-nums font-editorial tracking-tight">
                      ₦3,000
                    </span>
                  </div>
                  <div className="flex items-center justify-center gap-2.5 mt-2 text-xs sm:text-sm text-[#7A8C80]">
                    <span className="line-through tabular-nums decoration-[#D4AF37]/70 text-base">Regular: ₦5,000</span>
                    <span className="text-[#061A0E] font-bold bg-gradient-to-r from-[#F5D061] via-[#FFF4CC] to-[#D4AF37] border border-[#D4AF37] px-3.5 py-0.5 rounded-full shadow-xs">
                      Save ₦2,000 (40% OFF)
                    </span>
                  </div>
                </div>

                <div className="mt-6 space-y-3.5 text-xs sm:text-sm text-[#2E4A38]">
                  <div className="flex items-center gap-2.5">
                    <Smartphone className="w-4 h-4 text-[#D4AF37] shrink-0" />
                    <span>Instant access on Android & iPhone</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <FileCheck className="w-4 h-4 text-[#D4AF37] shrink-0" />
                    <span>Universal PDF digital format</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <ShieldCheck className="w-4 h-4 text-[#D4AF37] shrink-0" />
                    <span>Safe 256-bit encrypted checkout</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Headphones className="w-4 h-4 text-[#D4AF37] shrink-0" />
                    <span>Dedicated email support for all readers</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons: Paystack on Top, Selar Below */}
              <div className="mt-8 space-y-2.5">
                <button
                  type="button"
                  onClick={onOpenCheckout}
                  className="group relative w-full py-4.5 px-6 text-base md:text-lg font-bold text-white bg-gradient-to-r from-[#04150B] via-[#0B351E] to-[#04150B] rounded-2xl border-2 border-[#D4AF37]/90 hover:border-[#F5D061] hover:from-[#082213] hover:via-[#134D2C] hover:to-[#082213] hover:-translate-y-1 hover:shadow-[0_14px_40px_rgba(212,175,55,0.5)] hover:brightness-105 active:translate-y-0 active:scale-[0.98] transition-all duration-300 ease-out flex items-center justify-center gap-3 cursor-pointer shadow-[0_10px_30px_rgba(4,21,11,0.4)] overflow-hidden"
                >
                  {/* Shimmer sweep effect */}
                  <div 
                    aria-hidden="true" 
                    className="absolute inset-0 -translate-x-full group-hover:translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent transition-transform duration-700 ease-in-out pointer-events-none" 
                  />
                  <span className="relative z-10 tracking-wide">Pay with Paystack · ₦3,000</span>
                  <ArrowRight className="relative z-10 w-5 h-5 text-[#F5D061] group-hover:translate-x-1.5 transition-transform duration-200 ease-out" />
                </button>

                <a
                  href="https://selar.com/452722f141"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-[#FAF4E6] to-[#F5EEDC] hover:from-[#F5EEDC] hover:to-[#EBDDBE] border border-[#D4AF37]/70 text-[#061A0E] font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-xs hover:shadow-md"
                >
                  <span>Or Buy on Selar (Instant Access · ₦3,000)</span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#B89025]" />
                </a>

                <div className="mt-3 space-y-1 text-center">
                  <p className="text-xs text-[#4A6354] font-medium flex items-center justify-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Instant Automated Access via <strong>Paystack & Selar</strong></span>
                  </p>
                  <p className="text-[11px] text-[#7A8C80]">
                    Accepting Cards, Bank Transfer, USSD, Bank Account, OPay, QR &amp; Wallets
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Customer Support Strip */}
          <div className="mt-8 pt-5 border-t border-[#E8DFC7] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#4A6354]">
            <div className="flex items-center gap-2">
              <Headphones className="w-4 h-4 text-[#0B351E]" />
              <span>Need help before purchasing? Email our reader support team:</span>
            </div>
            <a
              href="mailto:aladesunloyeemmanuel@gmail.com"
              className="font-bold text-[#0B351E] hover:underline inline-flex items-center gap-1.5"
            >
              <Mail className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>aladesunloyeemmanuel@gmail.com</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};
