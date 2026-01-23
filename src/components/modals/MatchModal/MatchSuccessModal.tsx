import React from 'react';
import { useTranslation } from 'react-i18next';
import { Heart, Share2, Home, Star, CheckCircle } from 'lucide-react';
import { Modal } from '../../ui/Modal/Modal';
import { Button } from '../../ui';

interface MatchSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  onShare?: () => void;
  onBackToHub?: () => void;
  itemTitle?: string;
  itemImage?: string;
  // If the current user is the owner of the report, show resolve action
  isOwner?: boolean;
  // Called when the owner resolves the match
  onResolve?: () => Promise<void> | void;
  resolveLoading?: boolean;
}

export const MatchSuccessModal: React.FC<MatchSuccessModalProps> = ({
  isOpen,
  onClose,
  onShare,
  onBackToHub,
  itemTitle = 'Item',
  itemImage,
  isOwner = false,
  onResolve,
  resolveLoading = false
}) => {
  const { t } = useTranslation();

  const handleShare = () => {
    if (onShare) {
      onShare();
    }
  };

  const handleBackToHub = () => {
    if (onBackToHub) {
      onBackToHub();
    } else {
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="lg"
      className="p-0 border-none rounded-[3rem] overflow-hidden"
    >
      <div className="relative bg-gradient-to-br from-teal-50 via-white to-emerald-50 p-0">
        {/* Decorative background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-teal-200 to-emerald-200 rounded-full opacity-20 blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-tr from-orange-200 to-teal-200 rounded-full opacity-20 blur-3xl" />
        </div>

        {/* Content */}
        <div className="relative z-10 p-8 md:p-12 text-center space-y-8">
          {/* Celebration Icon */}
          <div className="flex justify-center pt-4">
            <div className="relative">
              <div className="w-24 h-24 bg-gradient-to-br from-teal-600 to-emerald-600 rounded-full flex items-center justify-center shadow-xl shadow-teal-200 animate-bounce">
                <Heart size={48} className="text-white" />
              </div>
              {/* Decorative stars around icon */}
              <div className="absolute -top-2 -right-2 animate-spin" style={{ animationDuration: '3s' }}>
                <Star size={20} className="text-amber-400 fill-amber-400" />
              </div>
              <div className="absolute -bottom-2 -left-2 animate-pulse">
                <Star size={16} className="text-amber-300 fill-amber-300" />
              </div>
            </div>
          </div>

          {/* Main Title */}
          <div className="space-y-2">
            <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">
              {t('match.success_title') || 'Item Reunited!'}
            </h2>
            <p className="text-lg text-slate-600 font-medium">
              {t('match.success_subtitle') || 'What an amazing community moment!'}
            </p>
          </div>

          {/* Item Details */}
          <div className="bg-white rounded-2xl shadow-lg p-6 space-y-4">
            {itemImage && (
              <div className="relative w-32 h-32 mx-auto rounded-2xl overflow-hidden shadow-md">
                <img
                  src={itemImage}
                  alt={itemTitle}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <div>
              <p className="text-sm text-slate-500 font-medium uppercase tracking-wide">
                {t('match.success_item_label') || 'Item Recovered'}
              </p>
              <h3 className="text-2xl font-bold text-slate-900 mt-1">
                {itemTitle}
              </h3>
            </div>
          </div>

          {/* Impact Card */}
          <div className="grid grid-cols-1 gap-4">
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl border-2 border-amber-200 p-6 space-y-2">
              <div className="flex items-center justify-center gap-2">
                <Star size={20} className="text-amber-500 fill-amber-500" />
                <span className="text-sm font-bold text-amber-700 uppercase tracking-wider">
                  {t('match.community_hero_points') || 'Community Hero Points'}
                </span>
              </div>
              <p className="text-3xl font-black text-amber-600">
                +1
              </p>
              <p className="text-xs text-amber-700">
                {t('match.hero_points_description') || 'You\'re helping make your community safer!'}
              </p>
            </div>
          </div>

          {/* Success Message */}
          <div className="bg-emerald-50 rounded-2xl border border-emerald-200 p-4">
            <p className="text-sm text-emerald-900">
              {t('match.success_message') || 'Thanks for being part of the ReqHub community and helping reunite lost items with their owners. Together, we\'re making a real difference!'}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 pt-6">
            <Button
              onClick={handleShare}
              variant="secondary"
              className="flex-1 py-4 rounded-2xl border-2 border-teal-200 bg-white hover:bg-teal-50 text-teal-600 font-bold text-base transition-all"
            >
              <Share2 size={20} />
              <span>{t('match.share_story') || 'Share Story'}</span>
            </Button>

            {isOwner && onResolve ? (
              <Button
                onClick={() => onResolve()}
                className="flex-1 py-4 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-base shadow-lg shadow-amber-200 transition-all"
                disabled={resolveLoading}
              >
                <CheckCircle className="mr-2" />
                <span>{t('match.resolve_match') || 'Resolve Match'}</span>
              </Button>
            ) : (
              <Button
                onClick={handleBackToHub}
                className="flex-1 py-4 rounded-2xl bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white font-bold text-base shadow-lg shadow-teal-200 transition-all"
              >
                <Home size={20} />
                <span>{t('match.back_to_hub') || 'Back to Hub'}</span>
              </Button>
            )}
          </div>

          {/* Close hint */}
          <button
            onClick={onClose}
            className="mx-auto text-sm text-slate-400 hover:text-slate-600 transition-colors pt-2"
          >
            {t('common.close') || 'Close'}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default MatchSuccessModal;
