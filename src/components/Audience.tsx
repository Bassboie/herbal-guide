import React from 'react';
import { TARGET_AUDIENCE } from '../data/guideData';
import { Compass, BookCheck, HeartHandshake, ShieldCheck, Sparkles } from 'lucide-react';

const AUDIENCE_ICONS = [
  Compass,
  BookCheck,
  HeartHandshake,
  ShieldCheck
];

export const Audience: React.FC = () => {
  return (
    <section className="py-20 md:py-28 bg-gradient-to-b from-[#F4EFE6] via-[#FAF8F5] to-[#F4EFE6] border-t border-[#D4AF37]/30 relative overflow-hidden">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-[#D4AF37]/60 text-xs font-bold text-[#8B6E16] uppercase tracking-wider mb-4 shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>Intended Readership</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-[2.8rem] font-serif font-bold text-[#061A0E] tracking-tight text-balance font-editorial leading-[1.18]">
            Who This Educational Guide Is <span className="gold-gradient-text italic font-serif">Created For</span>
          </h2>
          <p className="mt-4 text-base md:text-lg text-[#1E3A2B] leading-relaxed max-w-2xl mx-auto font-normal">
            Written in accessible, respectful, and crystal-clear language for individuals seeking reliable 
            botanical understanding rather than reckless shortcuts.
          </p>
        </div>

        <div className="mt-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {TARGET_AUDIENCE.map((item, idx) => {
            const Icon = AUDIENCE_ICONS[idx % AUDIENCE_ICONS.length];
            return (
              <div
                key={idx}
                className="group relative bg-white/95 backdrop-blur-md rounded-2xl p-6 sm:p-7 border border-[#E8DFC7] hover:border-[#D4AF37] hover:-translate-y-2 hover:shadow-[0_20px_40px_rgba(212,175,55,0.2)] transition-all duration-300 flex flex-col justify-start overflow-hidden"
              >
                {/* Subtle top gold accent glow on hover */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#0B351E] to-[#04150B] text-[#F5D061] border border-[#D4AF37]/50 flex items-center justify-center mb-5 shadow-[0_4px_14px_rgba(4,21,11,0.2)] group-hover:scale-110 group-hover:shadow-[0_6px_20px_rgba(212,175,55,0.4)] transition-all duration-300">
                  <Icon className="w-6 h-6 text-[#F5D061]" />
                </div>
                <h3 className="text-base sm:text-lg font-bold text-[#061A0E] group-hover:text-[#0B351E] transition-colors font-editorial">
                  {item.title}
                </h3>
                <p className="mt-2.5 text-xs sm:text-sm text-[#3A5043] leading-relaxed">
                  {item.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
