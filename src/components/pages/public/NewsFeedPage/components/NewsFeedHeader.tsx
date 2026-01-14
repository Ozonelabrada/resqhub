import React from 'react';
import { 
  Search, 
  Plus, 
  Filter, 
  ChevronDown 
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import {
  Button,
  Input,
  ShadcnSelect as Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '../../../../ui';
import { cn } from "@/lib/utils";

interface NewsFeedHeaderProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  filter: 'all' | 'lost' | 'found';
  setFilter: (filter: 'all' | 'lost' | 'found') => void;
  sortBy: 'recent' | 'popular' | 'distance';
  setSortBy: (sort: 'recent' | 'popular' | 'distance') => void;
  showAdvancedFilters: boolean;
  setShowAdvancedFilters: (show: boolean) => void;
  onPostClick: () => void;
}

const NewsFeedHeader: React.FC<NewsFeedHeaderProps> = ({
  searchQuery,
  setSearchQuery,
  filter,
  setFilter,
  sortBy,
  setSortBy,
  showAdvancedFilters,
  setShowAdvancedFilters,
  onPostClick
}) => {
  const { t } = useTranslation();

  return (
    <div className="w-full">
      {/* UNIFIED HEADER BAR */}
      <div className="bg-white p-4 md:p-6 rounded-[2.5rem] shadow-sm flex flex-col md:flex-row items-center gap-4">
        {/* Search Section */}
        <div className="relative group w-full md:w-1/3 min-w-[240px]">
          <Input
            type="text"
            placeholder={t('common.search_placeholder') || "Search items, users, etc..."}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 h-12 bg-slate-50 border-none rounded-2xl font-bold text-slate-600 focus:ring-2 focus:ring-teal-500/20 transition-all placeholder:text-slate-300"
          />
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 w-5 h-5 group-focus-within:text-teal-500 transition-colors" />
        </div>

        {/* Filter Section */}
        <div className="flex-1 flex items-center justify-between gap-4 w-full">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
            {(['all', 'lost', 'found'] as const).map((type) => (
              <button
                key={type}
                onClick={() => setFilter(type)}
                className={cn(
                  "px-6 py-2 rounded-xl text-sm font-black transition-all whitespace-nowrap capitalize",
                  filter === type 
                    ? "bg-teal-600 text-white shadow-lg shadow-teal-100" 
                    : "bg-slate-50 text-slate-400 hover:bg-slate-100"
                )}
              >
                {t(`newsfeed.${type}`)}
              </button>
            ))}
          </div>
          
          <div className="flex items-center gap-2 shrink-0">
            <Select value={sortBy} onValueChange={(val: any) => setSortBy(val)}>
              <SelectTrigger className="w-[120px] h-10 bg-slate-50 border-none rounded-xl font-bold text-slate-600 text-[11px]">
                <SelectValue placeholder={t('common.sort') || "Sort"} />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-none shadow-xl">
                <SelectItem value="recent">{t('common.sort_recent')}</SelectItem>
                <SelectItem value="popular">{t('common.sort_popular')}</SelectItem>
                <SelectItem value="distance">{t('common.sort_distance')}</SelectItem>
              </SelectContent>
            </Select>

            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className={cn(
                "h-10 px-3 rounded-xl transition-all border-none font-bold text-[11px]",
                showAdvancedFilters ? "bg-orange-50 text-orange-600" : "bg-slate-50 text-slate-400 hover:bg-slate-100"
              )}
            >
              <Filter className="w-4 h-4 mr-1 md:mr-2" />
              <span className="hidden sm:inline">{t('common.filters')}</span>
            </Button>

            <Button 
              className="h-10 px-4 md:px-6 rounded-xl bg-teal-600 hover:bg-teal-700 text-white shadow-lg shadow-teal-100 font-bold text-[11px] shrink-0"
              onClick={onPostClick}
            >
              <Plus className="w-4 h-4 mr-1 md:mr-2" />
              <span className="hidden sm:inline">{t('newsfeed.create_report')}</span>
              <span className="sm:hidden">{t('common.post')}</span>
            </Button>
          </div>
        </div>
      </div>

      {/* SEARCH SUMMARY (Visible when searching) */}
      {searchQuery && (
        <div className="flex items-center justify-between px-6 py-2 animate-in fade-in slide-in-from-top-1 duration-300">
          <p className="text-sm font-bold text-slate-400">
            {t('newsfeed.results_for')} "<span className="text-teal-600">{searchQuery}</span>"
          </p>
          <button 
            onClick={() => setSearchQuery('')}
            className="text-xs font-black text-orange-500 hover:underline"
          >
            {t('common.clear_search')}
          </button>
        </div>
      )}
    </div>
  );
};
export default NewsFeedHeader;
