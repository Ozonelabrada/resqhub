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
  filter: 'all' | 'lost' | 'found' | 'reunited';
  setFilter: (filter: 'all' | 'lost' | 'found' | 'reunited') => void;
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
    <div className="space-y-6">
      <div className="flex gap-4 items-center">
        {/* SEARCH BAR (TOP) */}
        <div className="flex-1 bg-white p-2 rounded-2xl shadow-sm border border-gray-100 focus-within:ring-2 focus-within:ring-teal-500/20 transition-all">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-orange-600 w-5 h-5" />
            <Input 
              placeholder={t('common.search')} 
              className="pl-12 h-14 bg-transparent border-none text-lg font-medium placeholder:text-gray-400 focus-visible:ring-0 rounded-xl"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label={t('common.search')}
            />
          </div>
        </div>

        {/* POST BUTTON */}
        <Button 
          onClick={onPostClick}
          className="h-16 px-8 bg-teal-600 hover:bg-teal-700 text-white font-black rounded-2xl shadow-lg shadow-teal-100 transition-all flex items-center gap-3 shrink-0"
        >
          <Plus className="w-6 h-6 text-orange-500" />
          <span className="hidden sm:inline">Post Item</span>
        </Button>
      </div>

      {/* FILTER BAR */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between overflow-x-auto pb-2 scrollbar-none gap-2">
            <div className="flex items-center gap-2 flex-nowrap">
              {(['all', 'lost', 'found', 'reunited'] as const).map((type) => (
                <button
                  key={type}
                  onClick={() => setFilter(type)}
                  className={cn(
                    "px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap capitalize",
                    filter === type 
                      ? "bg-teal-600 text-white shadow-md shadow-teal-100" 
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  )}
                >
                  {t(`newsfeed.${type}`)}
                </button>
              ))}
            </div>
            
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className={cn(
                "flex items-center gap-1 transition-colors",
                showAdvancedFilters ? "text-orange-600" : "text-gray-500 hover:text-teal-600"
              )}
            >
              <Filter className="w-4 h-4" />
              <span className="hidden sm:inline">Advanced</span>
              <ChevronDown className={cn("w-4 h-4 transition-transform", showAdvancedFilters && "rotate-180")} />
            </Button>
          </div>

          {/* Advanced Controls */}
          {showAdvancedFilters && (
            <div className="pt-2 border-t border-gray-100 flex flex-col sm:flex-row gap-4">
              <Select value={sortBy} onValueChange={(v: any) => setSortBy(v)}>
                <SelectTrigger className="w-full sm:w-[180px] rounded-xl border-gray-200">
                  <SelectValue placeholder="Sort By" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="recent">Most Recent</SelectItem>
                  <SelectItem value="popular">Most Popular</SelectItem>
                  <SelectItem value="distance">Near Me</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NewsFeedHeader;
