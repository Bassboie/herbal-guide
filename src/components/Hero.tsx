import React from 'react';
import { ArrowRight, CheckCircle2, ShieldCheck } from 'lucide-react';
import bookMockupImg from '../assets/images/herbal_guide_book_mockup_1791632584838.jpg';

interface HeroProps {
  onOpenCheckout: () => void;
}

export const Hero: React.FC<HeroProps> = ({
  onOpenCheckout,
}) => {
  return (
    <section id="overview" className="relative pt-10 pb-16 md:pt-20 md:pb-28 overflow-hidden">
      {/* Background luxury radiant lighting orbs */}
      <div 
        aria-hidden="true" 
        className="absolute top-0 right-1/4 w-[36rem] h-[36rem] bg-gradient-to-br from-[#D4AF37]/25 via-[#258151]/20 to-transparent rounded-full blur-3xl pointer-events-none -z-10 animate-ambient-float" 
      />
      <div 
        aria-hidden="true" 
        className="absolute -bottom-24 left-10 w-[28rem] h-[28rem] bg-gradient-to-tr from-[#D4AF37]/20 via-[#0B351E]/15 to-transparent rounded-full blur-3xl pointer-events-none -z-10" 
      />

      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Luxury Gold Metadata Badge */}
        <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-gradient-to-r from-[#04150B] via-[#0B351E] to-[#04150B] border border-[#D4AF37]/70 shadow-[0_4px_16px_rgba(212,175,55,0.25)] text-[11px] sm:text-xs font-semibold text-[#F5D061] tracking-wider uppercase mb-6">
          <span className="w-1.5 h-1.5 rounded-full bg-[#F5D061] animate-ping" />
          <span>Royal Heritage Botanical Master Guide</span>
          <span className="text-[#D4AF37]/60">·</span>
          <span>Prince Emmanuel</span>
          <span className="text-[#D4AF37]/60">·</span>
          <span className="text-white">Instant Access</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          {/* Left Column: Copy & CTAs */}
          <div className="lg:col-span-7 flex flex-col justify-center">
            <h1 className="text-[1.85rem] xs:text-3xl sm:text-4xl md:text-5xl lg:text-[3.6rem] font-serif font-bold text-[#061A0E] tracking-tight leading-[1.16] text-balance font-editorial break-words">
              Discover Practical Natural Wellness Knowledge for <span className="gold-gradient-text italic font-serif">Everyday Life</span>
            </h1>

            <p className="mt-4 sm:mt-5 text-sm sm:text-lg md:text-xl text-[#1E3A2B] leading-relaxed max-w-2xl font-normal">
              A comprehensive, easy-to-read digital handbook covering traditional botanical practices, 
              hygienic preparations, and balanced lifestyle habits for yourself and your family.
            </p>

            {/* Quick highlight points */}
            <div className="mt-6 sm:mt-7 grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-3.5 text-xs sm:text-sm md:text-base text-[#153423]">
              <div className="flex items-center gap-2.5">
                <span className="w-5 h-5 rounded-full bg-[#D4AF37]/20 border border-[#D4AF37]/50 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#B89223]" />
                </span>
                <span className="font-medium">Documented traditional preparations</span>
              </div>
              <div className="flex items-center gap-2.5">
                <span className="w-5 h-5 rounded-full bg-[#D4AF37]/20 border border-[#D4AF37]/50 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#B89223]" />
                </span>
                <span className="font-medium">Vital herbal safety & dosage cautions</span>
              </div>
              <div className="flex items-center gap-2.5">
                <span className="w-5 h-5 rounded-full bg-[#D4AF37]/20 border border-[#D4AF37]/50 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#B89223]" />
                </span>
                <span className="font-medium">Optimized for phone & tablet reading</span>
              </div>
              <div className="flex items-center gap-2.5">
                <span className="w-5 h-5 rounded-full bg-[#D4AF37]/20 border border-[#D4AF37]/50 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#B89223]" />
                </span>
                <span className="font-medium">Instant PDF download to your device</span>
              </div>
            </div>

            {/* Price line with Luxury Gold Badge */}
            <div className="mt-7 sm:mt-8 flex flex-wrap items-baseline gap-2.5 sm:gap-4">
              <span className="text-3xl sm:text-5xl md:text-6xl font-bold text-[#061A0E] tabular-nums font-editorial tracking-tight">
                ₦3,000
              </span>
              <span className="text-base sm:text-lg md:text-xl text-[#7A8C80] line-through tabular-nums decoration-[#D4AF37]/60">
                ₦5,000
              </span>
              <span className="text-xs sm:text-sm font-bold text-[#04150B] bg-gradient-to-r from-[#F5D061] via-[#FFF4CC] to-[#D4AF37] border border-[#B89223] px-3 py-0.5 sm:py-1 rounded-full shadow-[0_2px_12px_rgba(212,175,55,0.35)]">
                Save 40% (₦2,000 OFF)
              </span>
            </div>

            {/* CTA Group with dynamic radiant hover states */}
            <div className="mt-6 sm:mt-7 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <button
                type="button"
                onClick={onOpenCheckout}
                className="group relative w-full sm:w-auto px-7 py-4 text-base sm:text-lg font-bold text-white bg-gradient-to-r from-[#04150B] via-[#0B351E] to-[#04150B] rounded-2xl border-2 border-[#D4AF37]/90 hover:border-[#F5D061] hover:from-[#082213] hover:via-[#134D2C] hover:to-[#082213] hover:-translate-y-1 hover:shadow-[0_14px_40px_rgba(212,175,55,0.5)] hover:brightness-105 active:translate-y-0 active:scale-[0.98] transition-all duration-300 ease-out flex items-center justify-center gap-3 cursor-pointer shadow-[0_10px_30px_rgba(4,21,11,0.4)] overflow-hidden"
              >
                {/* Continuous luxury shimmer effect */}
                <div 
                  aria-hidden="true" 
                  className="absolute inset-0 -translate-x-full group-hover:translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent transition-transform duration-700 ease-in-out pointer-events-none" 
                />
                <span className="relative z-10 tracking-wide">Get PDF · ₦3,000</span>
                <ArrowRight className="relative z-10 w-5 h-5 text-[#F5D061] group-hover:translate-x-1.5 transition-transform duration-200 ease-out" />
              </button>

              <a
                href="https://selar.com/452722f141"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto px-6 py-4 text-base sm:text-lg font-bold text-[#061A0E] bg-gradient-to-r from-[#FAF4E6] to-[#F5EEDC] border border-[#D4AF37] rounded-2xl hover:border-[#B89025] hover:shadow-[0_6px_22px_rgba(212,175,55,0.3)] hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer shadow-xs"
              >
                <span>Buy on Selar</span>
              </a>

              <a
                href="#remedies"
                className="w-full sm:w-auto px-5 py-4 text-sm sm:text-base font-semibold text-[#0A2416] bg-white/95 backdrop-blur-sm border border-[#D4AF37]/60 rounded-2xl hover:bg-white hover:border-[#D4AF37] hover:shadow-[0_6px_20px_rgba(212,175,55,0.25)] hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>View 29 Remedies ↓</span>
              </a>
            </div>

            {/* Small trust line */}
            <div className="mt-6 flex flex-wrap items-center gap-2 text-xs sm:text-sm text-[#2E4A38]">
              <ShieldCheck className="w-4.5 h-4.5 text-[#258151] shrink-0" />
              <span className="font-medium">Instant digital access after successful payment</span>
              <span aria-hidden="true">·</span>
              <span>Immediate download & Google Drive access</span>
            </div>
          </div>

          {/* Right Column: High-Fidelity Book & Phone Mockup with Luxury Metallic Frame */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-md lg:max-w-none group">
              {/* Outer Golden Glow Aura */}
              <div 
                aria-hidden="true"
                className="absolute -inset-2 bg-gradient-to-r from-[#D4AF37]/35 via-[#F5D061]/25 to-[#D4AF37]/35 rounded-3xl blur-xl opacity-70 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
              />
              
              <div className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-white/95 to-[#F4EFE6]/90 backdrop-blur-md p-3 sm:p-4 shadow-[0_20px_50px_rgba(10,36,22,0.18)] border-2 border-[#D4AF37]/60 group-hover:border-[#D4AF37] transition-all duration-300">
                <img
                  src={bookMockupImg}
                  alt="Herbal Guide by Prince Emmanuel - Digital Book and Smartphone Mockup"
                  className="w-full h-auto object-cover rounded-2xl shadow-sm group-hover:scale-[1.01] transition-transform duration-500"
                  loading="eager"
                  fetchPriority="high"
                  width={600}
                  height={450}
                  referrerPolicy="no-referrer"
                />

                {/* Floating Authentic Edition Label */}
                <div className="absolute top-6 right-6 bg-[#072013]/90 backdrop-blur-md text-[#F5D061] text-[11px] font-bold px-3 py-1.5 rounded-full border border-[#D4AF37]/70 shadow-lg flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#F5D061] animate-pulse" />
                  <span>Verified Edition</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
