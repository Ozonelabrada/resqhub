import React, { useState, useEffect } from 'react';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { ProgressBar } from 'primereact/progressbar';
import { Toast } from 'primereact/toast';
import { ConfirmDialog } from 'primereact/confirmdialog';
import { useRef } from 'react';
import ItemDetailsModal from '../../../modals/ItemDetailsModal/ItemDetailsModal';
import ConfirmationModal from '../../../modals/ConfirmationModal/ConfirmationModal';
import { AdminService } from '../../../../services/adminService';
import { useNavigate } from 'react-router-dom';

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
  const [isTablet, setIsTablet] = useState(false);
  const [selectedItem, setSelectedItem] = useState<LostFoundItem | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<LostFoundItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [adminUser, setAdminUser] = useState<{ name: string; email: string; role?: string } | null>(null);
  const toast = useRef<Toast>(null);
  const navigate = useNavigate();

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
      description: 'Vintage gold watch with leather strap. Family heirloom with sentimental value.',
      specificLocation: 'Lost near the volleyball courts',
      itemColor: 'Gold',
      itemBrand: 'Rolex',
      timeReported: '2025-07-21 11:20',
      reward: '$500 reward',
      contactInfo: 'sarah.wilson@email.com'
    },
    { 
      id: 5, 
      title: 'Black Wallet', 
      category: 'Accessories', 
      location: 'Coffee Shop', 
      date: '2025-07-20', 
      status: 'found', 
      reportedBy: 'Alex Brown',
      image: '/api/placeholder/300/200',
      description: 'Black leather wallet found at coffee shop. Contains ID and credit cards.',
      specificLocation: 'Left on table near the window',
      itemColor: 'Black',
      itemBrand: 'Unknown',
      timeReported: '2025-07-20 08:30',
      contactInfo: 'alex.brown@email.com'
    },
    { 
      id: 6, 
      title: 'Red Scarf', 
      category: 'Clothing', 
      location: 'Bus Station', 
      date: '2025-07-19', 
      status: 'lost', 
      reportedBy: 'Emma Davis',
      image: '/api/placeholder/300/200',
      description: 'Red wool scarf with floral pattern. Handmade by grandmother.',
      specificLocation: 'Bus stop #7, bench area',
      itemColor: 'Red',
      timeReported: '2025-07-19 17:45',
      contactInfo: 'emma.davis@email.com'
    },
    { 
      id: 7, 
      title: 'AirPods Pro', 
      category: 'Electronics', 
      location: 'University Library', 
      date: '2025-07-18', 
      status: 'lost', 
      reportedBy: 'Mark Thompson',
      image: '/api/placeholder/300/200',
      description: 'White AirPods Pro with custom case. Lost in study area.',
      specificLocation: 'Third floor, study room B',
      itemColor: 'White',
      itemBrand: 'Apple',
      timeReported: '2025-07-18 14:15',
      contactInfo: 'mark.t@email.com'
    },
    { 
      id: 8, 
      title: 'Sunglasses', 
      category: 'Accessories', 
      location: 'Beach Park', 
      date: '2025-07-17', 
      status: 'found', 
      reportedBy: 'Lisa Chen',
      image: '/api/placeholder/300/200',
      description: 'Designer sunglasses found on beach. Ray-Ban style with polarized lenses.',
      specificLocation: 'Near volleyball court, buried in sand',
      itemColor: 'Black',
      itemBrand: 'Ray-Ban',
      timeReported: '2025-07-17 16:30',
      contactInfo: 'lisa.chen@email.com'
    }
  ]);

  // Enhanced responsive detection
  useEffect(() => {
    const checkScreenSize = () => {
      const width = window.innerWidth;
      setIsMobile(width < 768);
      setIsTablet(width >= 768 && width < 1024);
    };
    
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  useEffect(() => {
    // Fetch current admin user from backend
    const fetchAdminUser = async () => {
      try {
        const adminUserData = localStorage.getItem('adminUserData');
        if (!adminUserData) {
          setAdminUser(null);
          navigate('/admin/login', { replace: true });
          return;
        }
        const parsedUser = JSON.parse(adminUserData);
        // Check role (case-insensitive)
        if (!parsedUser.role || parsedUser.role.toLowerCase() !== 'admin') {
          setAdminUser(null);
          localStorage.removeItem('adminUserData');
          localStorage.removeItem('adminToken');
          localStorage.removeItem('adminUserId');
          navigate('/admin/login', { replace: true });
          return;
        }
        setAdminUser(parsedUser);
      } catch (err) {
        setAdminUser(null);
        localStorage.removeItem('adminUserData');
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminUserId');
        navigate('/admin/login', { replace: true });
      }
    };
    fetchAdminUser();
  }, [navigate]);

  const categories = [
    { label: 'All Categories', value: null },
    { label: 'Electronics', value: 'Electronics' },
    { label: 'Accessories', value: 'Accessories' },
    { label: 'Keys', value: 'Keys' },
    { label: 'Jewelry', value: 'Jewelry' },
    { label: 'Clothing', value: 'Clothing' }
  ];

  // Filter items based on search and category
  const filteredItems = recentItems.filter(item => {
    const matchesSearch = !searchTerm || 
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.location.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = !selectedCategory || item.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      lost: { bg: 'bg-red-100', text: 'text-red-600', icon: 'pi-minus-circle' },
      found: { bg: 'bg-blue-100', text: 'text-blue-600', icon: 'pi-plus-circle' },
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

  // Convert admin item to modal format
  const convertToModalFormat = (item: LostFoundItem) => {
    return {
      id: item.id,
      title: item.title,
      description: item.description || 'No description available',
      category: item.category,
      location: item.location,
      date: item.date,
      images: item.image ? [item.image] : ['/api/placeholder/400/300'],
      status: 'active' as const,
      type: (item.status === 'lost' ? 'lost' : 'found') as 'lost' | 'found',
      contactInfo: {
        name: item.reportedBy,
        email: item.contactInfo || undefined
      },
      ownerId: item.id
    };
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

  // Handle delete item
  const handleDeleteItem = (item: LostFoundItem) => {
    setItemToDelete(item);
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = async () => {
    if (!itemToDelete) return;
    
    setIsDeleting(true);
    
    try {
      // Simulate async delete process
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Remove item from state
      setRecentItems(prevItems => 
        prevItems.filter(item => item.id !== itemToDelete.id)
      );
      
      toast.current?.show({
        severity: 'success',
        summary: 'Item Deleted',
        detail: `"${itemToDelete.title}" has been successfully deleted.`,
        life: 3000
      });
    } catch (error) {
      toast.current?.show({
        severity: 'error',
        summary: 'Delete Failed',
        detail: 'Failed to delete item. Please try again.',
        life: 3000
      });
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
      setItemToDelete(null);
    }
  };

  // Responsive grid columns calculation
  const getGridColumns = () => {
    if (isMobile) return 1;
    if (isTablet) return 2;
    return window.innerWidth >= 1400 ? 4 : 3;
  };

  const gridColumns = getGridColumns();

  return (
    <div 
      className="w-full"
      style={{ 
        padding: isMobile ? '0.5rem' : '1rem',
        paddingBottom: isMobile ? '5rem' : '1rem',
        background: 'linear-gradient(135deg, #353333ff 0%, #475a4bff 50%, #888887ff 100%)',
      }}
    >
      <Toast ref={toast} />
      <ConfirmDialog />
      
      {/* Full-width Container */}
      <div className="w-full max-w-full mx-auto">
        
        {/* Header Section - Simplified */}
        <div className="w-full mb-4">
          <div className={`flex ${isMobile ? 'flex-column gap-2' : 'justify-content-between align-items-center'} mb-3`}>
            <div>
              <h1 className={`${isMobile ? 'text-2xl' : 'text-3xl'} font-bold text-gray-800 m-0`}>
                Admin Dashboard
              </h1>
              <p className="text-gray-600 m-0 mt-1">
                {isMobile ? 'Manage lost & found items' : 'Manage and track all lost & found items'}
              </p>
            </div>
            
            {/* Live Status Indicator */}
            <div className="flex align-items-center gap-2 text-sm text-gray-500">
              <div className="w-2 h-2 bg-green-500 border-round animation-pulse"></div>
              {isMobile ? 'Live' : 'Live Updates Active'}
            </div>
          </div>

          {/* Header with admin user */}
          <div className="w-full mb-4 flex justify-content-between align-items-center">
            <div>
              <h1 className={`${isMobile ? 'text-2xl' : 'text-3xl'} font-bold text-gray-800 m-0`}>
                Admin Dashboard
              </h1>
              <p className="text-gray-600 m-0 mt-1">
                {isMobile ? 'Manage lost & found items' : 'Manage and track all lost & found items'}
              </p>
            </div>
            {adminUser && (
              <div className="flex align-items-center gap-2">
                <i className="pi pi-user text-primary"></i>
                <span className="font-semibold">{adminUser.name || adminUser.email}</span>
              </div>
            )}
          </div>
        </div>

        {/* Stats Cards - Responsive Grid */}
        <div 
          className="w-full mb-4"
          style={{
            display: 'grid',
            gridTemplateColumns: isMobile 
              ? '1fr 1fr' 
              : isTablet 
                ? 'repeat(4, 1fr)' 
                : 'repeat(4, 1fr)',
            gap: isMobile ? '0.5rem' : '1rem'
          }}
        >
          <Card className="bg-blue-50 border-blue-200">
            <div className="flex align-items-center justify-content-between">
              <div>
                <div className={`text-blue-600 font-bold ${isMobile ? 'text-xl' : 'text-2xl'}`}>24</div>
                <div className={`text-blue-500 ${isMobile ? 'text-xs' : 'text-sm'}`}>Total Reports</div>
              </div>
              <i className={`pi pi-file text-blue-400`} style={{ fontSize: isMobile ? '1.5rem' : '2rem' }}></i>
            </div>
          </Card>
          
          <Card className="bg-red-50 border-red-200">
            <div className="flex align-items-center justify-content-between">
              <div>
                <div className={`text-red-600 font-bold ${isMobile ? 'text-xl' : 'text-2xl'}`}>15</div>
                <div className={`text-red-500 ${isMobile ? 'text-xs' : 'text-sm'}`}>Lost Items</div>
              </div>
              <i className={`pi pi-minus-circle text-red-400`} style={{ fontSize: isMobile ? '1.5rem' : '2rem' }}></i>
            </div>
          </Card>
          
          <Card className="bg-green-50 border-green-200">
            <div className="flex align-items-center justify-content-between">
              <div>
                <div className={`text-green-600 font-bold ${isMobile ? 'text-xl' : 'text-2xl'}`}>9</div>
                <div className={`text-green-500 ${isMobile ? 'text-xs' : 'text-sm'}`}>Found Items</div>
              </div>
              <i className={`pi pi-plus-circle text-green-400`} style={{ fontSize: isMobile ? '1.5rem' : '2rem' }}></i>
            </div>
          </Card>
          
          <Card className="bg-orange-50 border-orange-200">
            <div className="flex align-items-center justify-content-between">
              <div>
                <div className={`text-orange-600 font-bold ${isMobile ? 'text-xl' : 'text-2xl'}`}>3</div>
                <div className={`text-orange-500 ${isMobile ? 'text-xs' : 'text-sm'}`}>Matches Made</div>
              </div>
              <i className={`pi pi-check-circle text-orange-400`} style={{ fontSize: isMobile ? '1.5rem' : '2rem' }}></i>
            </div>
          </Card>
        </div>

        {/* Performance Metrics - Side by Side */}
        <div 
          className="w-full mb-4"
          style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
            gap: '1rem'
          }}
        >
          <Card title="Resolution Rate" className="h-full">
            <div className="mb-3">
              <div className="flex justify-content-between mb-2">
                <span className="text-sm text-gray-600">This Month</span>
                <span className="text-sm font-medium">78%</span>
              </div>
              <ProgressBar value={78} className="h-1rem" />
            </div>
            <div className="mb-3">
              <div className="flex justify-content-between mb-2">
                <span className="text-sm text-gray-600">Last Month</span>
                <span className="text-sm font-medium">65%</span>
              </div>
              <ProgressBar value={65} className="h-1rem" />
            </div>
            <div className="text-green-600 text-sm">
              <i className="pi pi-arrow-up mr-1"></i>
              +13% improvement
            </div>
          </Card>
          
          <Card title="Response Time" className="h-full">
            <div className="mb-3">
              <div className="flex justify-content-between mb-2">
                <span className="text-sm text-gray-600">Average Response</span>
                <span className="text-sm font-medium">2.4 hours</span>
              </div>
              <ProgressBar value={82} className="h-1rem" />
            </div>
            <div className="mb-3">
              <div className="flex justify-content-between mb-2">
                <span className="text-sm text-gray-600">Target</span>
                <span className="text-sm font-medium">3.0 hours</span>
              </div>
              <ProgressBar value={100} className="h-1rem" />
            </div>
            <div className="text-green-600 text-sm">
              <i className="pi pi-check mr-1"></i>
              Target achieved
            </div>
          </Card>
        </div>

        {/* Recent Items Section - Full Width */}
        <Card title="Recent Reports" className="w-full">
          {/* Search and Filter - Responsive */}
          <div className={`flex ${isMobile ? 'flex-column gap-2' : 'gap-3'} mb-4`}>
            <div className="flex-1">
              <div className="p-inputgroup w-full">
                <span className="p-inputgroup-addon">
                  <i className="pi pi-search"></i>
                </span>
                <InputText 
                  placeholder={isMobile ? "Search..." : "Search items, categories, locations..."}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full"
                />
              </div>
            </div>
            <div className={isMobile ? 'w-full' : 'w-20rem'}>
              <Dropdown 
                value={selectedCategory}
                options={categories}
                onChange={(e) => setSelectedCategory(e.value)}
                placeholder="All Categories"
                className="w-full"
              />
            </div>
            {!isMobile && (
              <Button 
                icon="pi pi-refresh" 
                className="p-button-outlined"
                tooltip="Refresh"
                onClick={() => window.location.reload()}
              />
            )}
          </div>

          {/* Items Grid */}
          {filteredItems.length === 0 ? (
            <div className="text-center py-8">
              <i className="pi pi-inbox" style={{ fontSize: '3rem', color: '#6c757d' }}></i>
              <h3 className="text-gray-600 mt-3">No items found</h3>
              <p className="text-gray-500">Try adjusting your search criteria</p>
            </div>
          ) : (
            <div 
              className="w-full"
              style={{
                display: 'grid',
                gridTemplateColumns: `repeat(${gridColumns}, 1fr)`,
                gap: isMobile ? '0.75rem' : '1rem'
              }}
            >
              {filteredItems.map((item) => (
                <div key={item.id} className="w-full">
                  <div 
                    className="border-1 surface-border border-round p-3 hover:shadow-3 transition-all transition-duration-200"
                    style={{
                      display: 'flex',
                      flexDirection: 'column'
                    }}
                  >
                    {/* Image - Fixed Aspect Ratio */}
                    <div 
                      className="w-full bg-gray-200 border-round mb-3 overflow-hidden relative"
                      style={{ 
                        aspectRatio: '16/9',
                        maxHeight: isMobile ? '160px' : '200px'
                      }}
                    >
                      <img 
                        src={item.image || '/api/placeholder/300/200'} 
                        alt={item.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDMwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjVGNUY1Ii8+CjxwYXRoIGQ9Ik0xMjAgODBIMTI4Vjg4SDEzNlY5NkgxNDRWMTA0SDE1MlYxMTJIMTYwVjEyMEgxNjhWMTI4SDE3NlYxMzZIMTg0VjE0NEgxOTJWMTUySDIwMFYxNjBIMjA4VjE2OEgyMTZWMTc2SDIyNFYxODRIMjMyVjE5MkgyNDBWMjAwSDI0OFYyMDhIMjU2VjIxNkgyNjRWMjI0SDI3MlYyMzJIMjgwVjI0MEgyODhWMjQ4SDI5NlYyNTJIMDAwVjM0NEgzODRWMzM2SDM3NlYzMjhIMzY4VjMyMEgzNjBWMzEySDM1MlYzMDRIMzQ0VjI5NkgzMzZWMjg4SDMyOFYyODBIMzIwVjI3MkgzMTJWMjY0SDMwNFYyNTZIMjk2VjI0OEgyODhWMjQwSDI4MFYyMzJIMjcyVjIyNEgyNjRWMjE2SDI1NlYyMDhIMjQ4VjIwMEgyNDBWMTkySDIzMlYxODRIMjI0VjE3NkgyMTZWMTY4SDIwOFYxNjBIMjAwVjE1MkgxOTJWMTQ0SDE4NFYxMzZIMTc2VjEyOEgxNjhWMTIwSDE2MFYxMTJIMTUyVjEwNEgxNDRWOTZIMTM2Vjg4SDEyOFY4MEgxMjBaIiBmaWxsPSIjQzRDNEM0Ii8+Cjwvc3ZnPgo=';
                        }}
                      />
                      <div className="absolute top-2 right-2">
                        {getStatusBadge(item.status)}
                      </div>
                    </div>

                    {/* Content - Natural Flow */}
                    <div className="flex flex-column gap-2">
                      <h4 className={`font-bold m-0 ${isMobile ? 'text-base' : 'text-lg'}`}>{item.title}</h4>
                      <div className={`text-gray-500 ${isMobile ? 'text-xs' : 'text-sm'}`}>{item.category}</div>
                      
                      {/* Description - Natural height with line clamp */}
                      <p 
                        className={`text-gray-600 line-height-3 m-0 ${isMobile ? 'text-xs' : 'text-sm'}`}
                        style={{ 
                          display: '-webkit-box',
                          WebkitLineClamp: 3,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden'
                        }}
                      >
                        {item.description || 'No description available'}
                      </p>
                      
                      {/* Location and Reporter Info */}
                      <div className={`flex align-items-center gap-2 text-gray-500 ${isMobile ? 'text-xs' : 'text-sm'}`}>
                        <i className="pi pi-map-marker"></i>
                        <span className="truncate">{item.location}</span>
                      </div>
                      <div className={`flex align-items-center gap-2 text-gray-500 ${isMobile ? 'text-xs' : 'text-sm'}`}>
                        <i className="pi pi-user"></i>
                        <span className="truncate">{item.reportedBy}</span>
                      </div>

                      {/* Action Buttons - Added Delete Button */}
                      <div 
                        className={`flex gap-1 mt-3 ${isMobile ? 'flex-column' : ''}`}
                      >
                        <Button 
                          icon="pi pi-eye"
                          label={isMobile ? "View" : ""}
                          size="small"
                          className="p-button-outlined flex-1"
                          tooltip="View Details"
                          onClick={() => handleViewDetails(item)}
                        />
                        <Button 
                          icon="pi pi-envelope"
                          label={isMobile ? "Contact" : ""}
                          size="small"
                          className="p-button-outlined flex-1"
                          tooltip="Contact Reporter"
                          onClick={() => handleContactReporter(item)}
                        />
                        {item.status !== 'matched' && (
                          <Button 
                            icon="pi pi-check"
                            label={isMobile ? "Match" : ""}
                            size="small"
                            className="p-button-success flex-1"
                            tooltip="Mark as Match"
                            onClick={() => handleMarkAsMatch(item)}
                          />
                        )}
                        <Button 
                          icon="pi pi-trash"
                          label={isMobile ? "Delete" : ""}
                          size="small"
                          className="p-button-danger flex-1"
                          tooltip="Delete Item"
                          onClick={() => handleDeleteItem(item)}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Item Details Modal */}
      {selectedItem && (
        <ItemDetailsModal
          visible={showDetailsModal}
          onHide={() => setShowDetailsModal(false)}
          item={convertToModalFormat(selectedItem)}
        />
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        visible={showDeleteConfirm}
        onHide={() => setShowDeleteConfirm(false)}
        onConfirm={handleDeleteConfirm}
        title="Confirm Delete"
        message={`Are you sure you want to delete "${itemToDelete?.title}"? This action cannot be undone.`}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        severity="danger"
        icon="pi pi-trash"
        loading={isDeleting}
      />
    </div>
  );
};

export default DashboardPage;