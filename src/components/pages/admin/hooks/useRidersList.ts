import { useState, useEffect, useCallback } from 'react';

interface Rider {
  id: string;
  username: string;
  name: string;
  email: string;
  serviceType: 'rider' | 'seller' | 'personal-services' | 'event';
  status: 'active' | 'inactive' | 'suspended';
  currentCredits: number;
  totalSpent: number;
  lastActivity: string;
  joinDate: string;
}

export const useRidersList = (serviceType: string) => {
  const [riders, setRiders] = useState<Rider[]>([]);
  const [loading, setLoading] = useState(false);
  const [allRiders, setAllRiders] = useState<Rider[]>([]);

  // Mock data - replace with actual API call
  const mockRiders: Rider[] = [
    {
      id: 'R001',
      username: 'johndoe',
      name: 'John Doe',
      email: 'john@example.com',
      serviceType: 'rider',
      status: 'active',
      currentCredits: 500,
      totalSpent: 1250.50,
      lastActivity: '2 hours ago',
      joinDate: '2023-01-15',
    },
    {
      id: 'R002',
      username: 'janedoe',
      name: 'Jane Smith',
      email: 'jane@example.com',
      serviceType: 'rider',
      status: 'active',
      currentCredits: 250,
      totalSpent: 850.75,
      lastActivity: '30 minutes ago',
      joinDate: '2023-03-20',
    },
    {
      id: 'S001',
      username: 'seller_mike',
      name: 'Mike Johnson',
      email: 'mike@seller.com',
      serviceType: 'seller',
      status: 'active',
      currentCredits: 1000,
      totalSpent: 5000.00,
      lastActivity: '1 hour ago',
      joinDate: '2023-02-10',
    },
    {
      id: 'R003',
      username: 'sarah_rider',
      name: 'Sarah Williams',
      email: 'sarah@example.com',
      serviceType: 'rider',
      status: 'inactive',
      currentCredits: 0,
      totalSpent: 500.00,
      lastActivity: '5 days ago',
      joinDate: '2023-06-05',
    },
    {
      id: 'P001',
      username: 'ps_trainer',
      name: 'Alex Trainer',
      email: 'alex@services.com',
      serviceType: 'personal-services',
      status: 'active',
      currentCredits: 750,
      totalSpent: 3200.00,
      lastActivity: '45 minutes ago',
      joinDate: '2023-04-12',
    },
  ];

  const fetchRiders = useCallback(async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 800));
      
      const filtered = serviceType
        ? mockRiders.filter((r) => r.serviceType === serviceType)
        : mockRiders;
      
      setAllRiders(mockRiders);
      setRiders(filtered);
    } catch (error) {
      console.error('Error fetching riders:', error);
    } finally {
      setLoading(false);
    }
  }, [serviceType]);

  useEffect(() => {
    fetchRiders();
  }, [fetchRiders]);

  const applyFilters = useCallback(
    (searchQuery: string, svcType: string, month: string, year: string) => {
      let filtered = allRiders;

      // Filter by service type
      if (svcType) {
        filtered = filtered.filter((r) => r.serviceType === svcType);
      } else if (serviceType) {
        filtered = filtered.filter((r) => r.serviceType === serviceType);
      }

      // Search by ID, username, email, or name
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        filtered = filtered.filter(
          (r) =>
            r.id.toLowerCase().includes(query) ||
            r.username.toLowerCase().includes(query) ||
            r.email.toLowerCase().includes(query) ||
            r.name.toLowerCase().includes(query)
        );
      }

      // Filter by year
      if (year) {
        filtered = filtered.filter((r) =>
          r.joinDate.startsWith(year)
        );
      }

      // Filter by month
      if (month && year) {
        filtered = filtered.filter((r) =>
          r.joinDate.startsWith(`${year}-${month}`)
        );
      }

      setRiders(filtered);
    },
    [allRiders, serviceType]
  );

  return {
    riders,
    loading,
    applyFilters,
    refetch: fetchRiders,
  };
};
