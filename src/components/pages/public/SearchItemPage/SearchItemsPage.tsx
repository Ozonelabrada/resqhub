import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { Badge } from 'primereact/badge';
import { Dialog } from 'primereact/dialog';
import { ProgressSpinner } from 'primereact/progressspinner';

const SearchItemsPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
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

  const ITEMS_PER_PAGE = 12;

  // Base items data (this would typically come from an API)
  const getBaseItems = () => [
    // Electronics
    {
      id: 1,
      title: 'iPhone 14 Pro Max',
      category: 'Electronics',
      location: 'Central Park, NYC',
      date: '2025-07-24',
      status: 'active',
      type: 'lost',
      description: 'Black iPhone 14 Pro Max with blue case. Has a small crack on the back. Last seen near the fountain.',
      image: '/api/placeholder/200/150',
      images: ['/api/placeholder/400/300', '/api/placeholder/400/300'],
      reward: '$200',
      ownerId: 1,
      contactInfo: {
        name: 'John Smith',
        phone: '(555) 123-4567',
        email: 'john.smith@email.com'
      }
    },
    {
      id: 2,
      title: 'MacBook Pro 16-inch',
      category: 'Electronics',
      location: 'Starbucks, Broadway & 42nd',
      date: '2025-07-23',
      status: 'active',
      type: 'lost',
      description: 'Silver MacBook Pro with multiple stickers on the back. Contains important work files.',
      image: '/api/placeholder/200/150',
      images: ['/api/placeholder/400/300', '/api/placeholder/400/300'],
      reward: '$500',
      ownerId: 2,
      contactInfo: {
        name: 'Sarah Johnson',
        phone: '(555) 987-6543',
        email: 'sarah.j@email.com'
      }
    },
    {
      id: 3,
      title: 'Samsung Galaxy Watch',
      category: 'Electronics',
      location: 'Times Square Gym',
      date: '2025-07-25',
      status: 'active',
      type: 'found',
      description: 'Black Samsung Galaxy Watch found in the locker room. Still has charge.',
      image: '/api/placeholder/200/150',
      images: ['/api/placeholder/400/300'],
      reward: null,
      ownerId: 3,
      contactInfo: {
        name: 'Mike Chen',
        phone: '(555) 456-7890',
        email: 'mike.chen@email.com'
      }
    },
    {
      id: 4,
      title: 'AirPods Pro 2nd Gen',
      category: 'Electronics',
      location: 'Brooklyn Bridge',
      date: '2025-07-22',
      status: 'active',
      type: 'lost',
      description: 'White AirPods Pro with custom engraving "M.S." on the case.',
      image: '/api/placeholder/200/150',
      images: ['/api/placeholder/400/300'],
      reward: '$100',
      ownerId: 4,
      contactInfo: {
        name: 'Maria Santos',
        phone: '(555) 234-5678'
      }
    },
    {
      id: 5,
      title: 'Nintendo Switch',
      category: 'Electronics',
      location: 'Washington Square Park',
      date: '2025-07-21',
      status: 'active',
      type: 'found',
      description: 'Red and blue Nintendo Switch with Pokemon stickers. Found near the chess tables.',
      image: '/api/placeholder/200/150',
      images: ['/api/placeholder/400/300', '/api/placeholder/400/300'],
      reward: null,
      ownerId: 5,
      contactInfo: {
        name: 'Alex Rodriguez',
        email: 'alex.r@email.com'
      }
    },

    // Accessories
    {
      id: 6,
      title: 'Designer Sunglasses',
      category: 'Accessories',
      location: 'The High Line',
      date: '2025-07-24',
      status: 'active',
      type: 'lost',
      description: 'Ray-Ban Aviator sunglasses with gold frames. Very sentimental value.',
      image: '/api/placeholder/200/150',
      images: ['/api/placeholder/400/300'],
      reward: '$150',
      ownerId: 6,
      contactInfo: {
        name: 'Emma Thompson',
        phone: '(555) 345-6789',
        email: 'emma.t@email.com'
      }
    },
    {
      id: 7,
      title: 'Brown Leather Wallet',
      category: 'Accessories',
      location: 'Union Square Station',
      date: '2025-07-23',
      status: 'active',
      type: 'found',
      description: 'Brown leather wallet with multiple cards inside. No cash removed.',
      image: '/api/placeholder/200/150',
      images: ['/api/placeholder/400/300'],
      reward: null,
      ownerId: 7,
      contactInfo: {
        name: 'David Wilson',
        phone: '(555) 567-8901'
      }
    },
    {
      id: 8,
      title: 'Black Baseball Cap',
      category: 'Accessories',
      location: 'Yankee Stadium',
      date: '2025-07-25',
      status: 'active',
      type: 'lost',
      description: 'Yankees baseball cap with signatures from the 2023 season. Irreplaceable!',
      image: '/api/placeholder/200/150',
      images: ['/api/placeholder/400/300'],
      reward: '$75',
      ownerId: 8,
      contactInfo: {
        name: 'Robert Brown',
        email: 'robert.b@email.com'
      }
    },
    {
      id: 9,
      title: 'Red Backpack',
      category: 'Accessories',
      location: 'Columbia University',
      date: '2025-07-22',
      status: 'active',
      type: 'found',
      description: 'Large red hiking backpack found in the library. Contains textbooks and notebooks.',
      image: '/api/placeholder/200/150',
      images: ['/api/placeholder/400/300', '/api/placeholder/400/300'],
      reward: null,
      ownerId: 9,
      contactInfo: {
        name: 'Lisa Garcia',
        phone: '(555) 678-9012',
        email: 'lisa.g@email.com'
      }
    },
    {
      id: 10,
      title: 'Designer Handbag',
      category: 'Accessories',
      location: 'Fifth Avenue Shops',
      date: '2025-07-21',
      status: 'active',
      type: 'lost',
      description: 'Louis Vuitton handbag, brown monogram pattern. Contains personal items and medication.',
      image: '/api/placeholder/200/150',
      images: ['/api/placeholder/400/300'],
      reward: '$300',
      ownerId: 10,
      contactInfo: {
        name: 'Jennifer Lee',
        phone: '(555) 789-0123'
      }
    },

    // Keys
    {
      id: 11,
      title: 'Car Keys with Remote',
      category: 'Keys',
      location: 'Madison Square Garden',
      date: '2025-07-24',
      status: 'active',
      type: 'lost',
      description: 'BMW car keys with black key fob. Has a small teddy bear keychain attached.',
      image: '/api/placeholder/200/150',
      images: ['/api/placeholder/400/300'],
      reward: '$100',
      ownerId: 11,
      contactInfo: {
        name: 'Michael Davis',
        phone: '(555) 890-1234',
        email: 'michael.d@email.com'
      }
    },
    {
      id: 12,
      title: 'House Keys Bundle',
      category: 'Keys',
      location: 'Brooklyn Heights Promenade',
      date: '2025-07-23',
      status: 'active',
      type: 'found',
      description: 'Set of 4 keys on a Brooklyn Nets keychain. Found near the benches.',
      image: '/api/placeholder/200/150',
      images: ['/api/placeholder/400/300'],
      reward: null,
      ownerId: 12,
      contactInfo: {
        name: 'Jessica Miller',
        email: 'jessica.m@email.com'
      }
    },
    {
      id: 13,
      title: 'Office Building Access Card',
      category: 'Keys',
      location: 'Wall Street',
      date: '2025-07-25',
      status: 'active',
      type: 'lost',
      description: 'White access card for JPMorgan building. Employee ID: partial number visible.',
      image: '/api/placeholder/200/150',
      images: ['/api/placeholder/400/300'],
      reward: '$50',
      ownerId: 13,
      contactInfo: {
        name: 'Christopher Taylor',
        phone: '(555) 901-2345'
      }
    },

    // Jewelry
    {
      id: 14,
      title: 'Gold Wedding Ring',
      category: 'Jewelry',
      location: 'Prospect Park',
      date: '2025-07-24',
      status: 'active',
      type: 'lost',
      description: 'Gold wedding band with inscription "Forever & Always - 06.15.20". Extremely sentimental.',
      image: '/api/placeholder/200/150',
      images: ['/api/placeholder/400/300'],
      reward: '$500',
      ownerId: 14,
      contactInfo: {
        name: 'Amanda Johnson',
        phone: '(555) 012-3456',
        email: 'amanda.j@email.com'
      }
    },
    {
      id: 15,
      title: 'Silver Necklace',
      category: 'Jewelry',
      location: 'Metropolitan Museum',
      date: '2025-07-23',
      status: 'active',
      type: 'found',
      description: 'Delicate silver chain necklace with small heart pendant. Found in Egyptian wing.',
      image: '/api/placeholder/200/150',
      images: ['/api/placeholder/400/300'],
      reward: null,
      ownerId: 15,
      contactInfo: {
        name: 'Daniel White',
        email: 'daniel.w@email.com'
      }
    },
    {
      id: 16,
      title: 'Diamond Earrings',
      category: 'Jewelry',
      location: 'Lincoln Center',
      date: '2025-07-22',
      status: 'active',
      type: 'lost',
      description: 'Pair of diamond stud earrings in white gold setting. Lost during ballet performance.',
      image: '/api/placeholder/200/150',
      images: ['/api/placeholder/400/300'],
      reward: '$400',
      ownerId: 16,
      contactInfo: {
        name: 'Olivia Martinez',
        phone: '(555) 123-4567'
      }
    },
    {
      id: 17,
      title: 'Vintage Watch',
      category: 'Jewelry',
      location: 'Grand Central Terminal',
      date: '2025-07-21',
      status: 'active',
      type: 'found',
      description: 'Vintage Omega watch with leather strap. Appears to be from the 1960s.',
      image: '/api/placeholder/200/150',
      images: ['/api/placeholder/400/300'],
      reward: null,
      ownerId: 17,
      contactInfo: {
        name: 'Thomas Anderson',
        phone: '(555) 234-5678',
        email: 'thomas.a@email.com'
      }
    },

    // Documents
    {
      id: 18,
      title: 'Passport and Documents',
      category: 'Documents',
      location: 'JFK Airport Terminal 4',
      date: '2025-07-24',
      status: 'active',
      type: 'lost',
      description: 'US Passport with boarding passes and travel documents. Urgent - flight tomorrow!',
      image: '/api/placeholder/200/150',
      images: ['/api/placeholder/400/300'],
      reward: '$200',
      ownerId: 18,
      contactInfo: {
        name: 'Rachel Green',
        phone: '(555) 345-6789',
        email: 'rachel.g@email.com'
      }
    },
    {
      id: 19,
      title: 'Student ID and Metro Card',
      category: 'Documents',
      location: 'NYU Campus',
      date: '2025-07-23',
      status: 'active',
      type: 'found',
      description: 'NYU student ID card with unlimited MetroCard attached. Found in library.',
      image: '/api/placeholder/200/150',
      images: ['/api/placeholder/400/300'],
      reward: null,
      ownerId: 19,
      contactInfo: {
        name: 'Kevin Park',
        email: 'kevin.p@email.com'
      }
    },
    {
      id: 20,
      title: 'Medical Insurance Cards',
      category: 'Documents',
      location: 'Mount Sinai Hospital',
      date: '2025-07-25',
      status: 'active',
      type: 'lost',
      description: 'Health insurance cards and medical information. Needed for upcoming appointment.',
      image: '/api/placeholder/200/150',
      images: ['/api/placeholder/400/300'],
      reward: '$75',
      ownerId: 20,
      contactInfo: {
        name: 'Susan Clark',
        phone: '(555) 456-7890'
      }
    },

    // Pet Items
    {
      id: 21,
      title: 'Dog Collar with Tags',
      category: 'Pet Items',
      location: 'Central Park Dog Run',
      date: '2025-07-24',
      status: 'active',
      type: 'found',
      description: 'Blue collar with "Max" name tag and rabies vaccination tag. Small dog size.',
      image: '/api/placeholder/200/150',
      images: ['/api/placeholder/400/300'],
      reward: null,
      ownerId: 21,
      contactInfo: {
        name: 'Patricia Lewis',
        phone: '(555) 567-8901',
        email: 'patricia.l@email.com'
      }
    },
    {
      id: 22,
      title: 'Cat Carrier',
      category: 'Pet Items',
      location: 'Animal Hospital, Upper East Side',
      date: '2025-07-23',
      status: 'active',
      type: 'lost',
      description: 'Gray plastic cat carrier with "Princess" written on a label. Left after vet visit.',
      image: '/api/placeholder/200/150',
      images: ['/api/placeholder/400/300'],
      reward: '$40',
      ownerId: 22,
      contactInfo: {
        name: 'Mark Robinson',
        email: 'mark.r@email.com'
      }
    },

    // Sports Equipment
    {
      id: 23,
      title: 'Tennis Racket',
      category: 'Sports',
      location: 'Central Park Tennis Courts',
      date: '2025-07-24',
      status: 'active',
      type: 'lost',
      description: 'Wilson Pro Staff tennis racket with custom grip tape. High-end racket.',
      image: '/api/placeholder/200/150',
      images: ['/api/placeholder/400/300'],
      reward: '$150',
      ownerId: 23,
      contactInfo: {
        name: 'Steven Hall',
        phone: '(555) 678-9012',
        email: 'steven.h@email.com'
      }
    },
    {
      id: 24,
      title: 'Basketball',
      category: 'Sports',
      location: 'Rucker Park',
      date: '2025-07-23',
      status: 'active',
      type: 'found',
      description: 'Official NBA basketball with signatures. Found after streetball tournament.',
      image: '/api/placeholder/200/150',
      images: ['/api/placeholder/400/300'],
      reward: null,
      ownerId: 24,
      contactInfo: {
        name: 'Brandon Young',
        phone: '(555) 789-0123'
      }
    },
    {
      id: 25,
      title: 'Yoga Mat',
      category: 'Sports',
      location: 'Bryant Park',
      date: '2025-07-22',
      status: 'active',
      type: 'lost',
      description: 'Purple yoga mat with floral pattern. Left after morning yoga class.',
      image: '/api/placeholder/200/150',
      images: ['/api/placeholder/400/300'],
      reward: '$30',
      ownerId: 25,
      contactInfo: {
        name: 'Nicole Adams',
        email: 'nicole.a@email.com'
      }
    },

    // Books & Media
    {
      id: 26,
      title: 'Notebook with Sketches',
      category: 'Books',
      location: 'Brooklyn Bridge Park',
      date: '2025-07-24',
      status: 'active',
      type: 'lost',
      description: 'Black Moleskine notebook filled with architectural sketches and notes. Irreplaceable work.',
      image: '/api/placeholder/200/150',
      images: ['/api/placeholder/400/300'],
      reward: '$100',
      ownerId: 26,
      contactInfo: {
        name: 'Gregory Baker',
        phone: '(555) 890-1234',
        email: 'gregory.b@email.com'
      }
    },
    {
      id: 27,
      title: 'Rare Book Collection',
      category: 'Books',
      location: 'New York Public Library',
      date: '2025-07-23',
      status: 'active',
      type: 'found',
      description: 'Three vintage books tied together with string. Appear to be first editions.',
      image: '/api/placeholder/200/150',
      images: ['/api/placeholder/400/300'],
      reward: null,
      ownerId: 27,
      contactInfo: {
        name: 'Helen Carter',
        email: 'helen.c@email.com'
      }
    },

    // Toys & Games
    {
      id: 28,
      title: 'Stuffed Animal',
      category: 'Toys',
      location: 'Playground in Riverside Park',
      date: '2025-07-25',
      status: 'active',
      type: 'found',
      description: 'Brown teddy bear wearing a red vest. Child is probably missing it dearly.',
      image: '/api/placeholder/200/150',
      images: ['/api/placeholder/400/300'],
      reward: null,
      ownerId: 28,
      contactInfo: {
        name: 'Dorothy Evans',
        phone: '(555) 901-2345'
      }
    },
    {
      id: 29,
      title: 'Board Game',
      category: 'Toys',
      location: 'Washington Square Park',
      date: '2025-07-21',
      status: 'active',
      type: 'lost',
      description: 'Settlers of Catan board game in original box. Left on park bench.',
      image: '/api/placeholder/200/150',
      images: ['/api/placeholder/400/300'],
      reward: '$25',
      ownerId: 29,
      contactInfo: {
        name: 'Frank Mitchell',
        email: 'frank.m@email.com'
      }
    },

    // Musical Instruments
    {
      id: 30,
      title: 'Guitar Pick Holder',
      category: 'Music',
      location: 'Lincoln Center',
      date: '2025-07-24',
      status: 'active',
      type: 'lost',
      description: 'Small tin case with collection of guitar picks. Some are custom made.',
      image: '/api/placeholder/200/150',
      images: ['/api/placeholder/400/300'],
      reward: '$20',
      ownerId: 30,
      contactInfo: {
        name: 'Carol Turner',
        phone: '(555) 012-3456',
        email: 'carol.t@email.com'
      }
    }
  ];

  // Generate additional items for pagination simulation
  const generateAdditionalItems = (page: number, baseItems: any[]) => {
    const startId = baseItems.length + (page - 2) * ITEMS_PER_PAGE + 1;
    const additionalItems = [];
    
    for (let i = 0; i < ITEMS_PER_PAGE; i++) {
      const baseItem = baseItems[i % baseItems.length];
      additionalItems.push({
        ...baseItem,
        id: startId + i,
        title: `${baseItem.title} (Page ${page})`,
        description: `${baseItem.description} - Additional item for page ${page}.`,
        date: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      });
    }
    
    return additionalItems;
  };

  // Simulate API call to fetch items
  const fetchItems = useCallback(async (page: number, searchQuery?: string, category?: string) => {
    setLoading(true);
    
    try {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const baseItems = getBaseItems();
      let allItems: any[] = [];
      
      if (page === 1) {
        allItems = baseItems.slice(0, ITEMS_PER_PAGE);
      } else {
        // Generate additional items for subsequent pages
        allItems = generateAdditionalItems(page, baseItems);
      }
      
      // Apply filters
      if (searchQuery || category) {
        allItems = allItems.filter(item => {
          const matchesSearch = !searchQuery || 
            item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.location.toLowerCase().includes(searchQuery.toLowerCase());
          
          const matchesCategory = !category || item.category === category;
          
          return matchesSearch && matchesCategory;
        });
      }
      
      // Simulate no more data after page 5
      const hasMoreData = page < 5;
      
      return {
        items: allItems,
        hasMore: hasMoreData && allItems.length === ITEMS_PER_PAGE,
        totalCount: page === 1 ? allItems.length : undefined
      };
    } catch (error) {
      console.error('Error fetching items:', error);
      return { items: [], hasMore: false };
    } finally {
      setLoading(false);
    }
  }, []);

  // Load initial items
  useEffect(() => {
    if (initialLoad) {
      setInitialLoad(false);
      setItems([]);
      setCurrentPage(1);
      setHasMore(true);
      
      fetchItems(1, searchTerm, selectedCategory).then(result => {
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
    const result = await fetchItems(nextPage, searchTerm, selectedCategory);
    
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

  const categories = [
    { label: 'All Categories', value: null },
    { label: 'Electronics', value: 'Electronics' },
    { label: 'Accessories', value: 'Accessories' },
    { label: 'Keys', value: 'Keys' },
    { label: 'Jewelry', value: 'Jewelry' },
    { label: 'Documents', value: 'Documents' },
    { label: 'Pet Items', value: 'Pet Items' },
    { label: 'Sports', value: 'Sports' },
    { label: 'Books', value: 'Books' },
    { label: 'Toys', value: 'Toys' },
    { label: 'Music', value: 'Music' }
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
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', color: '#252323ff', width: '100%' }}>
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
                            target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjE1MCIgdmlld0JveD0iMCAwIDIwMCAxNTAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMTUwIiBmaWxsPSIjRjVGNUY1Ii8+CjxwYXRoIGQ9Ik03MCA2MEg3NFY2NEg3OFY2OEg4MlY3Mkg4NlY3Nkg5MFY4MEg5NFY4NEg5OFY4OEgxMDJWOTJIMTA2Vjk2SDExMFYxMDBIMTE0VjEwNEgxMThWMTA4SDEyMlYxMTJIMTI2VjExNkgxMzBWMTIwSDEzNFYxMjRIMTM4VjEyOEgxNDJWMTMySDEzOFYxMjhIMTM0VjEyNEgxMzBWMTIwSDEyNlYxMTZIMTIyVjExMkgxMThWMTA4SDExNFYxMDRIMTEwVjEwMEgxMDZWOTZIMTAyVjkySDk4Vjg4SDk0Vjg0SDkwVjgwSDg2Vjc2SDgyVjcySDc4VjY4SDc0VjY0SDcwVjYwWiIgZmlsbD0iI0M0QzRDNCIvPgo8L3N2Zz4K';
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
                        <Button 
                          label="View Details"
                          icon="pi pi-eye"
                          className="p-button-sm p-button-outlined"
                          onClick={(e) => handleViewDetails(item, e)}
                        />
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

      {/* Simple Test Modal */}
      <Dialog
        header={selectedItem ? `${selectedItem.title} Details` : 'Item Details'}
        visible={isModalVisible}
        onHide={handleCloseModal}
        style={{ width: '90vw', maxWidth: '800px' }}
        modal
      >
        {selectedItem && (
          <div className="p-4">
            <div className="mb-4">
              <img 
                src={selectedItem.images[0] || selectedItem.image} 
                alt={selectedItem.title}
                className="w-full h-15rem object-cover border-round"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDQwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMzAwIiBmaWxsPSIjRjVGNUY1Ii8+CjxwYXRoIGQ9Ik0xNTAgMTIwSDE1OFYxMjhIMTY2VjEzNkgxNzRWMTQ0SDE4MlYxNTJIMTkwVjE2MEgxOThWMTY4SDIwNlYxNzZIMjE0VjE4NEgyMjJWMTkySDIzMFYyMDBIMjM4VjIwOEgyNDZWMjE2SDI1NFYyMjRIMjYyVjIzMkgyNzBWMjQwSDI3OFYyNDhIMjg2VjI1NkgyOTRWMjY0SDMwMlYyNzJIMzEwVjI4MEgzMThWMjg4SDMyNlYyOTZIMzM0VjMwNEgzNDJWMzEySDM1MFYzMjBIMzU4VjMyOEgzNjZWMzM2SDM3NFYzNDRIMzgyVjM1MkgzODBWMzQ0SDM3MlYzMzZIMzY0VjMyOEgzNTZWMzIwSDM0OFYzMTJIMzQwVjMwNEgzMzJWMjk2SDMyNFYyODhIMzE2VjI4MEgzMDhWMjcySDMwMFYyNjRIMjkyVjI1NkgyODRWMjQ4SDI3NlYyNDBIMjY4VjIzMkgyNjBWMjI0SDI1MlYyMTZIMjQ0VjIwOEgyMzZWMjAwSDIyOFYxOTJIMjIwVjE4NEgyMTJWMTc2SDIwNFYxNjhIMTk2VjE2MEgxODhWMTUySDI4MFYxNDRIMTcyVjEzNkgxNjRWMTI4SDE1NlYxMjBIMTUwWiIgZmlsbD0iI0M0QzRDNCIvPgo8L3N2Zz4K';
                }}
              />
            </div>
            
            <div className="mb-3">
              <h3 className="text-2xl font-bold mb-2">{selectedItem.title}</h3>
              <Badge 
                value={selectedItem.type === 'lost' ? 'LOST' : 'FOUND'} 
                severity={selectedItem.type === 'lost' ? 'danger' : 'success'} 
                className="mb-3"
              />
            </div>
            
            <div className="mb-3">
              <p className="text-gray-700 line-height-3">{selectedItem.description}</p>
            </div>
            
            <div className="grid">
              <div className="col-6">
                <div className="text-sm text-gray-500 mb-1">Location</div>
                <div className="flex align-items-center gap-2">
                  <i className="pi pi-map-marker text-gray-600"></i>
                  <span className="font-medium">{selectedItem.location}</span>
                </div>
              </div>
              <div className="col-6">
                <div className="text-sm text-gray-500 mb-1">Date</div>
                <div className="flex align-items-center gap-2">
                  <i className="pi pi-calendar text-gray-600"></i>
                  <span className="font-medium">{selectedItem.date}</span>
                </div>
              </div>
            </div>
            
            {selectedItem.reward && (
              <div className="mt-3">
                <div className="bg-green-100 text-green-700 px-3 py-2 border-round">
                  💰 Reward: {selectedItem.reward}
                </div>
              </div>
            )}
            
            {selectedItem.contactInfo && (
              <div className="mt-4">
                <h4 className="text-lg font-semibold mb-2">Contact Information</h4>
                <div className="bg-blue-50 p-3 border-round">
                  <div className="font-medium">{selectedItem.contactInfo.name}</div>
                  {selectedItem.contactInfo.phone && (
                    <div className="text-sm text-gray-600">📞 {selectedItem.contactInfo.phone}</div>
                  )}
                  {selectedItem.contactInfo.email && (
                    <div className="text-sm text-gray-600">✉️ {selectedItem.contactInfo.email}</div>
                  )}
                </div>
              </div>
            )}
            
            <div className="mt-4 text-center">
              <Button 
                label="Contact Owner" 
                icon="pi pi-envelope"
                className="p-button-success"
              />
            </div>
          </div>
        )}
      </Dialog>
    </div>
  );
};

export default SearchItemsPage;