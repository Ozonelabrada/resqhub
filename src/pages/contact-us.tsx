import React from 'react';
import { ContactForm } from '../components/ContactForm';
import { SupportInfoCard } from '../components/SupportInfoCard';
import { BackToHomeButton } from '../components/BackToHomeButton';

const ContactUsPage: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 py-12 md:py-20 animate-fade-in pb-24 md:pb-20">
      <header className="mb-12 flex flex-col md:flex-row justify-between items-start gap-6">
        <div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-4">Contact Us</h1>
          <p className="text-slate-600 text-lg max-w-2xl">
            Have a question about an item, feedback on the platform, or need technical support? 
            Fill out the form below and our team will get back to you as soon as possible.
          </p>
        </div>
        <div className="hidden md:block">
          <BackToHomeButton />
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_350px] gap-12">
        <div className="order-2 lg:order-1">
          <ContactForm />
        </div>
        
        <aside className="order-1 lg:order-2 space-y-6">
          <SupportInfoCard />
          
          <div className="bg-orange-50 border border-orange-100 p-6 rounded-2xl">
            <h3 className="font-bold text-orange-900 mb-2 flex items-center gap-2">
              ⚠️ Reporting Abuse?
            </h3>
            <p className="text-sm text-orange-800">
              For immediate reporting of fake items or suspicious behavior, you can also use the 
              "Report" button directly on any item page.
            </p>
          </div>
        </aside>
      </div>

      {/* Mobile Sticky Back Button */}
      <div className="lg:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-sm">
        <BackToHomeButton className="w-full shadow-xl h-14 text-lg" />
      </div>
    </div>
  );
};


export default ContactUsPage;
