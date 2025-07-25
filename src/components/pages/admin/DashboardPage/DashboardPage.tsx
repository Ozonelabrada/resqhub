import React, { useState, useEffect } from 'react';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { ProgressBar } from 'primereact/progressbar';
import { Toast } from 'primereact/toast';
import { useRef } from 'react';
import ItemDetailsModal from '../../../modals/ItemDetailsModal/ItemDetailsModal';

interface LostFoundItem {
  id: number;
  title: string;
  category: string;
  location: string;
  date: string;
  status: 'lost' | 'found' | 'matched';
  reportedBy: string;
  image?: string;
  description?: string;
  contactInfo?: string;
  reward?: string;
  timeReported?: string;
  specificLocation?: string;
  itemColor?: string;
  itemBrand?: string;
  itemSize?: string;
  matchedWith?: number;
}

const DashboardPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const [selectedItem, setSelectedItem] = useState<LostFoundItem | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const toast = useRef<Toast>(null);

  const [recentItems, setRecentItems] = useState<LostFoundItem[]>([
    { 
      id: 1, 
      title: 'iPhone 14 Pro', 
      category: 'Electronics', 
      location: 'Central Park', 
      date: '2025-07-24', 
      status: 'lost', 
      reportedBy: 'John Doe',
      image: '/api/placeholder/300/200',
      description: 'Black iPhone 14 Pro with a cracked screen protector. Has a blue case with initials "J.D." engraved on the back. Very important as it contains family photos and work contacts.',
      specificLocation: 'Near the playground area, around the bench by the fountain',
      itemColor: 'Black',
      itemBrand: 'Apple',
      itemSize: '6.1 inch',
      reward: '$200 reward',
      timeReported: '2025-07-24 14:30',
      contactInfo: 'john.doe@email.com'
    },
    { 
      id: 2, 
      title: 'Blue Backpack', 
      category: 'Accessories', 
      location: 'Metro Station', 
      date: '2025-07-23', 
      status: 'found', 
      reportedBy: 'Jane Smith',
      image: '/api/placeholder/300/200',
      description: 'Medium-sized blue backpack found at the metro station. Contains textbooks and a water bottle. No identification found inside.',
      specificLocation: 'Platform 3, left near the exit stairs',
      itemColor: 'Blue',
      itemBrand: 'JanSport',
      itemSize: 'Medium',
      timeReported: '2025-07-23 09:15',
      contactInfo: 'jane.smith@email.com'
    },
    { 
      id: 3, 
      title: 'Car Keys (Toyota)', 
      category: 'Keys', 
      location: 'Shopping Mall', 
      date: '2025-07-22', 
      status: 'matched', 
      reportedBy: 'Mike Johnson',
      image: '/api/placeholder/300/200',
      description: 'Toyota car keys with a black keychain. Successfully reunited with owner!',
      specificLocation: 'Food court area, table near Starbucks',
      itemColor: 'Black',
      itemBrand: 'Toyota',
      timeReported: '2025-07-22 16:45',
      matchedWith: 156,
      contactInfo: 'mike.johnson@email.com'
    },
    { 
      id: 4, 
      title: 'Gold Watch', 
      category: 'Jewelry', 
      location: 'Beach Resort', 
      date: '2025-07-21', 
      status: 'lost', 
      reportedBy: 'Sarah Wilson',
      image: '/api/placeholder/300/200',
      description: 'Vintage gold watch with leather strap. Family heirloom with significant sentimental value. Has inscription "To my beloved son" on the back.',
      specificLocation: 'Pool area, possibly near the lounge chairs',
      itemColor: 'Gold',
      itemBrand: 'Rolex',
      itemSize: 'Medium',
      reward: '$500 reward',
      timeReported: '2025-07-21 11:20',
      contactInfo: 'sarah.wilson@email.com'
    },
  ]);

  // Mobile detection
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const stats = {
    totalReports: 156,
    successfulMatches: 34,
    activeReports: 122,
    successRate: 22
  };

  const categories = [
    { label: 'All Categories', value: null },
    { label: 'Electronics', value: 'Electronics' },
    { label: 'Accessories', value: 'Accessories' },
    { label: 'Keys', value: 'Keys' },
    { label: 'Jewelry', value: 'Jewelry' },
    { label: 'Documents', value: 'Documents' }
  ];

  const filteredItems = recentItems.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      lost: { bg: 'bg-red-100', text: 'text-red-600', icon: 'pi-minus-circle' },
      found: { bg: 'bg-orange-100', text: 'text-orange-600', icon: 'pi-plus-circle' },
      matched: { bg: 'bg-green-100', text: 'text-green-600', icon: 'pi-check-circle' }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig];
    return (
      <span className={`${config.bg} ${config.text} px-2 py-1 border-round text-sm flex align-items-center gap-1`}>
        <i className={`pi ${config.icon}`} style={{ fontSize: '0.75rem' }}></i>
        {status.toUpperCase()}
      </span>
    );
  };

  const handleViewDetails = (item: LostFoundItem) => {
    setSelectedItem(item);
    setShowDetailsModal(true);
  };

  const handleContactReporter = (item: LostFoundItem) => {
    toast.current?.show({
      severity: 'info',
      summary: 'Contact Feature',
      detail: `Opening secure messaging with ${item.reportedBy}...`,
      life: 3000
    });
    setShowDetailsModal(false);
  };

  const handleMarkAsMatch = (item: LostFoundItem) => {
    toast.current?.show({
      severity: 'success',
      summary: 'Match Marked',
      detail: `Item "${item.title}" has been marked as a potential match!`,
      life: 3000
    });
    setShowDetailsModal(false);
  };

  return (
    <div className={`${isMobile ? 'p-2 pb-20' : 'p-4'}`} style={{ minHeight: '100vh' }}>
      <Toast ref={toast} />
      
      {/* Mobile-optimized Header */}
      <div className="mb-4">
        <div className={`flex ${isMobile ? 'flex-column' : 'justify-content-between'} align-items-${isMobile ? 'start' : 'center'} mb-2`}>
          <h1 className={`${isMobile ? 'text-2xl' : 'text-3xl'} font-bold text-gray-800`}>Dashboard</h1>
          {!isMobile && (
            <div className="flex align-items-center gap-2 text-sm text-gray-500">
              <div className="w-2 h-2 bg-green-500 border-round animation-pulse"></div>
              Live Updates Active
            </div>
          )}
        </div>
        <p className="text-gray-600">Welcome back! Here's what's happening with lost and found items.</p>
      </div>

      {/* Enhanced Stats Grid - Full Width */}
      <div className="grid mb-4" style={{ margin: '0 -0.5rem' }}>
        <div className="col-12 md:col-3" style={{ padding: '0 0.5rem' }}>
          <Card className="text-center bg-blue-50 hover:shadow-3 transition-all transition-duration-200 h-full">
            <div className="flex flex-column align-items-center justify-content-center" style={{ minHeight: '120px' }}>
              <div className="flex align-items-center gap-2 mb-2">
                <i className="pi pi-file text-blue-600" style={{ fontSize: '1.5rem' }}></i>
                <div className={`${isMobile ? 'text-2xl' : 'text-3xl'} font-bold text-blue-600`}>{stats.totalReports}</div>
              </div>
              <div className="text-gray-600 mb-3 font-medium">Total Reports</div>
              <ProgressBar 
                value={75} 
                showValue={false} 
                style={{ height: '6px', width: '100%' }}
                className="w-full"
              />
              <small className="text-gray-500 mt-2">+12% from last month</small>
            </div>
          </Card>
        </div>
        
        <div className="col-12 md:col-3" style={{ padding: '0 0.5rem' }}>
          <Card className="text-center bg-green-50 hover:shadow-3 transition-all transition-duration-200 h-full">
            <div className="flex flex-column align-items-center justify-content-center" style={{ minHeight: '120px' }}>
              <div className="flex align-items-center gap-2 mb-2">
                <i className="pi pi-check-circle text-green-600" style={{ fontSize: '1.5rem' }}></i>
                <div className={`${isMobile ? 'text-2xl' : 'text-3xl'} font-bold text-green-600`}>{stats.successfulMatches}</div>
              </div>
              <div className="text-gray-600 mb-3 font-medium">Successful Matches</div>
              <ProgressBar 
                value={stats.successRate} 
                showValue={false} 
                style={{ height: '6px', width: '100%' }}
                className="w-full"
              />
              <small className="text-gray-500 mt-2">22% success rate</small>
            </div>
          </Card>
        </div>
        
        <div className="col-12 md:col-3" style={{ padding: '0 0.5rem' }}>
          <Card className="text-center bg-orange-50 hover:shadow-3 transition-all transition-duration-200 h-full">
            <div className="flex flex-column align-items-center justify-content-center" style={{ minHeight: '120px' }}>
              <div className="flex align-items-center gap-2 mb-2">
                <i className="pi pi-clock text-orange-600" style={{ fontSize: '1.5rem' }}></i>
                <div className={`${isMobile ? 'text-2xl' : 'text-3xl'} font-bold text-orange-600`}>{stats.activeReports}</div>
              </div>
              <div className="text-gray-600 mb-3 font-medium">Active Reports</div>
              <ProgressBar 
                value={78} 
                showValue={false} 
                style={{ height: '6px', width: '100%' }}
                className="w-full"
              />
              <small className="text-gray-500 mt-2">Awaiting matches</small>
            </div>
          </Card>
        </div>
        
        <div className="col-12 md:col-3" style={{ padding: '0 0.5rem' }}>
          <Card className="text-center bg-purple-50 hover:shadow-3 transition-all transition-duration-200 h-full">
            <div className="flex flex-column align-items-center justify-content-center" style={{ minHeight: '120px' }}>
              <div className="flex align-items-center gap-2 mb-2">
                <i className="pi pi-chart-line text-purple-600" style={{ fontSize: '1.5rem' }}></i>
                <div className={`${isMobile ? 'text-2xl' : 'text-3xl'} font-bold text-purple-600`}>{stats.successRate}%</div>
              </div>
              <div className="text-gray-600 mb-3 font-medium">Success Rate</div>
              <ProgressBar 
                value={stats.successRate} 
                showValue={false} 
                style={{ height: '6px', width: '100%' }}
                className="w-full"
              />
              <small className="text-gray-500 mt-2">Above average</small>
            </div>
          </Card>
        </div>
      </div>

      {/* Mobile-optimized Search and Filter */}
      <Card className="mb-4">
        <h3 className="mb-3">Quick Search & Actions</h3>
        <div className="grid">
          <div className="col-12">
            <div className="p-inputgroup mb-3">
              <span className="p-inputgroup-addon">
                <i className="pi pi-search"></i>
              </span>
              <InputText 
                placeholder="Search items or locations..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className={`col-12 ${isMobile ? '' : 'md:col-6'}`}>
            <Dropdown 
              value={selectedCategory} 
              options={categories} 
              onChange={(e) => setSelectedCategory(e.value)} 
              placeholder="Filter by category"
              className="w-full mb-3"
            />
          </div>
          <div className={`col-12 ${isMobile ? '' : 'md:col-6'}`}>
            <div className={`flex ${isMobile ? 'flex-column' : ''} gap-2`}>
              <Button 
                label={isMobile ? "Report Lost" : "Report Lost Item"}
                icon="pi pi-minus-circle" 
                severity="danger"
                className={`${isMobile ? 'w-full mb-2' : 'flex-1'}`}
              />
              <Button 
                label={isMobile ? "Report Found" : "Report Found Item"}
                icon="pi pi-plus-circle" 
                severity="success"
                className={`${isMobile ? 'w-full' : 'flex-1'}`}
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Mobile-optimized Recent Items */}
      <Card>
        <div className="flex justify-content-between align-items-center mb-3">
          <h3>Recent Reports</h3>
          <Button 
            label={isMobile ? "All" : "View All"} 
            icon="pi pi-arrow-right" 
            className="p-button-text p-button-sm"
          />
        </div>
        
        {filteredItems.length === 0 ? (
          <div className="text-center p-4 text-gray-500">
            <i className="pi pi-search text-4xl mb-3"></i>
            <div>No items found matching your search criteria</div>
          </div>
        ) : (
          <div className="flex flex-column gap-3">
            {filteredItems.map((item) => (
              <div key={item.id} className={`flex ${isMobile ? 'flex-column' : 'justify-content-between align-items-center'} p-3 border-round surface-border border-1 hover:surface-hover transition-all transition-duration-200`}>
                <div className={`flex align-items-center gap-3 ${isMobile ? 'w-full mb-2' : ''}`}>
                  <div className="w-3rem h-3rem bg-gray-200 border-round flex align-items-center justify-content-center">
                    <i className="pi pi-image text-gray-500"></i>
                  </div>
                  <div className="flex-1">
                    <div className="font-bold">{item.title}</div>
                    <div className={`text-gray-600 ${isMobile ? 'text-sm' : 'text-sm'}`}>
                      <i className="pi pi-tag mr-1"></i>
                      {item.category} • 
                      <i className="pi pi-map-marker ml-2 mr-1"></i>
                      {item.location} • 
                      <i className="pi pi-calendar ml-2 mr-1"></i>
                      {item.date}
                    </div>
                  </div>
                </div>
                <div className={`flex align-items-center gap-2 ${isMobile ? 'w-full justify-content-between' : ''}`}>
                  {getStatusBadge(item.status)}
                  <div className="flex gap-2">
                    <Button 
                      icon="pi pi-eye" 
                      size="small" 
                      outlined 
                      tooltip="View Details"
                      onClick={() => handleViewDetails(item)}
                    />
                    <Button 
                      icon="pi pi-envelope" 
                      size="small" 
                      outlined 
                      tooltip="Contact Reporter"
                      onClick={() => handleContactReporter(item)}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Item Details Modal */}
      <ItemDetailsModal
        item={selectedItem}
        visible={showDetailsModal}
        onHide={() => setShowDetailsModal(false)}
        onContact={handleContactReporter}
        onMarkMatch={handleMarkAsMatch}
      />
    </div>
  );
};

export default DashboardPage;