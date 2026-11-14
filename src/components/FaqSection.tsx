import React, { useState } from 'react';
import { FAQS } from '../data/guideData';
import { ChevronDown, HelpCircle, Mail } from 'lucide-react';

export const FaqSection: React.FC = () => {
  const [openIndices, setOpenIndices] = useState<number[]>([0, 1]); // first two open by default

  const toggleIndex = (index: number) => {
    setOpenIndices((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  return (
    <section id="faq" className="py-16 md:py-24 bg-gradient-to-b from-[#FAF8F5] via-white to-[#FAF8F5] border-t border-[#E8DFC7] relative overflow-hidden">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#FAF8F5] border border-[#D4AF37]/50 text-xs font-semibold text-[#8B6E16] uppercase tracking-wider mb-3 shadow-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37]" />
            Got Questions?
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-[2.6rem] font-serif font-bold text-[#061A0E] tracking-tight font-editorial">
            Frequently Asked <span className="gold-gradient-text italic font-serif">Questions</span>
          </h2>
          <p className="mt-3 text-base md:text-lg text-[#1E3A2B] leading-relaxed">
            Clear, honest answers about format, delivery, medical boundaries, and practical use.
          </p>
        </div>

        {/* Accordion List */}
        <div className="space-y-4">
          {FAQS.map((faq, index) => {
            const isOpen = openIndices.includes(index);
            return (
              <div
                key={index}
                className="rounded-2xl border border-[#E8DFC7] hover:border-[#D4AF37]/80 overflow-hidden transition-all duration-300 bg-white/90 backdrop-blur-sm shadow-xs hover:shadow-[0_8px_25px_rgba(212,175,55,0.12)]"
              >
                <button
                  type="button"
                  onClick={() => toggleIndex(index)}
                  className="w-full px-5 py-4.5 sm:px-6 sm:py-5 text-left flex items-center justify-between gap-4 font-bold text-base sm:text-lg text-[#061A0E] hover:text-[#103D24] transition-colors cursor-pointer"
                  aria-expanded={isOpen}
                >
                  <span className="flex items-start sm:items-center gap-2.5 sm:gap-3.5 text-left">
                    <span className="font-mono text-xs sm:text-sm font-bold text-[#8B6E16] shrink-0 tabular-nums bg-[#FAF8F5] px-2 py-0.5 rounded border border-[#E8DFC7] mt-0.5 sm:mt-0">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <span className="leading-snug break-words">{faq.question}</span>
                  </span>
                  <ChevronDown
                    className={`w-5 h-5 text-[#D4AF37] shrink-0 transition-transform duration-300 mt-1 sm:mt-0 ${
                      isOpen ? 'rotate-180 text-[#103D24]' : ''
                    }`}
                  />
                </button>

                {isOpen && (
                  <div className="px-5 pb-5 sm:px-6 sm:pb-6 pt-2 text-xs sm:text-sm md:text-base text-[#1E3A2B] leading-relaxed border-t border-[#E8DFC7]/40 bg-[#FAF8F5]/50">
                    <p>{faq.answer}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Support Callout with Luxury Gold Rim */}
        <div className="mt-14 p-5 sm:p-8 rounded-3xl bg-gradient-to-r from-white via-[#FAF8F5] to-white border-2 border-[#D4AF37]/50 shadow-[0_10px_30px_rgba(212,175,55,0.15)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 sm:gap-6">
          <div className="flex items-center gap-3 sm:gap-4">
            <span className="p-3.5 rounded-2xl bg-gradient-to-br from-[#0F3822] to-[#061A0E] text-[#F5D061] border border-[#D4AF37]/40 shadow-sm">
              <HelpCircle className="w-6 h-6 text-[#F5D061]" />
            </span>
            <div>
              <h4 className="text-base sm:text-lg font-bold text-[#061A0E]">
                Have a question not listed here?
              </h4>
              <p className="text-sm text-[#7A8C80] mt-0.5">
                Our support team is available via email for any inquiries or reader questions.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <a
              href="mailto:aladesunloyeemmanuel@gmail.com?subject=Herbal%20Guide%20Inquiry"
              className="px-5 py-2.5 text-xs sm:text-sm font-bold rounded-xl bg-[#061A0E] text-[#F5D061] border border-[#D4AF37]/60 hover:bg-[#0F3822] hover:-translate-y-0.5 hover:shadow-md active:translate-y-0 transition-all inline-flex items-center gap-2 shadow-xs cursor-pointer"
            >
              <Mail className="w-4 h-4 text-[#D4AF37]" />
              <span>Email Support</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};
