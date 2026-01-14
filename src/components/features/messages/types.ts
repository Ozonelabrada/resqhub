export interface Conversation {
  id: string;
  user: {
    id: string;
    fullName: string;
    username: string;
    profilePicture?: string;
    isOnline?: boolean;
  };
  lastMessage: string;
  timestamp: string;
  unreadCount: number;
}

export interface Message {
  id: string | number;
  senderId: string;
  senderName?: string;
  senderProfilePicture?: string;
  senderRole?: 'user' | 'admin' | 'moderator' | string;
  content: string;
  timestamp: string;
  isRead: boolean;
  isGroupMessage?: boolean;
  isVisibleToAll?: boolean;
  directMessageReceiverId?: string;
  groupMessageCommunityId?: number | null;
}
