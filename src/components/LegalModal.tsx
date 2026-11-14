import React from 'react';
import { X, ShieldAlert, Scale, FileText, RefreshCw } from 'lucide-react';

export type LegalDocType = 'privacy' | 'terms' | 'refund' | 'disclaimer';

interface LegalModalProps {
  type: LegalDocType | null;
  onClose: () => void;
}

export const LegalModal: React.FC<LegalModalProps> = ({ type, onClose }) => {
  if (!type) return null;

  const contentMap = {
    privacy: {
      title: 'Privacy Policy',
      icon: FileText,
      body: (
        <div className="space-y-4 text-xs sm:text-sm text-[#4A6354] leading-relaxed">
          <p>
            <strong>Last Updated: October 2026</strong>
          </p>
          <p>
            Herbal Guide and Prince Emmanuel ("we", "us", or "our") respect your privacy and are committed to protecting any personal data you share when ordering our digital educational publication.
          </p>
          <h4 className="font-bold text-[#0D2818]">1. Information We Collect</h4>
          <p>
            When you purchase Herbal Guide, we collect your full name, email address, and mobile phone number. This information is strictly utilized to deliver your PDF file, provide order receipts, and deliver customer support.
          </p>
          <h4 className="font-bold text-[#0D2818]">2. Payment Processing</h4>
          <p>
            All online financial transactions are processed securely via Paystack. We do not store, view, or log your credit/debit card numbers or bank authentication credentials on our servers.
          </p>
          <h4 className="font-bold text-[#0D2818]">3. Data Sharing & Third Parties</h4>
          <p>
            We do not sell, rent, or trade your contact information to third-party marketing companies. Data is only communicated with secure email delivery and payment processors strictly to deliver your purchased file.
          </p>
          <h4 className="font-bold text-[#0D2818]">4. Contact</h4>
          <p>
            If you have questions regarding this Privacy Policy, please contact Prince Emmanuel at aladesunloyeemmanuel@gmail.com.
          </p>
        </div>
      )
    },
    terms: {
      title: 'Terms & Conditions',
      icon: Scale,
      body: (
        <div className="space-y-4 text-xs sm:text-sm text-[#4A6354] leading-relaxed">
          <p>
            <strong>Last Updated: October 2026</strong>
          </p>
          <h4 className="font-bold text-[#0D2818]">1. Intellectual Property & License</h4>
          <p>
            Herbal Guide is protected under Nigerian copyright laws. Purchasing this guide grants you a single-user, non-exclusive, non-transferable license for personal, domestic educational reference.
          </p>
          <h4 className="font-bold text-[#0D2818]">2. Prohibited Uses</h4>
          <p>
            You may not republish, resell, license, upload to public file-sharing directories, or commercially monetize the contents of Herbal Guide without express written authorization from author Prince Emmanuel.
          </p>
          <h4 className="font-bold text-[#0D2818]">3. Educational Nature</h4>
          <p>
            This handbook is published solely for educational purposes. Readers are fully responsible for their personal health choices and should seek clinical advice before applying any wellness practice.
          </p>
          <h4 className="font-bold text-[#0D2818]">4. Governing Law</h4>
          <p>
            These terms are governed in accordance with the laws of the Federal Republic of Nigeria.
          </p>
        </div>
      )
    },
    refund: {
      title: 'Refund & Delivery Policy',
      icon: RefreshCw,
      body: (
        <div className="space-y-4 text-xs sm:text-sm text-[#4A6354] leading-relaxed">
          <p>
            <strong>Clear, Transparent Digital Policy</strong>
          </p>
          <h4 className="font-bold text-[#0D2818]">1. Nature of Digital Products</h4>
          <p>
            Herbal Guide is an instantly delivered digital PDF file. Because digital downloads cannot be physically revoked or returned once sent, all purchases of ₦3,000 are generally final.
          </p>
          <h4 className="font-bold text-[#0D2818]">2. Delivery Guarantee</h4>
          <p>
            We guarantee 100% successful delivery. If you experience any technical download problem, corrupted file link, or network failure, our support team will manually re-send the complete PDF directly to your email address within 24 hours.
          </p>
          <h4 className="font-bold text-[#0D2818]">3. Support Inquiries</h4>
          <p>
            For any delivery assistance, reach Prince Emmanuel at <strong>aladesunloyeemmanuel@gmail.com</strong>.
          </p>
        </div>
      )
    },
    disclaimer: {
      title: 'Medical & Health Disclaimer',
      icon: ShieldAlert,
      body: (
        <div className="space-y-4 text-xs sm:text-sm text-[#4A6354] leading-relaxed">
          <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-red-900 font-medium">
            IMPORTANT: Herbal Guide does not provide medical diagnoses, clinical prescriptions, or therapeutic treatment.
          </div>
          <h4 className="font-bold text-[#0D2818]">Educational Scope</h4>
          <p>
            The herbal wellness practices documented in this guide have been used over time and are effectively suitable for general wellness education, natural nourishment, and traditional home balance.
          </p>
          <h4 className="font-bold text-[#0D2818]">No Doctor-Patient Relationship</h4>
          <p>
            Reading this material does not create a physician-patient relationship. The contents are not designed to diagnose, treat, cure, or prevent any chronic disease or acute emergency.
          </p>
          <h4 className="font-bold text-[#0D2818]">Consult Qualified Health Professionals</h4>
          <p>
            Always consult a qualified medical doctor, specialist, or licensed clinical pharmacist before adopting any new herb, particularly if you are pregnant, nursing, taking prescription medications, or managing underlying health conditions.
          </p>
          <h4 className="font-bold text-[#0D2818]">Medical Emergencies</h4>
          <p>
            If you or a family member face a health emergency, call local emergency healthcare services or visit the nearest hospital emergency unit immediately.
          </p>
        </div>
      )
    }
  };

  const activeDoc = contentMap[type];

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto overscroll-contain"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-2xl sm:rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-[#D4AF37]/40 relative my-auto max-h-[90dvh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-[#FAF8F5] border-b border-[#E8DFC7] px-5 sm:px-6 py-3.5 sm:py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <activeDoc.icon className="w-5 h-5 text-[#0B351E]" />
            <h3 className="text-base sm:text-lg font-bold text-[#061A0E] font-editorial">
              {activeDoc.title}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-[#4A6354] hover:bg-[#E8DFC7]/50 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 sm:p-6 overflow-y-auto overscroll-contain">
          {activeDoc.body}
        </div>

        <div className="px-5 sm:px-6 py-3 border-t border-[#E8DFC7] bg-[#FAF8F5] flex justify-end shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-[#061A0E] text-[#F5D061] text-xs font-bold hover:bg-[#0B351E] transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
