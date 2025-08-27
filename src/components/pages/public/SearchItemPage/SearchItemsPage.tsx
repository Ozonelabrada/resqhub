import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { Badge } from 'primereact/badge';
import { ProgressSpinner } from 'primereact/progressspinner';
import ItemDetailsModal from '../../../modals/ItemDetailsModal';
import { ItemsService } from '../../../../services/itemsService';

const itemsService = ItemsService;

const SearchItemsPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || null);
  const [isMobile, setIsMobile] = useState(false);
  
  // Modal state
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);

  // Infinite scroll states
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [initialLoad, setInitialLoad] = useState(true);

  const ITEMS_PER_PAGE = 10;

  // Fetch items from API service
  const fetchItems = useCallback(
    async (page: number, searchQuery?: string) => {
      setLoading(true);
      try {
        // Only include search if not empty string
        const query = (typeof searchQuery === 'string' && searchQuery.trim() === '') ? undefined : searchQuery;
        const response = await itemsService.getReportsSearch(page, query ?? '');
        let apiItems = response.data?.data?.data ?? [];
        if (!Array.isArray(apiItems)) apiItems = [];
        const hasMoreData = apiItems.length === ITEMS_PER_PAGE;

        return {
          items: apiItems,
          hasMore: hasMoreData,
          totalCount: response.data?.data?.totalCount,
        };
      } catch (error) {
        console.error('Error fetching items:', error);
        return { items: [], hasMore: false };
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Load initial items
  useEffect(() => {
    if (initialLoad) {
      setInitialLoad(false);
      setItems([]);
      setCurrentPage(1);
      setHasMore(true);
      
      fetchItems(
        1,
        searchTerm ?? undefined
      ).then(result => {
        setItems(result.items);
        setHasMore(result.hasMore);
      });
    }
  }, [fetchItems, initialLoad, searchTerm, selectedCategory]);

  // Reset search when filters change
  useEffect(() => {
    if (!initialLoad) {
      setItems([]);
      setCurrentPage(1);
      setHasMore(true);
      setInitialLoad(true);
    }
  }, [searchTerm, selectedCategory]);

  // Load more items
  const loadMoreItems = useCallback(async () => {
    if (loading || !hasMore) return;

    const nextPage = currentPage + 1;
    const result = await fetchItems(nextPage, searchTerm ?? undefined);
    if (result.items.length > 0) {
      setItems(prev => [...prev, ...result.items]);
      setCurrentPage(nextPage);
      setHasMore(result.hasMore);
    } else {
      setHasMore(false);
    }
  }, [loading, hasMore, currentPage, fetchItems, searchTerm, selectedCategory]);

  // Infinite scroll detection
  useEffect(() => {
    const handleScroll = () => {
      if (loading || !hasMore) return;
      
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const scrollHeight = document.documentElement.scrollHeight;
      const clientHeight = window.innerHeight;
      
      // Trigger load more when user is 200px from bottom
      if (scrollTop + clientHeight >= scrollHeight - 200) {
        loadMoreItems();
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [loadMoreItems, loading, hasMore]);

  // Mobile detection
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const [categories, setCategories] = useState<{ label: string; value: string | null }[]>(
    [{ label: 'All Categories', value: null }]
  );

  // Fetch categories from API on mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await itemsService.getCategories?.();
        const apiCategories = response?.data?.data || response?.data || [];
        const formatted = apiCategories.map((cat: any) => ({
          label: cat.name, 
          value: cat.name  
        }));
        setCategories([{ label: 'All Categories', value: null }, ...formatted]);
      } catch (err) {
        setCategories([{ label: 'All Categories', value: null }]);
      }
    };
    fetchCategories();
  }, []);

  const getStatusBadge = (status: string) => {
    const config = status === 'lost' 
      ? { severity: 'danger' as const, icon: 'pi-minus-circle', label: 'LOST' }
      : { severity: 'success' as const, icon: 'pi-plus-circle', label: 'FOUND' };
    
    return (
      <Badge 
        value={config.label} 
        severity={config.severity}
        className="flex align-items-center gap-1"
      />
    );
  };

  const handleViewDetails = (item: any, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedItem(item);
    setIsModalVisible(true);
  };

  const handleCloseModal = () => {
    setIsModalVisible(false);
    setSelectedItem(null);
  };

  return (
    <div style={{ minHeight: '100vh',
          background: 'linear-gradient(135deg, #353333ff 0%, #475a4bff 50%, #888887ff 100%)',
           color: '#ffffffff', width: '100%' }}>
      {/* Header */}
      <div className="bg-white shadow-2 sticky top-0 z-5 w-full">
        <div className="px-4 py-4" style={{ width: '100%' }}>
          <div className="flex justify-content-between align-items-center mb-3">
           <h1 className="text-2xl font-bold text-gray-800 m-0">Search Items</h1>
            
          </div>
          
          {/* Search Bar */}
          <div className="w-full">
            <div className={`flex ${isMobile ? 'flex-column gap-2' : 'gap-3'} w-full`}>
              <div className={`${isMobile ? 'w-full' : 'flex-1'}`}>
                <div className="p-inputgroup w-full">
                  <span className="p-inputgroup-addon">
                    <i className="pi pi-search"></i>
                  </span>
                  <InputText 
                    placeholder="Search for items..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full"
                  />
                </div>
              </div>
              <div className={`${isMobile ? 'w-full' : 'w-18rem'}`}>
                <Dropdown 
                  value={selectedCategory}
                  options={categories}
                  onChange={(e) => setSelectedCategory(e.value)}
                  placeholder="All Categories"
                  className="w-full"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="px-4 py-4 w-full">
        <div className="flex justify-content-between align-items-center mb-4">
          <h3 className="text-lg font-bold text-gray-800 m-0">
            {items.length > 0 ? `Found ${items.length}${hasMore ? '+' : ''} items` : 'No items found'}
            {searchTerm && ` for "${searchTerm}"`}
            {selectedCategory && ` in ${selectedCategory}`}
          </h3>
          <div className="flex gap-2">
            <Button 
              icon="pi pi-th-large"
              className="p-button-outlined p-button-sm"
              tooltip="Grid View"
            />
            <Button 
              icon="pi pi-list"
              className="p-button-outlined p-button-sm"
              tooltip="List View"
            />
          </div>
        </div>

        {items.length === 0 && !loading ? (
          <div className="text-center py-8">
            <i className="pi pi-search" style={{ fontSize: '3rem', color: '#6c757d' }}></i>
            <h3 className="text-gray-600 mt-3">No items found</h3>
            <p className="text-gray-500">Try adjusting your search terms or browse all categories</p>
            <Button 
              label="Clear Filters"
              className="p-button-outlined mt-3"
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory(null);
              }}
            />
          </div>
        ) : (
          <div className="w-full">
            <div 
              className="grid w-full" 
              style={{ 
                margin: '0',
                display: 'grid',
                gridTemplateColumns: isMobile 
                  ? '1fr' 
                  : 'repeat(auto-fill, minmax(320px, 1fr))',
                gap: '1rem',
                width: '100%'
              }}
            >
              {items.map((item) => (
                <div key={item.id} className="w-full">
                  <Card className="h-full hover:shadow-4 transition-all transition-duration-200 cursor-pointer w-full">
                    <div 
                      className="p-3 w-full"
                      onClick={() => handleViewDetails(item, {} as React.MouseEvent)}
                    >
                      {/* Image */}
                      <div className="w-full h-8rem bg-gray-200 border-round mb-3 overflow-hidden relative">
                        <img 
                          src={item.image} 
                          alt={item.title}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjE1MCIgdmlld0JveD0iMCAwIDIwMCAxNTAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMTUwIiBmaWxsPSIjRjVGNUY1Ii8+CjxwYXRoIGQ9Ik03MCA2MEg3NFY2NEg3OFY2OEg4MlY3Mkg4NlY3Nkg5MFY4MEg5NFY4NEg5OFY4OEgxMDJWOTJIMTA2Vjk2SDExMFYxMDBIMTEwVjEwNEgxMThWMTA4SDEyMlYxMTJIMTI2VjExNkgxMzBWMTIwSDEzNFYxMjRIMTM4VjEyOEgxNDJWMTMySDEzOFYxMjhIMTM0VjEyNEgxMzBWMTIwSDEyNlYxMTZIMTIyVjExMkgxMThWMTA4SDExNFYxMDRIMTEwVjEwMEgxMDZWOTZIMTAyVjkySDk4Vjg4SDk0Vjg0SDkwVjgwSDg2Vjc2SDgyVjcySDc4VjY4SDc0VjY0SDcwVjYwWiIgZmlsbD0iI0M0QzRDNCIvPgo8L3N2Zz4K';
                          }}
                        />
                        <div className="absolute top-2 right-2">
                          {getStatusBadge(item.type)}
                        </div>
                      </div>

                      {/* Content */}
                      <div className="mb-3">
                        <h4 className="text-lg font-bold text-gray-800 mb-2 m-0">{item.title}</h4>
                        <div className="flex align-items-center gap-2 text-xs text-gray-500 mb-2">
                          <Badge value={item.category} className="bg-blue-100 text-blue-700" />
                        </div>
                        <p className="text-gray-600 text-sm mb-2 line-height-3">
                          {item.description.length > 100 
                            ? `${item.description.substring(0, 100)}...` 
                            : item.description
                          }
                        </p>
                        <div className="flex align-items-center gap-2 text-sm text-gray-500">
                          <i className="pi pi-map-marker"></i>
                          <span>{item.location}</span>
                        </div>
                        <div className="flex align-items-center gap-2 text-sm text-gray-500 mt-1">
                          <i className="pi pi-calendar"></i>
                          <span>{item.date}</span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex justify-content-between align-items-center">
                        {item.reward ? (
                          <div className="bg-green-100 text-green-700 px-2 py-1 border-round text-sm font-medium">
                            {item.reward} reward
                          </div>
                        ) : (
                          <div></div>
                        )}
                        <div className="flex align-items-center gap-3">
                          <div className="flex align-items-center gap-1 text-gray-500">
                            <i className="pi pi-thumbs-up" style={{ fontSize: '1rem' }}></i>
                            <span style={{ fontSize: '0.95rem' }}>{item.likeCount ?? 0}</span>
                          </div>
                          <div className="flex align-items-center gap-1 text-gray-500">
                            <i className="pi pi-comments" style={{ fontSize: '1rem' }}></i>
                            <span style={{ fontSize: '0.95rem' }}>{item.commentCount ?? 0}</span>
                          </div>
                          <div className="flex align-items-center gap-1 text-gray-500">
                            <i className="pi pi-eye" style={{ fontSize: '1rem' }}></i>
                            <span style={{ fontSize: '0.95rem' }}>{item.watchCount ?? 0}</span>
                          </div>
                          <Button 
                            label="View Details"
                            icon="pi pi-eye"
                            className="p-button-sm p-button-outlined"
                            onClick={(e) => handleViewDetails(item, e)}
                          />
                        </div>
                      </div>
                    </div>
                    </Card>
                  </div>
                ))}
            </div>

            {/* Loading Indicator */}
            {loading && (
              <div className="text-center mt-6 py-4">
                <ProgressSpinner style={{ width: '50px', height: '50px' }} />
                <p className="mt-3 text-gray-600 font-medium">Loading more items...</p>
              </div>
            )}

            {/* End of Results Indicator */}
            {!loading && !hasMore && items.length > 0 && (
              <div className="text-center mt-6 py-4">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100  p-4 max-w-md mx-auto">
                  <i className="pi pi-check-circle text-blue-500 text-2xl mb-2 block"></i>
                  <p className="text-blue-700 font-semibold mb-1">That's all!</p>
                  <p className="text-blue-600 text-sm">You've reached the end of the results.</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* View Details Modal */}
      <ItemDetailsModal
        visible={isModalVisible}
        onHide={handleCloseModal}
        item={selectedItem}
      />
    </div>
  );
};

export default SearchItemsPage;