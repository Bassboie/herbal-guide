/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { Benefits } from './components/Benefits';
import { RemediesSection } from './components/RemediesSection';
import { Audience } from './components/Audience';
import { Credibility } from './components/Credibility';
import { OfferSection } from './components/OfferSection';
import { FaqSection } from './components/FaqSection';
import { Footer } from './components/Footer';
import { CheckoutModal } from './components/CheckoutModal';
import { LegalModal, LegalDocType } from './components/LegalModal';
import { StickyMobileCta } from './components/StickyMobileCta';
import { PaymentSuccessPage } from './components/PaymentSuccessPage';

export default function App() {
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [legalModalType, setLegalModalType] = useState<LegalDocType | null>(null);
  const [isSuccessPage, setIsSuccessPage] = useState(() => {
    if (typeof window === 'undefined') return false;
    const path = window.location.pathname;
    const search = window.location.search;
    return path.includes('payment-success') || search.includes('reference=') || search.includes('trxref=');
  });

  const handleOpenCheckout = () => {
    setIsCheckoutOpen(true);
  };

  const handleCloseCheckout = () => {
    setIsCheckoutOpen(false);
  };

  const handleBackToHome = () => {
    if (typeof window !== 'undefined') {
      window.history.pushState({}, '', '/');
    }
    setIsSuccessPage(false);
  };

  if (isSuccessPage) {
    return <PaymentSuccessPage onBackToHome={handleBackToHome} />;
  }

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-[#FAF8F5] text-[#1E2922] flex flex-col font-sans selection:bg-[#E2EBD8] selection:text-[#133E28]">
      {/* Navigation Bar adhering to Top Bar Contract */}
      <Header onOpenCheckout={handleOpenCheckout} />

      <main className="flex-1 pb-16 md:pb-0 overflow-x-hidden">
        {/* 1. Hero Section */}
        <Hero
          onOpenCheckout={handleOpenCheckout}
        />

        {/* 2. Realistic Benefits Section */}
        <Benefits />

        {/* 3. Diseases & Ailments Covered Remedies Section */}
        <RemediesSection onOpenCheckout={handleOpenCheckout} />

        {/* 4. Who The Guide Is For */}
        <Audience />

        {/* 5. Credibility & Author Profile */}
        <Credibility onOpenCheckout={handleOpenCheckout} />

        {/* 6. Offer Purchase Box */}
        <OfferSection onOpenCheckout={handleOpenCheckout} />

        {/* 7. Frequently Asked Questions */}
        <FaqSection />
      </main>

      {/* Footer with brand, support contact, legal links, medical disclaimer */}
      <Footer onOpenLegal={(type) => setLegalModalType(type)} />

      {/* Interactive Paystack & Selar Checkout Dialog */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={handleCloseCheckout}
      />

      {/* Legal Modals (Privacy, Terms, Refund, Medical Disclaimer) */}
      <LegalModal
        type={legalModalType}
        onClose={() => setLegalModalType(null)}
      />

      {/* Sticky Mobile CTA bar (<15% viewport height) */}
      <StickyMobileCta onOpenCheckout={handleOpenCheckout} />
    </div>
  );
}
