import React from 'react';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';

interface SearchSectionProps {
  searchTerm: string;
  selectedCategory: string | null;
  categories: any[];
  categoriesLoading: boolean;
  isBelowDesktop: boolean;
  stats: any;
  onSearchTermChange: (value: string) => void;
  onCategoryChange: (value: any) => void;
  onSearch: () => void;
}

const SearchSection: React.FC<SearchSectionProps> = ({
  searchTerm,
  selectedCategory,
  categories,
  categoriesLoading,
  isBelowDesktop,
  stats,
  onSearchTermChange,
  onCategoryChange,
  onSearch
}) => {
  return (
    <Card className="shadow-lg border-0" style={{ backgroundColor: 'white' }}>
      <div className={`${isBelowDesktop ? 'flex-column' : 'flex'} gap-3`}>
        {/* Search Controls */}
        <div className={`flex ${isBelowDesktop ? 'flex-column' : ''} gap-3 ${isBelowDesktop ? 'w-full' : 'flex-1'}`}>
          <InputText
            value={searchTerm}
            onChange={(e) => onSearchTermChange(e.target.value)}
            placeholder="Search for lost or found items..."
            className="flex-1"
            style={{
              fontSize: '16px',
              padding: '12px 16px',
              color: '#374151',
              border: '1px solid #d1d5db',
              borderRadius: '6px'
            }}
            onKeyPress={(e) => e.key === 'Enter' && onSearch()}
          />
          <Dropdown
            value={categoriesLoading ? null : selectedCategory}
            options={categories}
            onChange={(e) => onCategoryChange(e.value)}
            placeholder="Category"
            className={isBelowDesktop ? 'w-full' : 'w-12rem'}
            style={{
              minWidth: isBelowDesktop ? 'auto' : '150px',
              color: '#374151'
            }}
          />
          <Button
            label="Search"
            icon="pi pi-search"
            onClick={onSearch}
            className="p-button-primary"
            style={{
              minWidth: '100px',
              backgroundColor: '#3b82f6',
              borderColor: '#3b82f6',
              color: 'white'
            }}
          />
        </div>

        {/* Desktop: Today's Activity to the right of search */}
        {!isBelowDesktop && stats && (
          <div className="flex align-items-center gap-4 border-left-2 border-blue-200 pl-4">
            <div className="text-xs text-gray-500 font-medium">Today's Activity:</div>
            <div className="flex gap-3">
              <div className="text-center">
                <div className="text-sm font-bold text-blue-600">{stats.newUsersToday}</div>
                <div className="text-xs text-gray-500">New Users</div>
              </div>
              <div className="text-center">
                <div className="text-sm font-bold text-green-600">{stats.itemsReportedToday}</div>
                <div className="text-xs text-gray-500">Items Reported</div>
              </div>
              <div className="text-center">
                <div className="text-sm font-bold text-orange-600">{stats.matchesMadeToday}</div>
                <div className="text-xs text-gray-500">Matches Made</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Mobile/Tablet: Today's Activity below search */}
      {isBelowDesktop && stats && (
        <div className="mt-3 pt-3 border-top-1 border-gray-200">
          <div className="text-xs text-gray-500 font-medium mb-2 text-center">Today's Activity</div>
          <div className="flex justify-content-center gap-4">
            <div className="text-center">
              <div className="text-sm font-bold text-blue-600">{stats.newUsersToday}</div>
              <div className="text-xs text-gray-500">New Users</div>
            </div>
            <div className="text-center">
              <div className="text-sm font-bold text-green-600">{stats.itemsReportedToday}</div>
              <div className="text-xs text-gray-500">Items Reported</div>
            </div>
            <div className="text-center">
              <div className="text-sm font-bold text-orange-600">{stats.matchesMadeToday}</div>
              <div className="text-xs text-gray-500">Matches Made</div>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
};

export default SearchSection;