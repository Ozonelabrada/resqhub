import React from 'react';
import { CheckCircle, Settings, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useUserProfile } from '@/hooks';
import { Avatar, Button, Card } from '@/components/ui';

export const UserStatus: React.FC = () => {
  const { userData: profile } = useUserProfile();
  const navigate = useNavigate();

  if (!profile) return null;

  return (
    <Card className="p-6 border-none shadow-xl bg-white rounded-4xl overflow-hidden">
        <div className="flex flex-col items-center">
            <div className="relative mb-4">
            <div className="p-1 bg-gradient-to-tr from-teal-500 to-emerald-500 rounded-full">
                <Avatar
                src={profile.profilePicture}
                className="w-24 h-24 border-4 border-white"
                />
            </div>
            <div className="absolute -bottom-1 -right-1 bg-teal-500 w-8 h-8 rounded-full border-4 border-white flex items-center justify-center text-white">
                <CheckCircle size={14} />
            </div>
            </div>
            <h2 className="text-xl font-black text-slate-900">{profile.fullName}</h2>
            <p className="text-slate-400 font-bold text-xs uppercase tracking-widest mt-1">@{profile.username}</p>
        </div>

        <div className="mt-8 space-y-2">
            <Button 
                variant="ghost" 
                onClick={() => navigate('/settings')}
                className="w-full justify-start py-6 rounded-2xl font-bold text-slate-500 hover:bg-slate-50"
            >
                <Settings className="mr-3" size={18} /> Profile Settings
            </Button>
            <Button 
                variant="ghost" 
                onClick={() => navigate('/profile?tab=overview')}
                className="w-full justify-start py-6 rounded-2xl font-bold text-slate-500 hover:bg-slate-50"
            >
                <User className="mr-3" size={18} /> My Dashboard
            </Button>
        </div>
    </Card>
  );
};
