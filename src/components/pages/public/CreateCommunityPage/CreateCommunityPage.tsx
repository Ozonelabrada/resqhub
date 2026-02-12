import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '../../../ui';
import { CommunityService } from '../../../../services/communityService';
import { IdentityStep } from '../../../modals/Community/CreateCommunity/IdentityStep';
import { SubscriptionTierStep } from '../../../modals/Community/CreateCommunity/SubscriptionTierStep';
import { ReviewStep } from '../../../modals/Community/CreateCommunity/ReviewStep';
import { SuccessStep } from '../../../modals/Community/CreateCommunity/SuccessStep';
import { type CommunityFormData, type Step, INITIAL_FORM_DATA } from '../../../modals/Community/CreateCommunity/types';

const CreateCommunityPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>('details');
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<CommunityFormData>(INITIAL_FORM_DATA);

  const handleFinalSubmit = async () => {
    setLoading(true);
    try {
      const payload = {
        name: formData.name,
        description: formData.description,
        imageUrl: formData.imageUrl,
        maxMembers: formData.maxMembers,
        privacy: formData.privacy,
        location: formData.location,
        tier: formData.selectedTier,
        hasLiveChat: formData.hasLiveChat,
        hasFeedUpdates: formData.hasFeedUpdates,
        hasNewsPosts: formData.hasNewsPosts,
        hasAnnouncements: formData.hasAnnouncements,
        hasDiscussionPosts: formData.hasDiscussionPosts,
        hasIncidentReporting: formData.hasIncidentReporting,
        hasEmergencyMap: formData.hasEmergencyMap,
        hasBroadcastAlerts: formData.hasBroadcastAlerts,
        hasMemberDirectory: formData.hasMemberDirectory,
        hasSkillMatching: formData.hasSkillMatching,
        hasEquipmentSharing: formData.hasEquipmentSharing,
        hasNeedsBoard: formData.hasNeedsBoard,
        hasTradeMarket: formData.hasTradeMarket,
        hasEvents: formData.hasEvents,
      };

      const result = await CommunityService.submitForReview(payload);
      if (result) {
        setStep('success');
      }
    } catch (error) {
      console.error('Failed to create community:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    if (step === 'details') {
      navigate('/communities');
    } else {
      const steps: Step[] = ['details', 'tier', 'review', 'success'];
      const currentIndex = steps.indexOf(step);
      if (currentIndex > 0) {
        setStep(steps[currentIndex - 1]);
      }
    }
  };

  const handleSuccess = () => {
    setTimeout(() => {
      navigate('/communities');
    }, 2000);
  };

  const renderStep = () => {
    const props = { formData, setFormData, onNext: () => {}, onBack: handleBack, t };

    switch (step) {
      case 'details':
        return <IdentityStep {...props} onNext={() => setStep('tier')} onClose={() => navigate('/communities')} />;
      case 'tier':
        return <SubscriptionTierStep {...props} onNext={() => setStep('review')} onBack={() => setStep('details')} submitLoading={loading} />;
      case 'review':
        return (
          <ReviewStep 
            {...props} 
            onNext={() => {}} 
            onFinalSubmit={handleFinalSubmit} 
            onBack={() => setStep('tier')} 
            loading={loading} 
          />
        );
      case 'success':
        return <SuccessStep communityName={formData.name} onClose={handleSuccess} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      {step !== 'success' && (
        <div className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-sm">
          <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBack}
                className="text-slate-500 hover:text-slate-700"
              >
                <ArrowLeft size={20} />
              </Button>
              <div>
                <h1 className="text-2xl font-black text-slate-800 tracking-tight">
                  {t('community.createTitle')}
                </h1>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mt-1">
                  {step === 'details' && t('community.create.step_identity')}
                  {step === 'tier' && t('community.create.step_tier', 'Choose Your Plan')}
                  {step === 'review' && t('community.create.step_review')}
                </p>
              </div>
            </div>

            {/* Progress Indicator */}
            <div className="flex gap-2">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className={`h-2 w-8 rounded-full transition-all duration-500 ${
                    (step === 'details' && i === 1) ||
                    (step === 'tier' && i <= 2) ||
                    (step === 'review' && i <= 3)
                      ? 'bg-teal-500 w-12'
                      : 'bg-slate-200'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {step === 'success' ? (
          <div className="bg-white rounded-3xl shadow-lg p-12">
            {renderStep()}
          </div>
        ) : (
          <div className="bg-white rounded-3xl shadow-lg overflow-hidden">
            {renderStep()}
          </div>
        )}
      </div>
    </div>
  );
};

export default CreateCommunityPage;
