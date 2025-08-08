import React from 'react';
import { Button } from 'primereact/button';
import { Avatar } from 'primereact/avatar';
import { Badge } from 'primereact/badge';

interface CommentCardProps {
  userName: string;
  content: string;
  timestamp: string;
  isOwner?: boolean;
  isHelpful?: boolean;
  likesCount: number;
  isLikedByUser: boolean;
  onLike: () => void;
  onReply: () => void;
  isAuthenticated: boolean;
}

const CommentCard: React.FC<CommentCardProps> = ({
  userName,
  content,
  timestamp,
  isOwner = false,
  isHelpful = false,
  likesCount,
  isLikedByUser,
  onLike,
  onReply,
  isAuthenticated
}) => {
  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (days > 0) {
      return `${days} day${days > 1 ? 's' : ''} ago`;
    } else if (hours > 0) {
      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else {
      return 'Just now';
    }
  };

  return (
    <div className="flex align-items-start gap-3 p-3">
      <Avatar
        label={userName.charAt(0)}
        shape="circle"
        style={{ 
          backgroundColor: isOwner ? '#10b981' : '#6b7280', 
          color: 'white' 
        }}
      />
      <div className="flex-1">
        <div className="flex align-items-center gap-2 mb-2">
          <span className="font-semibold text-gray-800">
            {userName}
          </span>
          {isOwner && (
            <Badge value="Owner" severity="success" />
          )}
          {isHelpful && (
            <Badge value="Helpful" severity="info" />
          )}
          <span className="text-sm text-gray-500">
            {formatTimestamp(timestamp)}
          </span>
        </div>
        
        <p className="text-gray-700 mb-3 line-height-3">
          {content}
        </p>
        
        <div className="flex align-items-center gap-3">
          <Button
            icon={isLikedByUser ? 'pi pi-heart-fill' : 'pi pi-heart'}
            label={likesCount.toString()}
            className="p-button-text p-button-sm"
            style={{ 
              color: isLikedByUser ? '#ef4444' : '#6b7280',
              padding: '0.25rem 0.5rem'
            }}
            onClick={onLike}
            disabled={!isAuthenticated}
          />
          {isAuthenticated && (
            <Button
              icon="pi pi-reply"
              label="Reply"
              className="p-button-text p-button-sm"
              style={{ color: '#6b7280', padding: '0.25rem 0.5rem' }}
              onClick={onReply}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default CommentCard;