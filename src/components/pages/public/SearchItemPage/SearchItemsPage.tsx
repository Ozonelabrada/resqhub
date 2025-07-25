import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { Badge } from 'primereact/badge';

const SearchItemsPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || null);
  const [isMobile, setIsMobile] = useState(false);

  // Sample data - replace with API call
  const [items, setItems] = useState([
    {
      id: 1,
      title: 'iPhone 14 Pro Max',
      category: 'Electronics',
      location: 'Central Park, NYC',
      date: '2025-07-24',
      status: 'lost',
      description: 'Black iPhone 14 Pro Max with blue case...',
      image: '/api/placeholder/200/150',
      reward: '$200'
    },
    // ... more items
  ]);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const categories = [
    { label: 'All Categories', value: null },
    { label: 'Electronics', value: 'Electronics' },
    { label: 'Accessories', value: 'Accessories' },
    { label: 'Keys', value: 'Keys' },
    { label: 'Jewelry', value: 'Jewelry' },
    { label: 'Documents', value: 'Documents' }
  ];

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

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>
      {/* Header */}
      <div className="bg-white shadow-2 sticky top-0 z-5">
        <div className={`${isMobile ? 'p-3' : 'p-4'}`} style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div className="flex justify-content-between align-items-center mb-3">
            <Button 
              icon="pi pi-arrow-left"
              label="Back to Hub"
              onClick={() => navigate('/')}
              className="p-button-text"
            />
            <h1 className="text-2xl font-bold text-gray-800 m-0">Search Items</h1>
            <Button 
              label="Report Item"
              icon="pi pi-plus"
              onClick={() => navigate('/report')}
              className="p-button-sm"
            />
          </div>
          
          {/* Search Bar */}
          <div className="grid" style={{ margin: '0' }}>
            <div className="col-12 md:col-8">
              <div className="p-inputgroup">
                <span className="p-inputgroup-addon">
                  <i className="pi pi-search"></i>
                </span>
                <InputText 
                  placeholder="Search for items..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="col-12 md:col-4">
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

      {/* Results */}
      <div className={`${isMobile ? 'p-3' : 'p-4'}`} style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div className="flex justify-content-between align-items-center mb-4">
          <h3 className="text-lg font-bold text-gray-800 m-0">
            Found {items.length} items
          </h3>
          <div className="flex gap-2">
            <Button 
              icon="pi pi-th-large"
              className="p-button-outlined p-button-sm"
            />
            <Button 
              icon="pi pi-list"
              className="p-button-outlined p-button-sm"
            />
          </div>
        </div>

        <div className="grid" style={{ margin: '0 -0.5rem' }}>
          {items.map((item) => (
            <div key={item.id} className="col-12 md:col-6 lg:col-4" style={{ padding: '0 0.5rem' }}>
              <Card className="mb-3 hover:shadow-4 transition-all transition-duration-200 cursor-pointer h-full">
                <div 
                  className="p-3"
                  onClick={() => navigate(`/item/${item.id}`)}
                >
                  {/* Image */}
                  <div className="w-full h-8rem bg-gray-200 border-round mb-3 overflow-hidden relative">
                    <img 
                      src={item.image} 
                      alt={item.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 right-2">
                      {getStatusBadge(item.status)}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="mb-3">
                    <h4 className="text-lg font-bold text-gray-800 mb-2 m-0">{item.title}</h4>
                    <p className="text-gray-600 text-sm mb-2 line-height-3">
                      {item.description}
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
                    {item.reward && (
                      <div className="bg-green-100 text-green-700 px-2 py-1 border-round text-sm font-medium">
                        {item.reward} reward
                      </div>
                    )}
                    <Button 
                      label="View Details"
                      icon="pi pi-eye"
                      className="p-button-sm p-button-outlined"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/item/${item.id}`);
                      }}
                    />
                  </div>
                </div>
              </Card>
            </div>
          ))}
        </div>

        {/* Load More */}
        <div className="text-center mt-4">
          <Button 
            label="Load More Items"
            icon="pi pi-chevron-down"
            className="p-button-outlined"
          />
        </div>
      </div>
    </div>
  );
};

export default SearchItemsPage;