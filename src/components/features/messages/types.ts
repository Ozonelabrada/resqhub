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
  id: string;
  senderId: string;
  text: string;
  timestamp: string;
  status: 'sent' | 'delivered' | 'read';
}
