import React from 'react';

interface CategorySectionProps {
  title: string;
  children: React.ReactNode;
}

export const CategorySection: React.FC<CategorySectionProps> = ({ title, children }) => {
  return (
    <div className="space-y-3">
      <h6 className="text-[9px] font-black text-slate-300 uppercase tracking-widest pl-1">
        {title}
      </h6>
      <div className="grid gap-4 bg-slate-50/50 p-4 rounded-2xl border border-slate-100">
        {children}
      </div>
    </div>
  );
};
