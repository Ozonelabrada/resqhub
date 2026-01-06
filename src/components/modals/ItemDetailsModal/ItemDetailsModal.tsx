import React, { useState } from 'react';
import { 
  Modal, 
  ModalHeader, 
  ModalBody, 
  ModalFooter, 
  Button, 
  Badge, 
  StatusBadge,
  Avatar,
  Card,
  Grid,
  GridItem,
  Timeline
} from '../../ui';
import { 
  MapPin, 
  Calendar, 
  Tag, 
  User, 
  Phone, 
  Mail, 
  MessageSquare, 
  Share2, 
  Flag,
  ChevronLeft,
  ChevronRight,
  Info,
  CheckCircle2,
  Clock
} from 'lucide-react';
import CommentSection from '../../features/comments/CommentSection';
import { useAuth } from '../../../context/AuthContext';

export interface ItemDetailsModalProps {
  visible: boolean;
  onHide: () => void;
  item: {
    id: number;
    title: string;
    description: string;
    category: string;
    location: string;
    date: string;
    images: string[];
    status: 'active' | 'claimed' | 'returned';
    type: 'lost' | 'found';
    contactInfo?: {
      name: string;
      phone?: string;
      email?: string;
    };
    ownerId: number;
  } | null;
}

const ItemDetailsModal: React.FC<ItemDetailsModalProps> = ({ visible, onHide, item }) => {
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [showContactInfo, setShowContactInfo] = useState(false);

  // Detect if user is logged in
  const auth = useAuth();
  const isAuthenticated = auth?.isAuthenticated ?? false;

  if (!item) return null;

  const handleContactOwner = () => {
    if (!isAuthenticated) {
      localStorage.setItem('intendedAction', 'contact');
      localStorage.setItem('returnPath', window.location.pathname);
      window.location.href = '/signup';
      return;
    }
    setShowContactInfo(true);
  };

  const nextImage = () => {
    if (item.images.length > 0) {
      setActiveImageIndex((prev) => (prev + 1) % item.images.length);
    }
  };

  const prevImage = () => {
    if (item.images.length > 0) {
      setActiveImageIndex((prev) => (prev - 1 + item.images.length) % item.images.length);
    }
  };

  return (
    <Modal 
      isOpen={visible} 
      onClose={onHide} 
      title={item.title}
      size="xl"
    >
      <ModalBody className="p-0">
        <div className="flex flex-col lg:flex-row">
          {/* Left Side: Image Gallery */}
          <div className="lg:w-1/2 bg-slate-900 relative group min-h-[400px] flex items-center justify-center">
            {item.images && item.images.length > 0 ? (
              <>
                <img 
                  src={item.images[activeImageIndex]} 
                  alt={item.title}
                  className="w-full h-full object-contain max-h-[600px]"
                />
                
                {item.images.length > 1 && (
                  <>
                    <button 
                      onClick={prevImage}
                      className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/20 hover:bg-black/40 text-white transition-all opacity-0 group-hover:opacity-100"
                    >
                      <ChevronLeft className="w-6 h-6" />
                    </button>
                    <button 
                      onClick={nextImage}
                      className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/20 hover:bg-black/40 text-white transition-all opacity-0 group-hover:opacity-100"
                    >
                      <ChevronRight className="w-6 h-6" />
                    </button>
                    
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                      {item.images.map((_, idx) => (
                        <div 
                          key={idx}
                          className={`w-2 h-2 rounded-full transition-all ${idx === activeImageIndex ? 'bg-white w-4' : 'bg-white/40'}`}
                        />
                      ))}
                    </div>
                  </>
                )}
              </>
            ) : (
              <div className="flex flex-col items-center text-slate-500">
                <ImageIcon className="w-16 h-16 mb-2 opacity-20" />
                <p>No images available</p>
              </div>
            )}
            
            <div className="absolute top-4 left-4 flex gap-2">
              <Badge variant={item.type === 'lost' ? 'danger' : 'success'} className="px-3 py-1 rounded-full shadow-lg">
                {item.type.toUpperCase()}
              </Badge>
              <StatusBadge status={item.status} className="shadow-lg" />
            </div>
          </div>

          {/* Right Side: Details */}
          <div className="lg:w-1/2 p-6 md:p-10 space-y-8 overflow-y-auto max-h-[80vh]">
            <div className="space-y-4">
              <div className="flex justify-between items-start">
                <h2 className="text-3xl font-bold text-slate-800">{item.title}</h2>
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" className="rounded-full w-10 h-10 p-0">
                    <Share2 className="w-5 h-5" />
                  </Button>
                  <Button variant="ghost" size="sm" className="rounded-full w-10 h-10 p-0 text-red-500 hover:bg-red-50">
                    <Flag className="w-5 h-5" />
                  </Button>
                </div>
              </div>

              <div className="flex flex-wrap gap-4 text-sm font-medium text-slate-500">
                <div className="flex items-center gap-1.5 bg-slate-100 px-3 py-1.5 rounded-full">
                  <MapPin className="w-4 h-4 text-blue-500" />
                  {item.location}
                </div>
                <div className="flex items-center gap-1.5 bg-slate-100 px-3 py-1.5 rounded-full">
                  <Calendar className="w-4 h-4 text-blue-500" />
                  {new Date(item.date).toLocaleDateString()}
                </div>
                <div className="flex items-center gap-1.5 bg-slate-100 px-3 py-1.5 rounded-full">
                  <Tag className="w-4 h-4 text-blue-500" />
                  {item.category}
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="text-lg font-bold text-slate-800">Description</h4>
              <p className="text-slate-600 leading-relaxed">
                {item.description}
              </p>
            </div>

            {/* Contact Section */}
            <div className="bg-blue-50/50 rounded-[2rem] p-6 border border-blue-100/50">
              {!showContactInfo ? (
                <div className="text-center space-y-4">
                  <p className="text-slate-600 font-medium">Need to get in touch with the owner?</p>
                  <Button 
                    onClick={handleContactOwner}
                    className="w-full rounded-2xl bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-200 py-6"
                  >
                    <MessageSquare className="w-5 h-5 mr-2" />
                    Contact Owner
                  </Button>
                </div>
              ) : (
                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <h4 className="font-bold text-blue-900 flex items-center gap-2">
                    <User className="w-5 h-5" />
                    Contact Information
                  </h4>
                  <div className="grid grid-cols-1 gap-3">
                    <div className="flex items-center gap-3 bg-white p-3 rounded-xl border border-blue-100">
                      <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                        <User className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-xs text-slate-400 font-medium">Name</p>
                        <p className="font-bold text-slate-700">{item.contactInfo?.name || 'Anonymous'}</p>
                      </div>
                    </div>
                    {item.contactInfo?.phone && (
                      <div className="flex items-center gap-3 bg-white p-3 rounded-xl border border-blue-100">
                        <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                          <Phone className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-xs text-slate-400 font-medium">Phone</p>
                          <p className="font-bold text-slate-700">{item.contactInfo.phone}</p>
                        </div>
                      </div>
                    )}
                    {item.contactInfo?.email && (
                      <div className="flex items-center gap-3 bg-white p-3 rounded-xl border border-blue-100">
                        <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                          <Mail className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-xs text-slate-400 font-medium">Email</p>
                          <p className="font-bold text-slate-700">{item.contactInfo.email}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Timeline Section */}
            <div className="space-y-4">
              <h4 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <Clock className="w-5 h-5 text-blue-500" />
                Item History
              </h4>
              <Timeline 
                items={[
                  {
                    title: 'Item Reported',
                    description: `Reported as ${item.type} in ${item.location}`,
                    time: new Date(item.date).toLocaleDateString(),
                    icon: <Flag className="w-4 h-4" />,
                    status: 'completed'
                  },
                  {
                    title: 'Under Review',
                    description: 'Our team is verifying the report details',
                    time: 'Processing',
                    icon: <Info className="w-4 h-4" />,
                    status: 'current'
                  }
                ]}
              />
            </div>

            {/* Comments Section */}
            <div className="pt-6 border-t border-slate-100">
              <CommentSection 
                itemId={item.id}
                itemType={item.type}
                itemOwnerId={item.ownerId}
              />
            </div>
          </div>
        </div>
      </ModalBody>
    </Modal>
  );
};

export default ItemDetailsModal;