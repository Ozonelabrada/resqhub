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
import { CommentsService, type Comment } from '../../../services/commentsService';

interface CommentSectionProps {
  itemId: number;
  itemType: 'lost' | 'found';
  itemOwnerId: number;
}

const CommentSection: React.FC<CommentSectionProps> = ({ itemId, itemType, itemOwnerId }) => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load comments on component mount
  useEffect(() => {
    loadComments();
  }, [itemId]);

  const loadComments = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await CommentsService.getComments(itemId);
      setComments(data);
    } catch (err: any) {
      setError('Failed to load comments. Please try again later.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitComment = async () => {
    if (!newComment.trim() || !isAuthenticated) return;

    setIsSubmitting(true);
    try {
      const addedComment = await CommentsService.addComment(itemId, newComment);
      setComments(prev => [addedComment, ...prev]);
      setNewComment('');
    } catch (err: any) {
      setError('Failed to post comment. Please try again.');
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleHelpful = async (commentId: number) => {
    if (!isAuthenticated) return;
    try {
      await CommentsService.toggleHelpful(commentId);
      setComments(prev => prev.map(c => 
        c.id === commentId ? { ...c, isHelpful: !c.isHelpful } : c
      ));
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleLike = async (commentId: number) => {
    if (!isAuthenticated) return;
    try {
      await CommentsService.toggleLike(commentId);
      setComments(prev => prev.map(c => 
        c.id === commentId ? { 
          ...c, 
          isLikedByUser: !c.isLikedByUser,
          likesCount: c.isLikedByUser ? c.likesCount - 1 : c.likesCount + 1
        } : c
      ));
    } catch (err) {
      console.error(err);
    }
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

      {error && <Message severity="error" text={error} className="mb-4 w-full" />}

      {/* Comment Input Section */}
      {isAuthenticated ? (
        <Card className="mb-4" style={{ backgroundColor: '#f8fafc' }}>
          <div className="flex align-items-start gap-3">
            <Avatar
              label={user?.name?.charAt(0) || 'U'}
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
        {isLoading ? (
          <div className="text-center py-6">
            <i className="pi pi-spin pi-spinner text-4xl text-green-600 mb-3"></i>
            <p className="text-gray-500">Loading comments...</p>
          </div>
        ) : comments.length === 0 ? (
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
                      onClick={() => handleToggleLike(comment.id)}
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