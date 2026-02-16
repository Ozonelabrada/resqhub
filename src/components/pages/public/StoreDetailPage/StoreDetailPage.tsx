import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  MapPin,
  Phone,
  Mail,
  Package,
  Users,
  Star,
  Share2,
  Heart,
  MessageSquare,
  ExternalLink,
  ShoppingBag,
  Clock
} from 'lucide-react';
import { Card, Button, Avatar, Badge, Spinner } from '../../../ui';
import { StoreService, type Store } from '../../../../services/storeService';
import { useAuth } from '../../../../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { cn } from '../../../../lib/utils';

interface StoreItem {
  id: string | number;
  name: string;
  price: number;
  image: string;
  category: string;
  status: 'available' | 'sold';
}

const StoreDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { isAuthenticated } = useAuth();

  const [store, setStore] = useState<Store | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'items' | 'communities'>('items');
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    const fetchStore = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const data = await StoreService.getStoreById(id);
        if (data) {
          setStore(data);
        }
      } catch (error) {
        console.error('Error fetching store:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStore();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!store) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-4">
        <div className="text-center">
          <h2 className="text-2xl font-black text-slate-800 mb-4">Store Not Found</h2>
          <p className="text-slate-500 mb-8 text-lg font-medium">The store you're looking for doesn't exist or has been removed.</p>
          <Button onClick={() => navigate(-1)} className="bg-teal-600 text-white rounded-2xl px-8 py-4 h-auto font-bold text-lg">
            <ArrowLeft className="mr-2" />
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header with Back Button */}
      <div className="bg-white border-b border-slate-100 sticky top-0 z-40">
        <div className="px-4 md:px-8 py-4 flex items-center justify-between">
          <Button
            onClick={() => navigate(-1)}
            variant="ghost"
            className="flex items-center gap-2 text-slate-600 hover:text-slate-900"
          >
            <ArrowLeft size={20} />
            <span className="font-bold">Back</span>
          </Button>
          <div className="flex items-center gap-2">
            <Button
              onClick={() => setIsSaved(!isSaved)}
              variant="ghost"
              className={cn(
                "flex items-center gap-2 rounded-xl px-4 py-2",
                isSaved
                  ? "bg-red-50 text-red-600"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              )}
            >
              <Heart size={18} fill={isSaved ? "currentColor" : "none"} />
              <span className="hidden sm:inline text-sm font-bold">Save</span>
            </Button>
            <Button
              variant="ghost"
              className="flex items-center gap-2 rounded-xl px-4 py-2 bg-slate-100 text-slate-600 hover:bg-slate-200"
            >
              <Share2 size={18} />
              <span className="hidden sm:inline text-sm font-bold">Share</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Banner and Store Header */}
      <div className="bg-white border-b border-slate-100">
          {/* Banner */}
          <div className="relative h-64 md:h-80 bg-slate-100 overflow-hidden">
            <img
              src={store.bannerUrl}
              alt={store.name}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Store Info */}
          <div className="px-4 md:px-8 pb-8 -mt-24 relative z-10">
            <div className="flex flex-col md:flex-row gap-6 items-start md:items-end">
              {/* Avatar */}
              <div className="relative">
                <div className="w-32 h-32 md:w-40 md:h-40 rounded-3xl border-4 border-white shadow-lg bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center">
                  <span className="text-5xl md:text-6xl font-black text-white">{store.name.charAt(0).toUpperCase()}</span>
                </div>
                {store.isVerified && (
                  <div className="absolute bottom-2 right-2 bg-emerald-500 text-white p-2 rounded-full border-4 border-white">
                    <Star size={16} fill="white" />
                  </div>
                )}
              </div>

              {/* Details */}
              <div className="flex-1 pb-2">
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-3xl md:text-4xl font-black text-slate-900">{store.name}</h1>
                </div>

                <p className="text-slate-600 mb-4 leading-relaxed max-w-2xl">{store.description}</p>

                {/* Stats */}
                <div className="flex flex-wrap gap-6 mb-4">
                  <div className="flex items-center gap-2">
                    <ShoppingBag className="text-teal-600" size={18} />
                    <span className="text-sm font-bold text-slate-600">
                      <span className="text-slate-900 font-black">{store.itemsCount}</span> Items
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center">
                      <Star className="text-yellow-400" size={18} fill="currentColor" />
                      <span className="text-sm font-bold text-slate-900 ml-1">{store.rate?.toFixed(1) || '0'}</span>
                    </div>
                  </div>
                </div>

                {/* Contact Info */}
                <div className="flex flex-wrap gap-4">
                  {store.contactInfo && (
                    <div className="flex items-center gap-2 text-sm">
                      {store.contactInfo.includes('@') ? (
                        <>
                          <Mail size={16} className="text-slate-400" />
                          <a href={`mailto:${store.contactInfo}`} className="text-teal-600 hover:text-teal-700 font-bold">
                            {store.contactInfo}
                          </a>
                        </>
                      ) : (
                        <>
                          <Phone size={16} className="text-slate-400" />
                          <a href={`tel:${store.contactInfo}`} className="text-teal-600 hover:text-teal-700 font-bold">
                            {store.contactInfo}
                          </a>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-slate-100 sticky top-16 z-30">
        <div className="px-4 md:px-8 flex gap-1">
          <button
            onClick={() => setActiveTab('items')}
            className={cn(
              "px-6 py-4 font-bold text-sm uppercase tracking-wide border-b-2 transition-all",
              activeTab === 'items'
                ? "border-teal-600 text-teal-600"
                : "border-transparent text-slate-500 hover:text-slate-700"
            )}
          >
            <div className="flex items-center gap-2">
              <ShoppingBag size={16} />
              Items ({store.itemsCount || 0})
            </div>
          </button>
          <button
            onClick={() => setActiveTab('communities')}
            className={cn(
              "px-6 py-4 font-bold text-sm uppercase tracking-wide border-b-2 transition-all",
              activeTab === 'communities'
                ? "border-teal-600 text-teal-600"
                : "border-transparent text-slate-500 hover:text-slate-700"
            )}
          >
            <div className="flex items-center gap-2">
              <Users size={16} />
              Communities
            </div>
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 md:px-8 py-8">
        {activeTab === 'items' ? (
          <div>
            <h2 className="text-2xl font-black text-slate-900 mb-6">Store Items</h2>
            <Card className="p-12 text-center bg-slate-50 rounded-2xl">
              <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-slate-600 mb-2">Items coming soon</h3>
              <p className="text-slate-500">Store items will be available soon.</p>
            </Card>
          </div>
        ) : (
          <div>
            <h2 className="text-2xl font-black text-slate-900 mb-6">Communities</h2>
            <Card className="p-12 text-center bg-slate-50 rounded-2xl">
              <Users className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-slate-600 mb-2">Communities coming soon</h3>
              <p className="text-slate-500">Store community information will be available soon.</p>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default StoreDetailPage;
