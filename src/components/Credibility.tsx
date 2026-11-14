import React from 'react';
import authorImg from '../assets/images/author_prince_emmanuel_1791632598588.jpg';
import { AUTHOR_INFO } from '../data/guideData';
import { Check, Mail, Quote, Award } from 'lucide-react';

interface CredibilityProps {
  onOpenCheckout: () => void;
}

export const Credibility: React.FC<CredibilityProps> = () => {
  return (
    <section id="author" className="py-20 md:py-28 bg-gradient-to-b from-[#FAF8F5] via-white to-[#FAF8F5] border-t border-[#D4AF37]/30 relative overflow-hidden">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="max-w-3xl mx-auto text-center mb-14">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-[#D4AF37]/60 text-xs font-bold text-[#8B6E16] uppercase tracking-wider mb-4 shadow-xs">
            <Award className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>Respected Field Leadership</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-[2.8rem] font-serif font-bold text-[#061A0E] tracking-tight text-balance font-editorial leading-[1.18]">
            Written by <span className="gold-gradient-text italic font-serif">Prince Emmanuel</span>
          </h2>
          <p className="mt-3 text-base md:text-lg text-[#1E3A2B] font-medium">
            {AUTHOR_INFO.title}
          </p>
        </div>

        <div className="relative bg-gradient-to-b from-white/95 to-[#FAF8F5]/90 backdrop-blur-md rounded-3xl p-6 sm:p-10 lg:p-12 border-2 border-[#D4AF37]/60 hover:border-[#D4AF37] shadow-[0_20px_60px_rgba(4,21,11,0.12)] max-w-4xl mx-auto transition-all duration-300">
          {/* Decorative Corner Gold Emblem */}
          <div className="absolute top-0 right-0 w-28 h-28 bg-gradient-to-bl from-[#D4AF37]/20 via-transparent to-transparent rounded-tr-3xl pointer-events-none" />

          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-10 items-center">
            {/* Author Portrait with Golden Ring */}
            <div className="md:col-span-5 flex flex-col items-center">
              <div className="relative p-1.5 rounded-3xl bg-gradient-to-tr from-[#D4AF37] via-[#FFF4CC] to-[#0B351E] shadow-[0_12px_35px_rgba(212,175,55,0.4)]">
                <div className="relative w-48 h-48 sm:w-56 sm:h-56 rounded-[22px] overflow-hidden bg-[#FAF8F5]">
                  <img
                    src={authorImg}
                    alt="Prince Emmanuel - Author of Herbal Guide"
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                    width={224}
                    height={224}
                    referrerPolicy="no-referrer"
                  />
                </div>
              </div>

              <div className="mt-5 text-center">
                <h3 className="text-2xl font-bold text-[#061A0E] font-editorial">
                  {AUTHOR_INFO.name}
                </h3>
                <p className="text-xs sm:text-sm text-[#7A8C80] font-medium mt-0.5">
                  Lagos & Abuja, Nigeria
                </p>
              </div>

              {/* Author Contact Strip */}
              <div className="mt-4 flex items-center justify-center">
                <a
                  href="mailto:aladesunloyeemmanuel@gmail.com"
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-[#D5CCB6] text-xs sm:text-sm font-semibold text-[#0A2416] hover:border-[#D4AF37] hover:bg-[#FAF8F5] hover:-translate-y-0.5 hover:shadow-xs active:translate-y-0 transition-all cursor-pointer"
                >
                  <Mail className="w-4 h-4 text-[#D4AF37]" />
                  <span>Email Prince Emmanuel</span>
                </a>
              </div>
            </div>

            {/* Author Story & Motivation */}
            <div className="md:col-span-7 flex flex-col justify-center space-y-5">
              <div>
                <h4 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-[#8B6E16]">
                  Verified Background & Field Experience
                </h4>
                <p className="mt-2 text-base md:text-lg text-[#1E3A2B] leading-relaxed">
                  {AUTHOR_INFO.bio}
                </p>
              </div>

              {/* Highlights */}
              <div className="space-y-2.5 pt-1">
                <div className="flex items-start gap-2.5 text-sm sm:text-base text-[#1E3A2B]">
                  <span className="w-5 h-5 rounded-full bg-[#D4AF37]/20 border border-[#D4AF37]/50 flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-3.5 h-3.5 text-[#B89223]" />
                  </span>
                  <span>8+ years documenting indigenous African botanical preparation methods.</span>
                </div>
                <div className="flex items-start gap-2.5 text-sm sm:text-base text-[#1E3A2B]">
                  <span className="w-5 h-5 rounded-full bg-[#D4AF37]/20 border border-[#D4AF37]/50 flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-3.5 h-3.5 text-[#B89223]" />
                  </span>
                  <span>Advocate for responsible health education and safe herbal hygiene practices.</span>
                </div>
                <div className="flex items-start gap-2.5 text-sm sm:text-base text-[#1E3A2B]">
                  <span className="w-5 h-5 rounded-full bg-[#D4AF37]/20 border border-[#D4AF37]/50 flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-3.5 h-3.5 text-[#B89223]" />
                  </span>
                  <span>Directly accessible customer support for every Nigerian reader.</span>
                </div>
              </div>

              {/* Why the guide was created */}
              <div className="pt-3 border-t border-[#E8DFC7]/80">
                <div className="flex items-start gap-3">
                  <Quote className="w-5 h-5 text-[#D4AF37] shrink-0 mt-1" />
                  <p className="text-sm sm:text-base md:text-lg italic text-[#264634] leading-relaxed font-editorial">
                    "{AUTHOR_INFO.reason}"
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
