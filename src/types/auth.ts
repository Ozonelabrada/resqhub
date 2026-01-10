import type { BaseApiResponse } from "./api";

export interface SignInRequest {
  email: string;
  password: string;
}

export interface SignUpRequest {
  name: string;
  email: string;
  password: string;
  phone?: string;
  location?: string;
  bio?: string;
  agreeToNewsletter?: boolean;
  profilePicture?: string;
}

export interface AuthResponse extends BaseApiResponse {
  data?: {
    user: UserData & { token: string }; // User with token included
  };
  token?: string;
  refreshToken?: string;
  // Alternative structure for backward compatibility
  user?: UserData;
}

export type UserData = {
  id: number | string;
  name: string;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  location?: string;
  bio?: string;
  profilePicture?: string;
  role: 'user' | 'admin' | string;
  emailVerified?: boolean;
  createdAt: string;
  updatedAt: string;
};
