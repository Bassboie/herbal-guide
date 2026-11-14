import React from 'react';
import { BookOpen, Mail } from 'lucide-react';
import { LegalDocType } from './LegalModal';

interface FooterProps {
  onOpenLegal: (type: LegalDocType) => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenLegal }) => {
  return (
    <footer className="relative bg-gradient-to-b from-[#061A0E] via-[#092213] to-[#040E07] text-[#A5B7AC] pt-14 pb-24 md:pb-14 border-t border-[#D4AF37]/30 overflow-hidden">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pb-10 border-b border-[#D4AF37]/15">
          {/* Brand Info */}
          <div className="md:col-span-5 space-y-3">
            <div className="flex items-center gap-2.5">
              <span className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#D4AF37] to-[#996515] text-[#061A0E] flex items-center justify-center shadow-[0_0_15px_rgba(212,175,55,0.35)]">
                <BookOpen className="w-4 h-4 text-[#061A0E]" />
              </span>
              <span className="text-xl font-bold font-editorial text-white tracking-wide flex items-center gap-2">
                <span>Herbal Guide</span>
                <span className="text-[10px] font-sans font-bold uppercase tracking-widest px-2 py-0.5 rounded-full bg-[#D4AF37]/20 text-[#F5D061] border border-[#D4AF37]/40">
                  Official
                </span>
              </span>
            </div>
            <p className="text-xs text-[#8BA193] max-w-sm leading-relaxed">
              A comprehensive educational digital handbook on traditional African botanical practices, 
              safe preparations, hygiene, and responsible healthcare boundaries. Authored by Prince Emmanuel.
            </p>
            <p className="text-xs text-[#F5D061]/80 font-medium">
              Location: Lagos & Abuja, Nigeria · Instant Delivery
            </p>
          </div>

          {/* Quick Support & Inquiries */}
          <div className="md:col-span-4 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">
              Customer Support
            </h4>
            <p className="text-xs text-[#8BA193] leading-relaxed">
              Order confirmations and digital files are delivered immediately upon payment. For questions or reader assistance:
            </p>
            <div className="flex flex-col gap-2 pt-1 text-xs">
              <a
                href="mailto:aladesunloyeemmanuel@gmail.com"
                className="inline-flex items-center gap-2 text-[#E8DFC7] hover:text-[#F5D061] transition-colors"
              >
                <Mail className="w-4 h-4 text-[#D4AF37]" />
                <span>aladesunloyeemmanuel@gmail.com</span>
              </a>
            </div>
          </div>

          {/* Legal Links */}
          <div className="md:col-span-3 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">
              Legal & Disclaimers
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  type="button"
                  onClick={() => onOpenLegal('privacy')}
                  className="hover:text-white transition-colors cursor-pointer text-left"
                >
                  Privacy Policy
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onOpenLegal('terms')}
                  className="hover:text-white transition-colors cursor-pointer text-left"
                >
                  Terms & Conditions
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onOpenLegal('refund')}
                  className="hover:text-white transition-colors cursor-pointer text-left"
                >
                  Refund & Delivery Policy
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onOpenLegal('disclaimer')}
                  className="hover:text-white transition-colors cursor-pointer text-left"
                >
                  Medical Disclaimer
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Medical disclaimer note */}
        <div className="pt-6 pb-4 text-[11px] text-[#6E8576] leading-relaxed">
          <p>
            <strong className="text-[#8BA193]">Important Medical Disclaimer: </strong>
            Herbal Guide is published solely for educational, cultural, and self-care information purposes. 
            The herbal wellness practices documented have been used over time and are effectively suitable for wellness education. 
            However, this material does not constitute medical diagnosis, clinical treatment, prescription, or physician consultation. 
            Always consult a licensed medical practitioner or clinical pharmacist before taking any concentrated traditional herbal preparation, 
            especially if pregnant, nursing, taking medications, or experiencing acute illness. In an emergency, visit the nearest medical hospital immediately.
          </p>
        </div>

        {/* Copyright notice */}
        <div className="pt-4 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#6E8576]">
          <span>© {new Date().getFullYear()} Herbal Guide · Authored by Prince Emmanuel. All Rights Reserved.</span>
          <span>Designed for Mobile-First Readers in Nigeria</span>
        </div>
      </div>
    </footer>
  );
};
