import React, { useState, useEffect } from 'react';
import { ArrowRight, Download } from 'lucide-react';

interface StickyMobileCtaProps {
  onOpenCheckout: () => void;
}

export const StickyMobileCta: React.FC<StickyMobileCtaProps> = ({ onOpenCheckout }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Show only after scrolling down 300px
      if (window.scrollY > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!isVisible) return null;

  return (
    <aside 
      aria-label="Mobile purchase bar"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#04150B]/95 backdrop-blur-xl border-t border-[#D4AF37]/50 px-4 pt-2.5 pb-[max(0.65rem,env(safe-area-inset-bottom))] shadow-[0_-5px_25px_rgba(0,0,0,0.4)] flex items-center justify-between gap-3"
    >
      <div className="flex flex-col leading-none">
        <span className="text-[10px] uppercase font-bold text-[#F5D061] tracking-wider flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-[#F5D061] animate-ping" />
          Special Price
        </span>
        <div className="flex items-baseline gap-1.5 mt-1">
          <span className="text-lg font-bold text-white tabular-nums font-editorial">
            ₦3,000
          </span>
          <span className="text-xs text-[#A5B7AC] line-through tabular-nums decoration-[#D4AF37]/70">
            ₦5,000
          </span>
        </div>
      </div>

      <button
        type="button"
        onClick={onOpenCheckout}
        className="px-5 py-2.5 bg-gradient-to-r from-[#D4AF37] via-[#F5D061] to-[#D4AF37] text-[#061A0E] text-xs font-extrabold rounded-xl border border-[#F5D061] shadow-[0_4px_15px_rgba(212,175,55,0.4)] active:scale-[0.98] transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
      >
        <Download className="w-3.5 h-3.5 text-[#061A0E]" />
        <span>Get the PDF</span>
        <ArrowRight className="w-3 h-3 text-[#061A0E]" />
      </button>
    </aside>
  );
};
