import React, { useState } from 'react';
import { 
  Clock, 
  Search,
  Eye, 
  CheckCircle, 
  Activity as ActivityIcon, 
  MessageSquare,
  TrendingUp,
  AlertCircle,
  ThumbsUp,
  ExternalLink,
  Settings
} from 'lucide-react';
import { 
  Card, 
  Button, 
  Input,
  Spinner,
  Avatar
} from '../../../../components/ui';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface ActivityItem {
  id: string;
  type: 'match' | 'view' | 'system' | 'comment' | 'reaction' | 'resolved';
  message: string;
  time: string;
  date: string;
  itemTitle?: string;
  itemId?: string;
  user?: {
    name: string;
    avatar?: string;
  };
}

const MOCK_ACTIVITIES: ActivityItem[] = [
  {
    id: '1',
    type: 'match',
    message: 'New potential match found for your iPhone 13 Pro',
    time: '2 hours ago',
    date: new Date().toISOString(),
    itemTitle: 'iPhone 13 Pro',
    itemId: 'item-1'
  },
  {
    id: '2',
    type: 'view',
    message: 'Your Blue Backpack report was viewed 5 times today',
    time: '4 hours ago',
    date: new Date().toISOString(),
    itemTitle: 'Blue Backpack',
    itemId: 'item-2'
  },
  {
    id: '3',
    type: 'resolved',
    message: 'Your Car Keys case has been marked as resolved',
    time: '1 day ago',
    date: new Date(Date.now() - 86400000).toISOString(),
    itemTitle: 'Car Keys',
    itemId: 'item-3'
  },
  {
    id: '4',
    type: 'comment',
    message: 'John Doe commented on your report: "I think I saw this near the park!"',
    time: '2 days ago',
    date: new Date(Date.now() - 172800000).toISOString(),
    user: { name: 'John Doe' },
    itemTitle: 'Golden Retriever',
    itemId: 'item-4'
  },
  {
    id: '5',
    type: 'reaction',
    message: '5 people reacted to your Success Story',
    time: '3 days ago',
    date: new Date(Date.now() - 259200000).toISOString(),
    itemTitle: 'Lost Cat Found',
    itemId: 'item-5'
  },
  {
    id: '6',
    type: 'system',
    message: 'Your account security settings were updated successfully',
    time: '1 week ago',
    date: new Date(Date.now() - 604800000).toISOString()
  },
  {
    id: '7',
    type: 'match',
    message: 'High similarity match (95%) found for your Wallet',
    time: '1 week ago',
    date: new Date(Date.now() - 604800000).toISOString(),
    itemTitle: 'Wallet',
    itemId: 'item-7'
  }
];

