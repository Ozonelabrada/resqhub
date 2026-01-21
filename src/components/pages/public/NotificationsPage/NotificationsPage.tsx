import React, { useEffect, useState } from 'react';
import { useAuth } from '../../../../context/AuthContext';
import { useMessages } from '../../../../hooks';
import { Button, Card, Avatar, Badge } from '../../../ui';
import {
  Bell,
  LogIn,
  Trash2,
  CheckCircle,
  MessageSquare,
  Heart,
  User,
  Users,
  AlertCircle,
  Clock,
  Check,
  X
} from 'lucide-react';
import { cn } from '../../../../lib/utils';

interface Notification {
  id: string;
  type: 'message' | 'match' | 'reaction' | 'comment' | 'community';
  title: string;
  description: string;
  timestamp: string;
  read: boolean;
  actor?: {
    id: string;
    name: string;
    avatar?: string;
  };
  actionUrl?: string;
}

const NotificationsPage: React.FC = () => {
  const { user: authUser, openLoginModal } = useAuth();
  const { conversations } = useMessages(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  // Simulate loading notifications from conversations (in real app, use notification service)
  useEffect(() => {
    if (conversations && conversations.length > 0) {
      const generatedNotifications: Notification[] = conversations.map((conv: any, idx: number) => ({
        id: `notif-${conv.id || idx}`,
        type: 'message',
        title: `New message from ${conv.user?.fullName || 'User'}`,
        description: conv.lastMessage || 'Sent you a message',
        timestamp: new Date(Date.now() - Math.random() * 86400000).toISOString(),
        read: Math.random() > 0.3,
        actor: {
          id: conv.user?.id || 'user-' + idx,
          name: conv.user?.fullName || 'User',
          avatar: conv.user?.profilePicture
        },
        actionUrl: `/messages`
      }));
      setNotifications(generatedNotifications);
    }
  }, [conversations]);

  if (!authUser) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-6 bg-slate-50">
        <Card className="max-w-md w-full p-10 text-center rounded-3xl border-none shadow-2xl bg-white">
          <div className="w-20 h-20 rounded-3xl bg-teal-100 flex items-center justify-center text-teal-600 mx-auto mb-8">
            <Bell size={40} />
          </div>
          <h2 className="text-2xl font-black text-slate-900 mb-3">Sign In Required</h2>
          <p className="text-slate-500 font-medium mb-8">Sign in to view your notifications.</p>
          <Button
            className="w-full rounded-2xl py-4 h-auto font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3"
            onClick={() => openLoginModal()}
          >
            <LogIn size={18} />
            Sign In Now
          </Button>
        </Card>
      </div>
    );
  }

  const unreadCount = notifications.filter(n => !n.read).length;
  const filteredNotifications = filter === 'unread'
    ? notifications.filter(n => !n.read)
    : notifications;

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'message':
        return <MessageSquare size={20} className="text-blue-600" />;
      case 'match':
        return <Heart size={20} className="text-rose-600" />;
      case 'reaction':
        return <Heart size={20} className="text-purple-600" />;
      case 'comment':
        return <MessageSquare size={20} className="text-orange-600" />;
      case 'community':
        return <Users size={20} className="text-teal-600" />;
      default:
        return <Bell size={20} className="text-slate-600" />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'message':
        return 'bg-blue-50 border-blue-200';
      case 'match':
        return 'bg-rose-50 border-rose-200';
      case 'reaction':
        return 'bg-purple-50 border-purple-200';
      case 'comment':
        return 'bg-orange-50 border-orange-200';
      case 'community':
        return 'bg-teal-50 border-teal-200';
      default:
        return 'bg-slate-50 border-slate-200';
    }
  };

  const handleMarkAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  };

  const handleMarkAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const handleDelete = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInSeconds = (now.getTime() - date.getTime()) / 1000;

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;

    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-teal-100 flex items-center justify-center text-teal-600">
                <Bell size={24} />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-black text-slate-900">Notifications</h1>
                <p className="text-sm text-slate-500 font-medium">Stay updated with your activity</p>
              </div>
            </div>
            {unreadCount > 0 && (
              <div className="flex items-center gap-2">
                <Badge className="bg-teal-100 text-teal-700 rounded-full px-3 py-1 font-bold">
                  {unreadCount} new
                </Badge>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-teal-600 font-bold"
                  onClick={handleMarkAllAsRead}
                >
                  <Check size={16} className="mr-1" />
                  Mark all as read
                </Button>
              </div>
            )}
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-3">
            <button
              onClick={() => setFilter('all')}
              className={cn(
                'px-6 py-2 rounded-2xl font-bold uppercase tracking-widest text-xs transition-all',
                filter === 'all'
                  ? 'bg-teal-600 text-white shadow-lg shadow-teal-200'
                  : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-300'
              )}
            >
              All ({notifications.length})
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={cn(
                'px-6 py-2 rounded-2xl font-bold uppercase tracking-widest text-xs transition-all',
                filter === 'unread'
                  ? 'bg-teal-600 text-white shadow-lg shadow-teal-200'
                  : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-300'
              )}
            >
              Unread ({unreadCount})
            </button>
          </div>
        </div>

        {/* Notifications List */}
        <div className="space-y-3">
          {filteredNotifications.length === 0 ? (
            <Card className="p-16 rounded-3xl text-center bg-white border border-slate-100">
              <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 mx-auto mb-4">
                <Bell size={32} />
              </div>
              <h3 className="text-xl font-black text-slate-900 mb-2">
                {filter === 'unread' ? 'All caught up!' : 'No notifications yet'}
              </h3>
              <p className="text-slate-500 font-medium">
                {filter === 'unread'
                  ? 'You have no unread notifications.'
                  : 'Notifications will appear here when you get activity.'}
              </p>
            </Card>
          ) : (
            filteredNotifications.map((notification, idx) => (
              <Card
                key={notification.id}
                className={cn(
                  'p-5 rounded-2xl border transition-all cursor-pointer hover:shadow-md',
                  getNotificationColor(notification.type),
                  !notification.read && 'ring-2 ring-teal-400'
                )}
                onClick={() => !notification.read && handleMarkAsRead(notification.id)}
              >
                <div className="flex items-start gap-4">
                  {/* Icon / Avatar */}
                  {notification.actor ? (
                    <Avatar
                      src={notification.actor.avatar}
                      label={notification.actor.name.charAt(0)}
                      className="w-12 h-12 rounded-xl flex-shrink-0"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center flex-shrink-0 border border-slate-200">
                      {getNotificationIcon(notification.type)}
                    </div>
                  )}

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4 mb-1">
                      <div>
                        <h3 className={cn(
                          'font-bold truncate',
                          !notification.read ? 'text-slate-900' : 'text-slate-700'
                        )}>
                          {notification.title}
                        </h3>
                        <p className="text-sm text-slate-600 line-clamp-2 mt-1">
                          {notification.description}
                        </p>
                      </div>
                      {!notification.read && (
                        <div className="w-3 h-3 rounded-full bg-teal-600 flex-shrink-0 mt-2" />
                      )}
                    </div>

                    {/* Meta Info */}
                    <div className="flex items-center justify-between mt-3">
                      <span className="text-xs text-slate-500 font-medium flex items-center gap-1">
                        <Clock size={12} />
                        {formatTime(notification.timestamp)}
                      </span>
                      <div className="flex items-center gap-2">
                        {!notification.read && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleMarkAsRead(notification.id);
                            }}
                            className="text-teal-600 hover:text-teal-700 font-bold text-xs uppercase tracking-widest p-1"
                            title="Mark as read"
                          >
                            <Check size={14} />
                          </button>
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(notification.id);
                          }}
                          className="text-slate-400 hover:text-rose-600 p-1 transition-colors"
                          title="Delete notification"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>

        {/* Info Banner */}
        {notifications.length > 0 && (
          <Card className="mt-8 p-5 rounded-2xl bg-blue-50 border border-blue-200 flex items-start gap-3">
            <AlertCircle size={20} className="text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-blue-900 mb-1">Stay Connected</h4>
              <p className="text-sm text-blue-700">
                Enable push notifications in your settings to get real-time updates about messages, matches, and community activity.
              </p>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;
