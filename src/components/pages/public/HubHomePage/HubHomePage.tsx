import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { Badge } from 'primereact/badge';

const HubHomePage: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [isMobile, setIsMobile] = useState(false);

  // Mobile detection
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

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
    { label: 'Clothing', value: 'Clothing' }
  ];

  const stats = {
    totalItems: 1247,
    successfulMatches: 342,
    activeReports: 905,
    citiesCovered: 25
  };

  const recentSuccesses = [
    { id: 1, title: 'iPhone 13 Pro', location: 'Central Park', timeAgo: '2 hours ago' },
    { id: 2, title: 'Blue Backpack', location: 'Metro Station', timeAgo: '5 hours ago' },
    { id: 3, title: 'Car Keys', location: 'Shopping Mall', timeAgo: '1 day ago' },
    { id: 4, title: 'Gold Watch', location: 'Beach Resort', timeAgo: '2 days ago' }
  ];

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (searchTerm) params.set('search', searchTerm);
    if (selectedCategory) params.set('category', selectedCategory);
    navigate(`/search?${params.toString()}`);
  };

  const handleQuickReport = (type: 'lost' | 'found') => {
    navigate(`/report?type=${type}`);
  };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
      {/* Hero Section */}
      <div className={`${isMobile ? 'p-3' : 'p-6'} text-center text-white`}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          {/* Header */}
          <div className="flex justify-content-between align-items-center mb-4">
            <div className="flex align-items-center gap-3">
              <div className="w-3rem h-3rem bg-white border-round-xl flex align-items-center justify-content-center shadow-2">
                <i className="pi pi-search text-blue-600" style={{ fontSize: '1.5rem' }}></i>
              </div>
              <div className="text-left">
                <h1 className={`${isMobile ? 'text-2xl' : 'text-3xl'} font-bold m-0`}>ResQHub</h1>
                <p className="m-0 text-blue-100">Lost & Found Platform</p>
              </div>
            </div>
            
            <Button 
              label="Admin Login"
              icon="pi pi-user"
              onClick={() => navigate('/admin/login')}
              className="p-button-outlined p-button-sm"
              style={{ borderColor: 'white', color: 'white' }}
            />
          </div>

          {/* Hero Content */}
          <div className="mb-6">
            <h2 className={`${isMobile ? 'text-3xl' : 'text-5xl'} font-bold mb-3`}>
              Lost Something? Found Something?
            </h2>
            <p className={`${isMobile ? 'text-lg' : 'text-xl'} mb-4 text-blue-100`}>
              Connect with your community to reunite lost items with their owners
            </p>
          </div>

          {/* Quick Search */}
          <Card className="mb-6" style={{ maxWidth: '800px', margin: '0 auto 2rem auto' }}>
            <div className="grid" style={{ margin: '0' }}>
              <div className="col-12 md:col-8">
                <div className="p-inputgroup">
                  <span className="p-inputgroup-addon">
                    <i className="pi pi-search"></i>
                  </span>
                  <InputText 
                    placeholder="Search for lost or found items..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    style={{ fontSize: isMobile ? '14px' : '16px' }}
                  />
                </div>
              </div>
              <div className="col-12 md:col-4">
                <Dropdown 
                  value={selectedCategory}
                  options={categories}
                  onChange={(e) => setSelectedCategory(e.value)}
                  placeholder="Category"
                  className="w-full"
                />
              </div>
              <div className="col-12">
                <Button 
                  label="Search Items"
                  icon="pi pi-search"
                  onClick={handleSearch}
                  className="w-full p-button-lg"
                  style={{ marginTop: '1rem' }}
                />
              </div>
            </div>
          </Card>

          {/* Quick Actions */}
          <div className="grid" style={{ margin: '0 -1rem', maxWidth: '600px', margin: '0 auto' }}>
            <div className="col-6" style={{ padding: '0 1rem' }}>
              <Button 
                label={isMobile ? "Report Lost" : "Report Lost Item"}
                icon="pi pi-minus-circle"
                onClick={() => handleQuickReport('lost')}
                severity="danger"
                className="w-full p-button-lg"
                style={{ borderRadius: '12px' }}
              />
            </div>
            <div className="col-6" style={{ padding: '0 1rem' }}>
              <Button 
                label={isMobile ? "Report Found" : "Report Found Item"}
                icon="pi pi-plus-circle"
                onClick={() => handleQuickReport('found')}
                severity="success"
                className="w-full p-button-lg"
                style={{ borderRadius: '12px' }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className={`${isMobile ? 'p-3' : 'p-6'} bg-white`}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h3 className="text-center text-2xl font-bold text-gray-800 mb-4">
            Community Impact
          </h3>
          
          <div className="grid" style={{ margin: '0 -0.5rem' }}>
            <div className="col-6 md:col-3" style={{ padding: '0 0.5rem' }}>
              <Card className="text-center bg-blue-50 h-full">
                <div className="p-3">
                  <div className="text-3xl font-bold text-blue-600 mb-2">{stats.totalItems.toLocaleString()}</div>
                  <div className="text-gray-700 font-medium">Total Items</div>
                </div>
              </Card>
            </div>
            <div className="col-6 md:col-3" style={{ padding: '0 0.5rem' }}>
              <Card className="text-center bg-green-50 h-full">
                <div className="p-3">
                  <div className="text-3xl font-bold text-green-600 mb-2">{stats.successfulMatches}</div>
                  <div className="text-gray-700 font-medium">Successful Matches</div>
                </div>
              </Card>
            </div>
            <div className="col-6 md:col-3" style={{ padding: '0 0.5rem' }}>
              <Card className="text-center bg-orange-50 h-full">
                <div className="p-3">
                  <div className="text-3xl font-bold text-orange-600 mb-2">{stats.activeReports}</div>
                  <div className="text-gray-700 font-medium">Active Reports</div>
                </div>
              </Card>
            </div>
            <div className="col-6 md:col-3" style={{ padding: '0 0.5rem' }}>
              <Card className="text-center bg-purple-50 h-full">
                <div className="p-3">
                  <div className="text-3xl font-bold text-purple-600 mb-2">{stats.citiesCovered}</div>
                  <div className="text-gray-700 font-medium">Cities Covered</div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Successes */}
      <div className={`${isMobile ? 'p-3' : 'p-6'} bg-gray-50`}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h3 className="text-center text-2xl font-bold text-gray-800 mb-4">
            Recent Success Stories
          </h3>
          
          <div className="grid" style={{ margin: '0 -0.5rem' }}>
            {recentSuccesses.map((success) => (
              <div key={success.id} className="col-12 md:col-6 lg:col-3" style={{ padding: '0 0.5rem' }}>
                <Card className="mb-3 hover:shadow-3 transition-all transition-duration-200">
                  <div className="flex align-items-center gap-3 p-2">
                    <div className="w-3rem h-3rem bg-green-100 border-round flex align-items-center justify-content-center">
                      <i className="pi pi-check text-green-600" style={{ fontSize: '1.2rem' }}></i>
                    </div>
                    <div className="flex-1">
                      <div className="font-bold text-gray-800">{success.title}</div>
                      <div className="text-sm text-gray-600">{success.location}</div>
                      <div className="text-xs text-green-600 font-medium">{success.timeAgo}</div>
                    </div>
                  </div>
                </Card>
              </div>
            ))}
          </div>

          <div className="text-center">
            <Button 
              label="View All Success Stories"
              icon="pi pi-external-link"
              onClick={() => navigate('/success-stories')}
              className="p-button-outlined"
            />
          </div>
        </div>
      </div>

      {/* How It Works */}
      <div className={`${isMobile ? 'p-3' : 'p-6'} bg-white`}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h3 className="text-center text-2xl font-bold text-gray-800 mb-6">
            How It Works
          </h3>
          
          <div className="grid" style={{ margin: '0 -1rem' }}>
            <div className="col-12 md:col-4" style={{ padding: '0 1rem' }}>
              <div className="text-center">
                <div className="w-4rem h-4rem bg-blue-100 border-round-3xl flex align-items-center justify-content-center mx-auto mb-3">
                  <i className="pi pi-plus text-blue-600" style={{ fontSize: '2rem' }}></i>
                </div>
                <h4 className="text-lg font-bold text-gray-800 mb-2">1. Report</h4>
                <p className="text-gray-600">
                  Report your lost item or something you found with detailed description and photos.
                </p>
              </div>
            </div>
            <div className="col-12 md:col-4" style={{ padding: '0 1rem' }}>
              <div className="text-center">
                <div className="w-4rem h-4rem bg-green-100 border-round-3xl flex align-items-center justify-content-center mx-auto mb-3">
                  <i className="pi pi-search text-green-600" style={{ fontSize: '2rem' }}></i>
                </div>
                <h4 className="text-lg font-bold text-gray-800 mb-2">2. Search</h4>
                <p className="text-gray-600">
                  Browse through reported items or use our smart search to find potential matches.
                </p>
              </div>
            </div>
            <div className="col-12 md:col-4" style={{ padding: '0 1rem' }}>
              <div className="text-center">
                <div className="w-4rem h-4rem bg-purple-100 border-round-3xl flex align-items-center justify-content-center mx-auto mb-3">
                  <i className="pi pi-heart text-purple-600" style={{ fontSize: '2rem' }}></i>
                </div>
                <h4 className="text-lg font-bold text-gray-800 mb-2">3. Reunite</h4>
                <p className="text-gray-600">
                  Connect securely with the owner or finder to arrange safe return of the item.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className={`${isMobile ? 'p-3' : 'p-6'} bg-gray-800 text-white`}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div className="grid" style={{ margin: '0 -1rem' }}>
            <div className="col-12 md:col-6" style={{ padding: '0 1rem' }}>
              <div className="flex align-items-center gap-3 mb-3">
                <div className="w-2rem h-2rem bg-blue-600 border-round flex align-items-center justify-content-center">
                  <i className="pi pi-search text-white"></i>
                </div>
                <span className="text-xl font-bold">ResQHub</span>
              </div>
              <p className="text-gray-300 text-sm">
                Connecting communities to reunite lost items with their rightful owners.
              </p>
            </div>
            <div className="col-12 md:col-6" style={{ padding: '0 1rem' }}>
              <div className="text-right">
                <p className="text-gray-300 text-sm mb-2">
                  Have questions? Need help?
                </p>
                <Button 
                  label="Contact Support"
                  icon="pi pi-envelope"
                  className="p-button-outlined p-button-sm"
                  style={{ borderColor: 'white', color: 'white' }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HubHomePage;