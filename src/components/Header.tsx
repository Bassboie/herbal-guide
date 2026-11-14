import React, { useState } from 'react';
import { BookOpen, Menu, X, ArrowRight, Sparkles } from 'lucide-react';

interface HeaderProps {
  onOpenCheckout: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenCheckout }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNavClick = (id: string) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-[#FAF8F5]/95 backdrop-blur-xl border-b border-[#D4AF37]/30 shadow-[0_4px_25px_rgba(10,36,22,0.04)]">
      {/* Top subtle gold foil hairline */}
      <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent" />

      <div className="max-w-6xl mx-auto px-3.5 sm:px-6 h-16 sm:h-18 flex items-center justify-between gap-3 sm:gap-6">
        {/* Zone 1: Wordmark with Royal Seal */}
        <a 
          href="#" 
          className="flex items-center gap-2 sm:gap-2.5 text-base sm:text-lg font-serif font-bold text-[#061A0E] tracking-tight whitespace-nowrap shrink-0 group transition-all"
        >
          <span className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-br from-[#0B351E] via-[#061A0E] to-[#04120A] text-[#F5D061] border border-[#D4AF37]/60 flex items-center justify-center shadow-[0_4px_14px_rgba(212,175,55,0.28)] group-hover:scale-105 transition-all">
            <BookOpen className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-[#F5D061]" />
          </span>
          <div className="flex flex-col">
            <span className="text-lg sm:text-2xl font-editorial tracking-wide text-[#061A0E] group-hover:text-[#0E3320] transition-colors leading-none">
              Herbal <span className="gold-gradient-text font-serif italic font-bold">Guide</span>
            </span>
            <span className="hidden xs:inline-block text-[9px] uppercase tracking-[0.18em] font-sans font-bold text-[#9E7A1B] mt-0.5">
              Royal Edition
            </span>
          </div>
        </a>

        {/* Zone 2: Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-7 text-xs sm:text-sm font-medium text-[#1E3A2B]">
          <a href="#overview" className="hover:text-[#B89223] transition-colors whitespace-nowrap py-1">
            Overview
          </a>
          <a href="#remedies" className="hover:text-[#B89223] text-[#061A0E] font-semibold transition-colors whitespace-nowrap py-1 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37] animate-pulse" />
            <span>29 Remedies</span>
          </a>
          <a href="#benefits" className="hover:text-[#B89223] transition-colors whitespace-nowrap py-1">
            Benefits
          </a>
          <a href="#author" className="hover:text-[#B89223] transition-colors whitespace-nowrap py-1">
            Author
          </a>
          <a href="#pricing" className="hover:text-[#B89223] transition-colors whitespace-nowrap py-1">
            Pricing
          </a>
          <a href="#faq" className="hover:text-[#B89223] transition-colors whitespace-nowrap py-1">
            FAQ
          </a>
        </nav>

        {/* Zone 3: CTA & Mobile Hamburger */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <button
            type="button"
            onClick={onOpenCheckout}
            className="group relative px-3.5 py-2 sm:px-6 sm:py-2.5 text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-[#04150B] via-[#0B351E] to-[#04150B] rounded-xl border border-[#D4AF37]/80 shadow-[0_4px_16px_rgba(212,175,55,0.3)] hover:shadow-[0_6px_25px_rgba(212,175,55,0.55)] hover:border-[#F5D061] hover:-translate-y-0.5 active:scale-[0.98] transition-all duration-300 whitespace-nowrap cursor-pointer overflow-hidden"
          >
            {/* Shimmer line */}
            <div 
              aria-hidden="true"
              className="absolute inset-0 -translate-x-full group-hover:translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent transition-transform duration-700 ease-in-out pointer-events-none"
            />
            <span className="relative z-10 flex items-center gap-1.5 sm:gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#F5D061] animate-ping" />
              <span>Get PDF · ₦3,000</span>
            </span>
          </button>

          {/* Mobile Menu Button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            className="lg:hidden w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-white border border-[#D5CCB6] text-[#061A0E] hover:border-[#D4AF37] flex items-center justify-center transition-colors cursor-pointer shadow-2xs"
          >
            {mobileMenuOpen ? <X className="w-5 h-5 text-[#061A0E]" /> : <Menu className="w-5 h-5 text-[#061A0E]" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#FAF8F5]/98 backdrop-blur-2xl border-b border-[#D4AF37]/40 px-4 py-5 shadow-2xl animate-fade-in">
          <div className="max-w-md mx-auto space-y-3">
            <div className="text-[11px] font-bold text-[#8B6E16] uppercase tracking-wider px-2 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>Quick Navigation</span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-sm font-semibold text-[#061A0E]">
              <button
                type="button"
                onClick={() => handleNavClick('overview')}
                className="p-3 text-left rounded-xl bg-white border border-[#E8DFC7] hover:border-[#D4AF37] hover:bg-[#FAF4E6] transition-all cursor-pointer"
              >
                Overview
              </button>
              <button
                type="button"
                onClick={() => handleNavClick('remedies')}
                className="p-3 text-left rounded-xl bg-gradient-to-r from-[#FAF4E6] to-white border border-[#D4AF37] text-[#0B351E] font-bold flex items-center justify-between transition-all cursor-pointer shadow-2xs"
              >
                <span>29 Remedies</span>
                <span className="w-2 h-2 rounded-full bg-[#D4AF37]" />
              </button>
              <button
                type="button"
                onClick={() => handleNavClick('benefits')}
                className="p-3 text-left rounded-xl bg-white border border-[#E8DFC7] hover:border-[#D4AF37] hover:bg-[#FAF4E6] transition-all cursor-pointer"
              >
                Benefits
              </button>
              <button
                type="button"
                onClick={() => handleNavClick('author')}
                className="p-3 text-left rounded-xl bg-white border border-[#E8DFC7] hover:border-[#D4AF37] hover:bg-[#FAF4E6] transition-all cursor-pointer"
              >
                Author Profile
              </button>
              <button
                type="button"
                onClick={() => handleNavClick('pricing')}
                className="p-3 text-left rounded-xl bg-white border border-[#E8DFC7] hover:border-[#D4AF37] hover:bg-[#FAF4E6] transition-all cursor-pointer"
              >
                Pricing (₦3,000)
              </button>
              <button
                type="button"
                onClick={() => handleNavClick('faq')}
                className="p-3 text-left rounded-xl bg-white border border-[#E8DFC7] hover:border-[#D4AF37] hover:bg-[#FAF4E6] transition-all cursor-pointer"
              >
                FAQs
              </button>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenCheckout();
                }}
                className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-[#04150B] via-[#0B351E] to-[#04150B] text-white font-bold text-sm border border-[#D4AF37] flex items-center justify-center gap-2 cursor-pointer shadow-md"
              >
                <span>Get Instant PDF Access · ₦3,000</span>
                <ArrowRight className="w-4 h-4 text-[#F5D061]" />
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
