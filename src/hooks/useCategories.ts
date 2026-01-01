import { useState, useEffect } from 'react';
import type { Category } from '../types';
import { CategoryService} from '../services/categoryService';

interface UseCategoriesReturn {
  categories: { label: string; value: string | null }[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const useCategories = (): UseCategoriesReturn => {
  // Initialize with empty array to prevent map error
  const [categories, setCategories] = useState<{ label: string; value: string | null }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await CategoryService.getCategories({ isActive: true });
      console.log('Fetched categories from API:', data?.map(cat => cat.name));
      // Ensure data is an array
      if (data) {
        if (data.length === 0) {
          // If API returns empty array, use fallback data for demo purposes
          setCategories([{ label: 'All Categories', value: null }]);
        } else {
          const mappedCategories = [
            { label: 'All Categories', value: null },
            ...data.map((cat: Category) => ({
              label: cat.name,
              value: cat.name
            }))
          ];
          console.log('Mapped categories:', mappedCategories);
          setCategories(mappedCategories);
        }
      } else {
        console.warn('API returned no data for categories' + data);
        setCategories([{ label: 'All Categories', value: null }]);
      }
    } catch (err) {
      setError('Failed to load categories');
      // Use fallback data
      setCategories([{ label: 'All Categories', value: null }]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  return {
    categories,
    loading,
    error,
    refetch: fetchCategories,
  };
};