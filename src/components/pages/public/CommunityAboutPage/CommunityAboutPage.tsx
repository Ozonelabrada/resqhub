import React from 'react';
import { useTranslation } from 'react-i18next';
import { SITE } from '@/constants/site';
import { Users, Shield, Zap } from 'lucide-react';

const CommunityAboutPage: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-6xl mx-auto">
        <header className="mb-12">
          <h1 className="text-4xl font-black text-slate-900 mb-4">About {SITE.name}</h1>
          <p className="text-lg text-slate-600">A community-driven platform for safety, support, and collective action.</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
            <div className="w-12 h-12 bg-teal-50 rounded-2xl flex items-center justify-center mb-6">
              <Users className="text-teal-600 w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold mb-2">My Communities</h3>
            <p className="text-slate-500 mb-6">Manage and interact with all your joined communities in one place.</p>
            <button className="text-teal-600 font-bold hover:underline">Explore More →</button>
          </div>

          <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
            <div className="w-12 h-12 bg-orange-50 rounded-2xl flex items-center justify-center mb-6">
              <Shield className="text-orange-600 w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold mb-2">Safety Alerts</h3>
            <p className="text-slate-500 mb-6">Real-time alerts and safety reports from your neighborhood.</p>
            <button className="text-orange-600 font-bold hover:underline">View Alerts →</button>
          </div>

          <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
            <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center mb-6">
              <Zap className="text-indigo-600 w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold mb-2">Active Responses</h3>
            <p className="text-slate-500 mb-6">Join ongoing rescue efforts and community initiatives.</p>
            <button className="text-indigo-600 font-bold hover:underline">See Activity →</button>
          </div>
        </div>

        <div className="mt-12 bg-teal-600 rounded-[3rem] p-12 text-white relative overflow-hidden">
          <div className="relative z-10 max-w-2xl">
            <h2 className="text-3xl font-black mb-4">Ready to make an impact?</h2>
            <p className="text-teal-50 mb-8 opacity-90">The Community About is designed to streamline how {SITE.name} users work together during emergencies.</p>
            <button className="bg-white text-teal-600 px-8 py-4 rounded-2xl font-black shadow-xl hover:scale-105 transition-transform">
              Launch Global Map
            </button>
          </div>
          <div className="absolute top-0 right-0 w-96 h-96 bg-teal-500/20 rounded-full -mr-24 -mt-24" />
        </div>
      </div>
    </div>
  );
};

export default CommunityAboutPage;
