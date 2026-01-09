export interface Conversation {
  id: string;
  user: {
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
  content: string;
  timestamp: string;
  isRead: boolean;
  isGroupMessage?: boolean;
  directMessageReceiverId?: string;
  groupMessageCommunityId?: number | null;
}
