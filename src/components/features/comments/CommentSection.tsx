import React, { useState, useEffect } from 'react';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { InputTextarea } from 'primereact/inputtextarea';
import { Avatar } from 'primereact/avatar';
import { Badge } from 'primereact/badge';
import { Divider } from 'primereact/divider';
import { Message } from 'primereact/message';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';

interface Comment {
  id: number;
  userId: number;
  userName: string;
  userAvatar?: string;
  content: string;
  timestamp: string;
  isOwner: boolean;
  isHelpful: boolean;
  likesCount: number;
  isLikedByUser: boolean;
}

interface CommentSectionProps {
  itemId: number;
  itemType: 'lost' | 'found';
  itemOwnerId: number;
}

const CommentSection: React.FC<CommentSectionProps> = ({ itemId, itemType, itemOwnerId }) => {
  const navigate = useNavigate();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);

  // Check authentication status
  useEffect(() => {
    const auth = useAuth();
    if (auth?.token && auth?.userData) {
      setIsAuthenticated(true);
      setCurrentUser(JSON.parse(auth.userData));
    }
  }, []);

  // Load comments on component mount
  useEffect(() => {
    loadComments();
  }, [itemId]);

  const loadComments = async () => {
    // TODO: Replace with actual API call
    const mockComments: Comment[] = [
      {
        id: 1,
        userId: 2,
        userName: 'Sarah Johnson',
        content: 'I think I saw this item near the coffee shop on Main Street yesterday around 3 PM. You might want to check there!',
        timestamp: '2025-01-20T14:30:00Z',
        isOwner: false,
        isHelpful: true,
        likesCount: 5,
        isLikedByUser: false
      },
      {
        id: 2,
        userId: 3,
        userName: 'Mike Chen',
        content: 'Have you checked with the lost and found at the library? They usually keep items for a few weeks.',
        timestamp: '2025-01-20T16:45:00Z',
        isOwner: false,
        isHelpful: true,
        likesCount: 3,
        isLikedByUser: true
      },
      {
        id: 3,
        userId: itemOwnerId,
        userName: 'John Doe',
        content: 'Thank you everyone for the suggestions! I will check those locations.',
        timestamp: '2025-01-20T18:20:00Z',
        isOwner: true,
        isHelpful: false,
        likesCount: 8,
        isLikedByUser: false
      }
    ];
    setComments(mockComments);
  };

  const handleSubmitComment = async () => {
    if (!newComment.trim() || !isAuthenticated) return;

    setIsSubmitting(true);
    try {
      // TODO: Replace with actual API call
      const comment: Comment = {
        id: Date.now(),
        userId: currentUser.id,
        userName: currentUser.name,
        content: newComment.trim(),
        timestamp: new Date().toISOString(),
        isOwner: currentUser.id === itemOwnerId,
        isHelpful: false,
        likesCount: 0,
        isLikedByUser: false
      };

      setComments(prev => [comment, ...prev]);
      setNewComment('');
    } catch (error) {
      console.error('Error submitting comment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLikeComment = async (commentId: number) => {
    if (!isAuthenticated) return;

    // TODO: Replace with actual API call
    setComments(prev => prev.map(comment => 
      comment.id === commentId 
        ? {
            ...comment,
            isLikedByUser: !comment.isLikedByUser,
            likesCount: comment.isLikedByUser 
              ? comment.likesCount - 1 
              : comment.likesCount + 1
          }
        : comment
    ));
  };

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
    <Card>
      <div className="flex align-items-center justify-content-between mb-4">
        <h3 className="text-lg font-semibold m-0">
          Community Comments ({comments.length})
        </h3>
        <Badge 
          value={itemType === 'lost' ? 'Lost Item' : 'Found Item'} 
          severity={itemType === 'lost' ? 'danger' : 'success'} 
        />
      </div>

      {/* Comment Input Section */}
      {isAuthenticated ? (
        <Card className="mb-4" style={{ backgroundColor: '#f8fafc' }}>
          <div className="flex align-items-start gap-3">
            <Avatar
              label={currentUser?.name?.charAt(0) || 'U'}
              shape="circle"
              style={{ backgroundColor: '#3b82f6', color: 'white' }}
            />
            <div className="flex-1">
              <InputTextarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder={`Share information about this ${itemType} item... Any tips or suggestions?`}
                rows={3}
                className="w-full"
                maxLength={500}
              />
              <div className="flex align-items-center justify-content-between mt-2">
                <small className="text-gray-500">
                  {newComment.length}/500 characters
                </small>
                <Button
                  label="Post Comment"
                  icon="pi pi-send"
                  onClick={handleSubmitComment}
                  disabled={!newComment.trim() || isSubmitting}
                  loading={isSubmitting}
                  size="small"
                />
              </div>
            </div>
          </div>
        </Card>
      ) : (
        <Message 
          severity="info" 
          className="w-full mb-4"
          content={
            <div className="flex align-items-center justify-content-between">
              <span>Sign in to join the conversation and help reunite items with their owners.</span>
              <div className="flex gap-2">
                <Button
                  label="Sign In"
                  size="small"
                  className="p-button-outlined"
                  onClick={() => navigate('/signin')}
                />
                <Button
                  label="Sign Up"
                  size="small"
                  onClick={() => navigate('/signup')}
                />
              </div>
            </div>
          }
        />
      )}

      {/* Comments List */}
      <div className="space-y-4">
        {comments.length === 0 ? (
          <div className="text-center py-6">
            <i className="pi pi-comments text-4xl text-gray-400 mb-3"></i>
            <p className="text-gray-500">
              No comments yet. Be the first to share information about this item!
            </p>
          </div>
        ) : (
          comments.map((comment, index) => (
            <div key={comment.id}>
              <div className="flex align-items-start gap-3">
                <Avatar
                  label={comment.userName.charAt(0)}
                  shape="circle"
                  style={{ 
                    backgroundColor: comment.isOwner ? '#10b981' : '#6b7280', 
                    color: 'white' 
                  }}
                />
                <div className="flex-1">
                  <div className="flex align-items-center gap-2 mb-2">
                    <span className="font-semibold text-gray-800">
                      {comment.userName}
                    </span>
                    {comment.isOwner && (
                      <Badge value="Owner" severity="success" />
                    )}
                    {comment.isHelpful && (
                      <Badge value="Helpful" severity="info" />
                    )}
                    <span className="text-sm text-gray-500">
                      {formatTimestamp(comment.timestamp)}
                    </span>
                  </div>
                  
                  <p className="text-gray-700 mb-3 line-height-3">
                    {comment.content}
                  </p>
                  
                  <div className="flex align-items-center gap-3">
                    <Button
                      icon={comment.isLikedByUser ? 'pi pi-heart-fill' : 'pi pi-heart'}
                      label={comment.likesCount.toString()}
                      className="p-button-text p-button-sm"
                      style={{ 
                        color: comment.isLikedByUser ? '#ef4444' : '#6b7280',
                        padding: '0.25rem 0.5rem'
                      }}
                      onClick={() => handleLikeComment(comment.id)}
                      disabled={!isAuthenticated}
                    />
                    {isAuthenticated && (
                      <Button
                        icon="pi pi-reply"
                        label="Reply"
                        className="p-button-text p-button-sm"
                        style={{ color: '#6b7280', padding: '0.25rem 0.5rem' }}
                        onClick={() => {
                          setNewComment(`@${comment.userName} `);
                        }}
                      />
                    )}
                  </div>
                </div>
              </div>
              {index < comments.length - 1 && <Divider />}
            </div>
          ))
        )}
      </div>

      {/* Comment Guidelines */}
      <Divider />
      <div className="text-center">
        <small className="text-gray-500">
          💡 <strong>Community Guidelines:</strong> Share helpful information, be respectful, 
          and avoid sharing personal contact details publicly. Use the contact feature to connect privately.
        </small>
      </div>
    </Card>
  );
};

export default CommentSection;