const ActivityPage: React.FC = () => {
  const navigate = useNavigate();
  const [loading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');

  const getIcon = (type: ActivityItem['type']) => {
    switch (type) {
      case 'match': return <ActivityIcon size={18} className="text-teal-500" />;
      case 'view': return <Eye size={18} className="text-blue-500" />;
      case 'resolved': return <CheckCircle size={18} className="text-emerald-500" />;
      case 'comment': return <MessageSquare size={18} className="text-purple-500" />;
      case 'reaction': return <ThumbsUp size={18} className="text-rose-500" />;
      case 'system': return <Settings size={18} className="text-slate-500" />;
      default: return <Clock size={18} className="text-slate-500" />;
    }
  };

  const filteredActivities = MOCK_ACTIVITIES.filter(activity => {
    const matchesSearch = activity.message.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (activity.itemTitle?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);
    const matchesType = filterType === 'all' || activity.type === filterType;
    return matchesSearch && matchesType;
  });

  return (
    <div className="min-h-screen bg-slate-50 pb-12">
      {/* Header Section */}
      <div className="bg-white border-b border-slate-200 pt-8 pb-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <nav className="flex mb-4" aria-label="Breadcrumb">
                <ol className="flex items-center space-x-2 text-sm font-medium text-slate-500">
                  <li>
                    <button onClick={() => navigate('/')} className="hover:text-teal-600 transition-colors">Home</button>
                  </li>
                  <li className="flex items-center space-x-2">
                    <span className="text-slate-300">/</span>
                    <span className="text-slate-900">Activity</span>
                  </li>
                </ol>
              </nav>
              <h1 className="text-3xl font-extrabold text-slate-900 flex items-center gap-3">
                <Clock className="text-teal-600" size={32} />
                My Activity
              </h1>
              <p className="mt-2 text-slate-600 font-medium">
                Track your interactions, report updates, and platform notifications in one place.
              </p>
            </div>
            
            <div className="bg-teal-50 p-4 rounded-2xl flex items-center gap-4">
               <div className="p-2 bg-teal-100 rounded-xl text-teal-600">
                  <TrendingUp size={24} />
               </div>
               <div>
                  <p className="text-xs font-bold text-teal-600 uppercase tracking-wider">Activity Score</p>
                  <p className="text-xl font-black text-slate-900">2,450 XP</p>
               </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        {/* Search and Filters */}
        <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm mb-8 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <Input 
              placeholder="Search activity..." 
              className="pl-11 rounded-2xl border-slate-100 bg-slate-50 focus:bg-white"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
            {[
              { id: 'all', label: 'All Activity' },
              { id: 'match', label: 'Matches' },
              { id: 'view', label: 'Views' },
              { id: 'comment', label: 'Comments' },
              { id: 'resolved', label: 'Resolved' }
            ].map((type) => (
              <Button 
                key={type.id}
                size="sm"
                className={cn(
                  "rounded-xl font-bold px-4 whitespace-nowrap",
                  filterType === type.id ? "bg-slate-800 text-white" : "text-slate-600 hover:bg-slate-100"
                )}
                onClick={() => setFilterType(type.id)}
              >
                {type.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Activity Feed */}
        <div className="space-y-4">
          {loading ? (
            <div className="flex justify-center py-12">
              <Spinner size="lg" />
            </div>
          ) : filteredActivities.length > 0 ? (
            filteredActivities.map((activity) => (
              <Card 
                key={activity.id} 
                className="border border-slate-100 rounded-3xl p-5 hover:shadow-md transition-all group overflow-hidden bg-white"
              >
                <div className="flex items-start gap-4">
                  <div className={cn(
                    "p-3 rounded-2xl shrink-0 transition-transform group-hover:scale-110",
                    activity.type === 'match' ? "bg-teal-50" : 
                    activity.type === 'view' ? "bg-blue-50" : 
                    activity.type === 'resolved' ? "bg-emerald-50" : 
                    activity.type === 'comment' ? "bg-purple-50" : 
                    activity.type === 'reaction' ? "bg-rose-50" : "bg-slate-50"
                  )}>
                    {getIcon(activity.type)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{activity.time}</span>
                      {activity.itemId && (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-8 text-teal-600 font-bold hover:bg-teal-50 rounded-xl px-3"
                          onClick={() => navigate(`/item/${activity.itemId}`)}
                        >
                          View Report
                          <ExternalLink size={12} className="ml-1.5" />
                        </Button>
                      )}
                    </div>
                    <p className="text-slate-800 font-semibold leading-relaxed">
                      {activity.message}
                    </p>
                    
                    {activity.user && (
                      <div className="mt-3 flex items-center gap-2">
                        <Avatar className="w-6 h-6 border border-slate-100 shadow-sm" />
                        <span className="text-xs font-bold text-slate-600">{activity.user.name}</span>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-24 bg-white rounded-3xl border border-slate-100 border-dashed">
              <div className="p-6 bg-slate-50 rounded-full mb-4">
                <AlertCircle size={48} className="text-slate-200" />
              </div>
              <h3 className="text-xl font-bold text-slate-800">No activity found</h3>
              <p className="text-slate-500 mt-2 max-w-sm text-center font-medium">
                Try adjusting your filters or search query to find what you're looking for.
              </p>
            </div>
          )}
        </div>
        
        {/* Load More */}
        {filteredActivities.length > 5 && (
          <div className="mt-8 text-center">
            <Button variant="ghost" className="text-slate-500 font-bold hover:bg-slate-100 rounded-2xl px-8">
              View Older Activity
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ActivityPage;
