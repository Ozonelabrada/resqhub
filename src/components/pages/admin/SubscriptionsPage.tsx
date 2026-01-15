import React from 'react';
import { CreditCard, TrendingUp, Users, DollarSign } from 'lucide-react';
import { Card, Button, Badge } from '../../ui';
import { cn } from '@/lib/utils';

const SubscriptionsPage: React.FC = () => {
  // Mock data for demonstration
  const subscriptionPlans = [
    {
      id: 'basic',
      name: 'Basic',
      price: 9.99,
      subscribers: 245,
      revenue: 2448.55,
      status: 'active',
      features: ['10 posts/month', 'Community access', 'Basic support']
    },
    {
      id: 'pro',
      name: 'Pro',
      price: 19.99,
      subscribers: 89,
      revenue: 1779.11,
      status: 'active', 
      features: ['Unlimited posts', 'Priority support', 'Advanced analytics', 'Custom branding']
    },
    {
      id: 'premium',
      name: 'Premium',
      price: 49.99,
      subscribers: 23,
      revenue: 1149.77,
      status: 'active',
      features: ['Everything in Pro', 'White-label solution', '24/7 support', 'API access']
    }
  ];

  const totalRevenue = subscriptionPlans.reduce((sum, plan) => sum + plan.revenue, 0);
  const totalSubscribers = subscriptionPlans.reduce((sum, plan) => sum + plan.subscribers, 0);

  return (
    <div className="space-y-8">
      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 bg-purple-50 border-purple-100">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
              <DollarSign className="text-purple-600" size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-purple-700 uppercase tracking-wider">Total Revenue</p>
              <p className="text-2xl font-black text-purple-800">${totalRevenue.toFixed(2)}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-blue-50 border-blue-100">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <Users className="text-blue-600" size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-blue-700 uppercase tracking-wider">Total Subscribers</p>
              <p className="text-2xl font-black text-blue-800">{totalSubscribers}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-green-50 border-green-100">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <TrendingUp className="text-green-600" size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-green-700 uppercase tracking-wider">Avg Revenue/User</p>
              <p className="text-2xl font-black text-green-800">${(totalRevenue / totalSubscribers).toFixed(2)}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Subscription Plans */}
      <Card className="overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200">
          <h3 className="font-bold text-slate-900">Subscription Plans</h3>
        </div>

        <div className="divide-y divide-slate-100">
          {subscriptionPlans.map((plan) => (
            <div key={plan.id} className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-600 rounded-xl flex items-center justify-center text-white font-black">
                    {plan.name.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <h4 className="font-bold text-slate-900">{plan.name}</h4>
                      <Badge className={cn(
                        plan.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      )}>
                        {plan.status}
                      </Badge>
                    </div>
                    <p className="text-lg font-black text-purple-600">${plan.price}/month</p>
                  </div>
                </div>

                <div className="flex items-center gap-8">
                  <div className="text-center">
                    <p className="text-sm font-medium text-slate-600 uppercase tracking-wider">Subscribers</p>
                    <p className="text-xl font-black text-slate-900">{plan.subscribers}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium text-slate-600 uppercase tracking-wider">Revenue</p>
                    <p className="text-xl font-black text-green-600">${plan.revenue.toFixed(2)}</p>
                  </div>
                  <Button variant="outline" className="rounded-xl">
                    Manage
                  </Button>
                </div>
              </div>

              <div className="mt-4">
                <p className="text-sm font-medium text-slate-700 mb-2">Features</p>
                <div className="flex flex-wrap gap-2">
                  {plan.features.map((feature, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {feature}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Actions */}
      <div className="flex justify-end">
        <Button className="bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl gap-2">
          <CreditCard size={16} />
          Create New Plan
        </Button>
      </div>
    </div>
  );
};

export default SubscriptionsPage;