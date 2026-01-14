import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  Dialog,
  DialogContent,
} from '../ui/dialog';
import {
    Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { Button } from '../ui/Button/Button';
import { User, Bell, Languages, Palette, X, Globe, Type } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useUI } from '../../context/UIContext';
import { cn } from "@/lib/utils";

export const SettingsModal: React.FC = () => {
  const auth = useAuth();
  const { fontSize, setFontSize } = useUI();
  const { t, i18n } = useTranslation();
  const [activeTab, setActiveTab] = React.useState('language');

  if (!auth) return null;
  const { isSettingsModalOpen, closeSettingsModal } = auth;

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  const sections = [
    { id: 'profile', icon: <User className="w-4 h-4" />, label: t('common.profile') },
    { id: 'notifications', icon: <Bell className="w-4 h-4" />, label: t('common.notifications') },
    { id: 'language', icon: <Languages className="w-4 h-4" />, label: t('common.language') },
    { id: 'display', icon: <Type className="w-4 h-4" />, label: 'Display' },
    { id: 'theme', icon: <Palette className="w-4 h-4" />, label: t('common.theme') },
  ];

  return (
    <Dialog open={isSettingsModalOpen} onOpenChange={closeSettingsModal}>
      <DialogContent className="max-w-3xl bg-white border-none shadow-2xl rounded-4xl p-0 overflow-hidden outline-none">
        <div className="flex min-h-[600px] h-[80vh]">
          {/* Sidebar */}
          <div className="w-48 lg:w-64 bg-slate-50 p-6 lg:p-8 border-r border-slate-100 hidden md:block shrink-0">
            <h2 className="text-xl font-black text-slate-900 mb-8">{t('common.settings')}</h2>
            <nav className="space-y-2">
              {sections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => setActiveTab(section.id)}
                  className={cn(
                    "w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-bold text-sm transition-all text-slate-500 hover:bg-white hover:text-teal-600 hover:shadow-sm",
                    activeTab === section.id && "bg-white text-teal-600 shadow-sm"
                  )}
                >
                  {section.icon}
                  {section.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Content */}
          <div className="flex-1 p-6 lg:p-8 relative flex flex-col overflow-y-auto pt-16 md:pt-8 bg-white">
            <button 
                onClick={closeSettingsModal}
                className="absolute right-6 top-6 p-2 text-slate-400 hover:text-teal-600 transition-colors bg-slate-50 md:bg-transparent rounded-xl z-20"
            >
                <X size={20} />
            </button>

            {activeTab === 'language' && (
              <div className="animate-in fade-in slide-in-from-right-2 duration-300">
                <div className="mb-8">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-teal-50 rounded-xl">
                            <Globe className="w-5 h-5 text-teal-600" />
                        </div>
                        <h3 className="text-2xl font-black text-slate-900">{t('common.language')}</h3>
                    </div>
                    <p className="text-slate-500 text-sm font-medium">{t('settings.language_description')}</p>
                </div>

                <div className="space-y-8">
                    <div className="space-y-3">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{t('common.language')}</label>
                        <Select value={i18n.language.split('-')[0]} onValueChange={changeLanguage}>
                            <SelectTrigger className="w-full h-14 rounded-2xl border-slate-200 focus:ring-teal-500/20 text-slate-900 font-bold bg-white outline-none">
                                <SelectValue placeholder={t('settings.select_language')} />
                            </SelectTrigger>
                            <SelectContent className="rounded-2xl border-slate-100 shadow-2xl p-2 bg-white z-[300]">
                                <SelectItem value="en" className="py-3 rounded-xl focus:bg-teal-50 focus:text-teal-700 font-bold">English (US)</SelectItem>
                                <SelectItem value="cb" className="py-3 rounded-xl focus:bg-teal-50 focus:text-teal-700 font-bold">Cebuano</SelectItem>
                                <SelectItem value="tl" className="py-3 rounded-xl focus:bg-teal-50 focus:text-teal-700 font-bold">Tagalog</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
              </div>
            )}

            {activeTab === 'display' && (
              <div className="animate-in fade-in slide-in-from-right-2 duration-300 space-y-10">
                <div className="">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-blue-50 rounded-xl">
                            <Type className="w-5 h-5 text-blue-600" />
                        </div>
                        <h3 className="text-2xl font-black text-slate-900">Display Settings</h3>
                    </div>
                    <p className="text-slate-500 text-sm font-medium">Fine-tune the platform text size to match your preference.</p>
                </div>

                {/* Font Size Section */}
                <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Type size={16} className="text-slate-400" />
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Text Scaling</label>
                    </div>
                    <div className="grid grid-cols-5 gap-2">
                      {(['xs', 'small', 'medium', 'large', 'xl'] as const).map((size) => (
                        <button
                          key={size}
                          onClick={() => setFontSize(size)}
                          className={cn(
                            "flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all gap-1",
                            fontSize === size 
                              ? "border-teal-500 bg-teal-50/50 text-teal-700" 
                              : "border-slate-100 hover:border-slate-200 text-slate-400"
                          )}
                        >
                          <span className={cn(
                            "font-black uppercase tracking-widest text-[9px]",
                            fontSize === size ? "text-teal-600" : "text-slate-400"
                          )}>
                            {size}
                          </span>
                        </button>
                      ))}
                    </div>
                    <p className="text-[10px] text-slate-400 font-bold bg-slate-50 p-4 rounded-xl leading-relaxed">
                          Note: Adjusting the font size will scale all text across the platform to improve readability.
                    </p>
                </div>
              </div>
            )}

            {(activeTab === 'theme' || activeTab === 'profile' || activeTab === 'notifications') && (
              <div className="animate-in fade-in slide-in-from-right-2 duration-300">
                <div className="mb-8">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-orange-50 rounded-xl">
                            <Palette className="w-5 h-5 text-orange-600" />
                        </div>
                        <h3 className="text-2xl font-black text-slate-900 capitalize">{activeTab === 'theme' ? t('common.theme') : activeTab}</h3>
                    </div>
                </div>
                <div className="p-4 rounded-3xl bg-orange-50/50 border border-orange-100 flex gap-4">
                    <Palette className="w-10 h-10 text-orange-500 shrink-0" />
                    <div>
                        <p className="text-xs font-black text-orange-700 uppercase tracking-widest mb-1">{t('settings.coming_soon')}</p>
                        <p className="text-xs text-orange-600 font-medium leading-relaxed">This section is currently under development to ensure a seamless experience.</p>
                    </div>
                </div>
              </div>
            )}

            <div className="pt-8 border-t border-slate-100 flex justify-end gap-3 mt-auto bg-white">
                <Button variant="ghost" onClick={closeSettingsModal} className="font-bold text-slate-400 hover:text-slate-600">
                    {t('common.cancel')}
                </Button>
                <Button onClick={closeSettingsModal} className="bg-teal-600 hover:bg-teal-700 text-white font-black rounded-2xl px-10 h-14 shadow-xl shadow-teal-100/50 transition-all hover:scale-[1.02] active:scale-[0.98]">
                    {t('common.save')}
                </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

