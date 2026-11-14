import React, { useState } from 'react';
import { 
  CheckCircle2, 
  Search, 
  Sparkles, 
  ArrowRight, 
  BookOpen, 
  ShieldCheck,
  HeartPulse,
  X,
  FileText,
  Lock,
  ChevronRight,
  Leaf,
  Flame,
  Clock
} from 'lucide-react';
import { AILMENTS_REMEDIES_LIST, AilmentRemedy } from '../data/guideData';

interface RemediesSectionProps {
  onOpenCheckout: () => void;
}

// Clear categories with counts
const REMEDY_CATEGORIES = [
  { id: 'all', label: 'All 29 Remedies', count: 29 },
  { id: 'reproductive', label: 'Reproductive & Womb', count: 6 },
  { id: 'mens', label: "Men's Health & Vitality", count: 3 },
  { id: 'chronic', label: 'Chronic & Metabolic', count: 6 },
  { id: 'immunity', label: 'Infections & Immunity', count: 6 },
  { id: 'relief', label: 'Daily Relief & Pain', count: 8 },
];

export const RemediesSection: React.FC<RemediesSectionProps> = ({ onOpenCheckout }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [activeRemedyModal, setActiveRemedyModal] = useState<AilmentRemedy | null>(null);

  // Filter logic
  const filteredAilments = AILMENTS_REMEDIES_LIST.filter((item) => {
    const query = searchQuery.toLowerCase().trim();
    const matchesSearch = 
      !query ||
      item.name.toLowerCase().includes(query) ||
      item.tag.toLowerCase().includes(query) ||
      item.note.toLowerCase().includes(query);

    if (!matchesSearch) return false;

    if (selectedCategory === 'all') return true;
    if (selectedCategory === 'reproductive') {
      return ['Barrenness', 'Fertility Cleanser for Men & Women', 'Fibroid', 'Hormonal Imbalance', 'Miscarriage'].includes(item.name);
    }
    if (selectedCategory === 'mens') {
      return ['Prostate Enlargement', 'Semen / Sperm Booster', 'Weak Erection'].includes(item.name);
    }
    if (selectedCategory === 'chronic') {
      return ['Diabetes', 'High Blood Pressure', 'Kidney Disease', 'Stroke', 'Asthma', 'Weight Loss'].includes(item.name);
    }
    if (selectedCategory === 'immunity') {
      return ['Infection', 'H,P,V / Herpes', 'H,I,V', 'Tuberculosis', 'Typhoid & Malaria', 'Urinary Tract Infection (UTI)'].includes(item.name);
    }
    if (selectedCategory === 'relief') {
      return ['Eye Disease', 'Halitosis (Mouth Odour)', 'Insomnia', 'Migraine(s)', 'Pain Relief', 'Pile (Hemorrhoids)', 'Severe Cough', 'Toothache', 'Ulcer'].includes(item.name);
    }
    return true;
  });

  return (
    <section id="remedies" className="py-20 md:py-28 bg-gradient-to-b from-[#FAF8F5] via-white to-[#FAF8F5] border-t border-[#D4AF37]/30 relative overflow-hidden">
      {/* Ambient luxury lighting */}
      <div 
        aria-hidden="true" 
        className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[55rem] h-[35rem] bg-gradient-to-tr from-[#D4AF37]/20 via-[#0B351E]/15 to-transparent rounded-full blur-3xl pointer-events-none -z-10" 
      />
      <div 
        aria-hidden="true" 
        className="absolute bottom-10 right-10 w-[30rem] h-[30rem] bg-[#D4AF37]/15 rounded-full blur-3xl pointer-events-none -z-10" 
      />

      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center">
          {/* Requested badge text change */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-[#D4AF37]/70 text-xs font-bold text-[#8B6E16] uppercase tracking-wider mb-4 shadow-xs">
            <HeartPulse className="w-4 h-4 text-[#B89223]" />
            <span>Master Guide · 29 Documented Remedies</span>
          </div>
          
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-[2.8rem] font-serif font-bold text-[#061A0E] tracking-tight text-balance font-editorial leading-[1.18]">
            Remedies to Several <span className="gold-gradient-text italic font-serif">Diseases & Ailments</span>
          </h2>
          
          <p className="mt-4 text-base md:text-lg text-[#1E3A2B] leading-relaxed max-w-2xl mx-auto font-medium">
            This herbal guide contains remedy to several disease and ailments including:
          </p>

          {/* 3 High-Clarity Pillars */}
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-3xl mx-auto text-left">
            <div className="p-3.5 rounded-2xl bg-white border border-[#E8DFC7] flex items-center gap-2.5 shadow-2xs">
              <span className="w-8 h-8 rounded-xl bg-[#061A0E] text-[#F5D061] flex items-center justify-center shrink-0 border border-[#D4AF37]/40">
                <Leaf className="w-4 h-4 text-[#F5D061]" />
              </span>
              <div>
                <div className="text-xs font-bold text-[#061A0E]">Tested Botanicals</div>
                <div className="text-[11px] text-[#5A7363]">Named herbs & roots</div>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-white border border-[#E8DFC7] flex items-center gap-2.5 shadow-2xs">
              <span className="w-8 h-8 rounded-xl bg-[#061A0E] text-[#F5D061] flex items-center justify-center shrink-0 border border-[#D4AF37]/40">
                <Flame className="w-4 h-4 text-[#F5D061]" />
              </span>
              <div>
                <div className="text-xs font-bold text-[#061A0E]">Exact Water Ratios</div>
                <div className="text-[11px] text-[#5A7363]">Boil times & maceration</div>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-white border border-[#E8DFC7] flex items-center gap-2.5 shadow-2xs">
              <span className="w-8 h-8 rounded-xl bg-[#061A0E] text-[#F5D061] flex items-center justify-center shrink-0 border border-[#D4AF37]/40">
                <Clock className="w-4 h-4 text-[#F5D061]" />
              </span>
              <div>
                <div className="text-xs font-bold text-[#061A0E]">Daily Dosage Limits</div>
                <div className="text-[11px] text-[#5A7363]">Morning & evening schedules</div>
              </div>
            </div>
          </div>

          {/* Interactive Category Filter Pills */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
            {REMEDY_CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 cursor-pointer flex items-center gap-1.5 ${
                  selectedCategory === cat.id
                    ? 'bg-gradient-to-r from-[#04150B] to-[#0B351E] text-[#F5D061] border border-[#D4AF37] shadow-[0_4px_14px_rgba(212,175,55,0.3)] scale-105'
                    : 'bg-white/90 text-[#3A5043] border border-[#E8DFC7] hover:border-[#D4AF37]/60 hover:text-[#061A0E]'
                }`}
              >
                <span>{cat.label}</span>
              </button>
            ))}
          </div>

          {/* Search Bar for Ailments with Result Count */}
          <div className="mt-6 max-w-md mx-auto relative">
            <Search className="w-4 h-4 text-[#7A8C80] absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search any condition (e.g. Infection, Diabetes, Ulcer, Pile)..."
              className="w-full pl-11 pr-20 py-3.5 rounded-2xl border border-[#D5CCB6] bg-white text-base sm:text-sm text-[#061A0E] focus:outline-none focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/25 shadow-sm transition-all placeholder:text-[#8C9E92]"
            />
            {searchQuery ? (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-[#7A8C80] hover:text-[#061A0E] px-2 py-1 rounded cursor-pointer"
              >
                Clear
              </button>
            ) : (
              <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[10px] font-bold text-[#8B6E14] bg-[#FAF4E6] px-2 py-0.5 rounded-full border border-[#D4AF37]/40 pointer-events-none">
                {filteredAilments.length} Found
              </span>
            )}
          </div>
        </div>

        {/* The 29 Ailments Grid: High Contrast, Highly Informative & Crystal Clear */}
        <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {filteredAilments.map((item) => (
            <div
              key={item.id}
              onClick={() => setActiveRemedyModal(item)}
              className="group relative bg-white rounded-2xl p-5 border-2 border-[#E8DFC7] hover:border-[#D4AF37] hover:shadow-[0_14px_35px_rgba(212,175,55,0.22)] hover:-translate-y-1 transition-all duration-200 flex flex-col justify-between cursor-pointer"
            >
              {/* Subtle top gold strip on hover */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-t-2xl" />

              <div>
                {/* Header: Number, Title and Tag */}
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2.5">
                    <span className="font-mono text-xs font-extrabold text-[#8B6E16] bg-[#FAF4E6] border border-[#D4AF37]/40 px-2 py-0.5 rounded-lg shrink-0">
                      #{String(item.id).padStart(2, '0')}
                    </span>
                    <h3 className="text-lg sm:text-xl font-bold text-[#061A0E] group-hover:text-[#0B351E] transition-colors font-editorial leading-tight">
                      {item.name}
                    </h3>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#FAF4E6] text-[#8B6E14] border border-[#D4AF37]/40 shrink-0 uppercase tracking-wide">
                    {item.tag}
                  </span>
                </div>

                {/* Clear Treatment Approach */}
                <p className="text-xs sm:text-[13px] text-[#2E4A38] leading-relaxed">
                  {item.note}
                </p>
              </div>

              {/* Card Footer: Method & Action */}
              <div className="mt-4 pt-3 border-t border-[#F2ECE1] flex items-center justify-between text-xs">
                <span className="text-[11px] font-medium text-[#526B5C]">
                  {item.method}
                </span>
                <span className="font-bold text-[#0B351E] group-hover:text-[#B89223] flex items-center gap-1 transition-colors">
                  <span>View Recipe</span>
                  <ChevronRight className="w-3.5 h-3.5 text-[#D4AF37] group-hover:translate-x-1 transition-transform" />
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Empty Search Fallback */}
        {filteredAilments.length === 0 && (
          <div className="text-center py-12 bg-white rounded-2xl border border-[#E8DFC7] p-8 max-w-md mx-auto">
            <p className="text-sm text-[#4A6354]">
              No ailments matching "<strong>{searchQuery}</strong>". 
            </p>
            <button
              type="button"
              onClick={() => { setSearchQuery(''); setSelectedCategory('all'); }}
              className="mt-3 px-4 py-2 bg-[#061A0E] text-[#F5D061] rounded-xl text-xs font-bold cursor-pointer"
            >
              View All 29 Remedies
            </button>
          </div>
        )}

        {/* Section Bottom Card & CTA */}
        <div className="mt-14 p-6 sm:p-9 rounded-3xl bg-gradient-to-r from-[#04150B] via-[#0B351E] to-[#04150B] text-white border-2 border-[#D4AF37]/80 shadow-[0_22px_60px_rgba(4,21,11,0.35)] flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#D4AF37]/25 border border-[#D4AF37]/50 text-xs font-bold text-[#F5D061]">
              <BookOpen className="w-3.5 h-3.5" />
              <span>All 29 Conditions Documented in One Complete PDF</span>
            </div>
            <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold font-editorial text-white">
              Get the Complete Herbal Guide Handbook Today
            </h3>
            <p className="text-xs sm:text-sm text-[#E8DFC7] max-w-xl leading-relaxed">
              Detailed step-by-step preparations, safe dosages, contraindications, and glass bottle storage for each ailment—delivered instantly to your device for just <strong>₦3,000</strong>.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0 w-full md:w-auto">
            <button
              type="button"
              onClick={onOpenCheckout}
              className="w-full sm:w-auto px-8 py-4.5 rounded-xl bg-gradient-to-r from-[#D4AF37] via-[#FFF4CC] to-[#D4AF37] hover:from-[#E2BF48] hover:to-[#C79E30] text-[#061A0E] font-extrabold text-sm flex items-center justify-center gap-2 shadow-[0_10px_30px_rgba(212,175,55,0.45)] hover:-translate-y-0.5 active:scale-95 transition-all cursor-pointer"
            >
              <span>Get the Guide · ₦3,000</span>
              <ArrowRight className="w-4 h-4 text-[#061A0E]" />
            </button>
          </div>
        </div>

        {/* Educational safety disclaimer */}
        <div className="mt-6 text-center text-xs text-[#7A8C80] flex items-center justify-center gap-1.5 max-w-2xl mx-auto">
          <ShieldCheck className="w-4 h-4 text-[#256F4A] shrink-0" />
          <span>Educational wellness reference. Formulations are documented for traditional learning; always consult your physician for clinical diagnosis.</span>
        </div>
      </div>

      {/* Crystal Clear Remedy Modal Breakdown */}
      {activeRemedyModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-sm animate-fade-in overflow-y-auto overscroll-contain"
          onClick={() => setActiveRemedyModal(null)}
        >
          <div 
            className="relative w-full max-w-lg max-h-[90dvh] overflow-y-auto overscroll-contain bg-gradient-to-b from-[#FAF8F5] via-white to-[#FAF8F5] rounded-2xl sm:rounded-3xl p-5 sm:p-7 border-2 border-[#D4AF37] shadow-[0_25px_60px_rgba(0,0,0,0.3)] space-y-4 sm:space-y-5"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top gold bar */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#D4AF37] via-[#FFF4CC] to-[#B89223]" />

            {/* Close button with 40px touch target */}
            <button
              type="button"
              onClick={() => setActiveRemedyModal(null)}
              className="absolute top-3.5 right-3.5 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#FAF4E6] border border-[#D4AF37]/50 text-[#061A0E] hover:bg-[#D4AF37] hover:text-white flex items-center justify-center transition-all cursor-pointer shadow-xs"
              aria-label="Close Preview"
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>

            {/* Modal Title & Identification */}
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-[#8B6E16] bg-[#FAF4E6] border border-[#D4AF37]/40 px-2 py-0.5 rounded">
                  Remedy #{String(activeRemedyModal.id).padStart(2, '0')}
                </span>
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#8B6E14]">
                  {activeRemedyModal.tag}
                </span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-bold font-editorial text-[#061A0E]">
                {activeRemedyModal.name}
              </h3>
            </div>

            {/* Section 1: Overview */}
            <div className="p-4 rounded-2xl bg-[#FAF4E6] border border-[#D4AF37]/40 space-y-1.5 text-xs sm:text-sm text-[#2E4A38]">
              <div className="font-bold text-[#061A0E] flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-[#D4AF37]" />
                <span>Documented Botanical Approach</span>
              </div>
              <p className="leading-relaxed">
                {activeRemedyModal.note}
              </p>
            </div>

            {/* Section 2: Preparation Type */}
            <div className="p-3.5 rounded-xl bg-white border border-[#E8DFC7] text-xs">
              <div className="text-[11px] text-[#5A7363]">
                Preparation Type: <strong className="text-[#061A0E]">{activeRemedyModal.method}</strong>
              </div>
            </div>

            {/* Section 3: What the Complete Guide Delivers */}
            <div className="p-3.5 rounded-xl bg-[#FAF8F5] border border-[#D4AF37]/30 space-y-2 text-xs sm:text-sm text-[#3A5043]">
              <div className="font-bold text-[#061A0E] flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-[#D4AF37]" />
                <span>Detailed Inside the Complete PDF Guide:</span>
              </div>
              <p className="text-xs leading-relaxed text-[#264634]">
                {activeRemedyModal.details}
              </p>
              <ul className="space-y-1.5 pt-1 text-xs">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#B89223] shrink-0" />
                  <span>Exact measured grams and handful ratios</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#B89223] shrink-0" />
                  <span>Boiling duration & clean water volume</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#B89223] shrink-0" />
                  <span>Safe morning & evening cup schedules</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#B89223] shrink-0" />
                  <span>Foods to avoid while using this formulation</span>
                </li>
              </ul>
            </div>

            {/* Direct Buy CTA */}
            <div className="pt-2">
              <button
                type="button"
                onClick={() => {
                  setActiveRemedyModal(null);
                  onOpenCheckout();
                }}
                className="w-full py-4 px-5 rounded-2xl bg-gradient-to-r from-[#04150B] via-[#0B351E] to-[#04150B] text-white font-bold text-sm border-2 border-[#D4AF37] hover:border-[#F5D061] hover:shadow-[0_10px_30px_rgba(212,175,55,0.4)] transition-all flex items-center justify-center gap-2.5 cursor-pointer shadow-md"
              >
                <Lock className="w-4 h-4 text-[#F5D061]" />
                <span>Unlock Full Measured Guide for {activeRemedyModal.name} · ₦3,000</span>
              </button>
              <p className="text-[10px] text-center text-[#7A8C80] mt-2">
                Instant delivery to your device via Paystack or Selar after checkout.
              </p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
