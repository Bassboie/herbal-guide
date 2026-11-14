import React from 'react';
import { BENEFITS } from '../data/guideData';
import { 
  FolderTree, 
  Flame, 
  HelpCircle, 
  ShieldAlert, 
  BookOpenCheck, 
  Stethoscope,
  Sparkles
} from 'lucide-react';

const BENEFIT_ICONS = [
  FolderTree,
  Flame,
  HelpCircle,
  ShieldAlert,
  BookOpenCheck,
  Stethoscope
];

export const Benefits: React.FC = () => {
  return (
    <section id="benefits" className="py-20 md:py-28 bg-gradient-to-b from-[#FAF8F5] via-white to-[#FAF8F5] border-t border-[#D4AF37]/30 relative overflow-hidden">
      {/* Soft ambient luxury lighting behind section */}
      <div aria-hidden="true" className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[50rem] h-[30rem] bg-gradient-to-tr from-[#D4AF37]/15 via-[#0B351E]/10 to-transparent rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-[#D4AF37]/60 text-xs font-bold text-[#8B6E16] uppercase tracking-wider mb-4 shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>Practical Daily Value</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-[2.8rem] font-serif font-bold text-[#061A0E] tracking-tight text-balance font-editorial leading-[1.18]">
            Realistic, Practical Benefits for Your <span className="gold-gradient-text italic font-serif">Everyday Life</span>
          </h2>
          <p className="mt-4 text-base md:text-lg text-[#1E3A2B] leading-relaxed max-w-2xl mx-auto font-normal">
            Herbal Guide delivers clear, grounded knowledge that empowers you to make thoughtful, safe, and responsible botanical decisions for your household.
          </p>
        </div>

        <div className="mt-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {BENEFITS.map((benefit, idx) => {
            const Icon = BENEFIT_ICONS[idx % BENEFIT_ICONS.length];
            const num = (idx + 1).toString().padStart(2, '0');
            return (
              <div
                key={idx}
                className="group relative bg-white/90 backdrop-blur-md rounded-2xl p-6 sm:p-7 border border-[#E8DFC7] hover:border-[#D4AF37] hover:-translate-y-2 hover:shadow-[0_20px_40px_rgba(212,175,55,0.2)] transition-all duration-300 flex flex-col justify-between overflow-hidden"
              >
                {/* Subtle top gold accent glow on hover */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                <div>
                  <div className="flex items-center justify-between mb-5">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#0B351E] to-[#04150B] text-[#F5D061] border border-[#D4AF37]/50 flex items-center justify-center shadow-[0_4px_14px_rgba(4,21,11,0.2)] group-hover:scale-110 group-hover:shadow-[0_6px_20px_rgba(212,175,55,0.4)] transition-all duration-300">
                      <Icon className="w-6 h-6 text-[#F5D061]" />
                    </div>
                    <span className="font-editorial text-2xl font-bold text-[#D4AF37]/50 group-hover:text-[#D4AF37] transition-colors">
                      {num}
                    </span>
                  </div>
                  
                  <h3 className="text-base sm:text-lg font-bold text-[#061A0E] leading-snug group-hover:text-[#0B351E] transition-colors font-editorial">
                    {benefit.title}
                  </h3>
                  <p className="mt-2.5 text-xs sm:text-sm text-[#3A5043] leading-relaxed">
                    {benefit.description}
                  </p>
                </div>

                <div className="mt-5 pt-3 border-t border-[#F2ECE1] text-[11px] text-[#8C9E92] flex items-center gap-1 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37]" />
                  <span>Curated Chapter Insight</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
