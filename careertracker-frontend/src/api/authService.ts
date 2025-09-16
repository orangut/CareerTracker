import axiosClient from './axiosClient';

export interface AuthPayload {
  username: string;
  password: string;
}

export interface AuthResponse {
  token?: string;
  user?: {
    id: string;
    username: string;
    // add other user fields as needed
  };
  message?: string;
}

export const register = async (payload: AuthPayload): Promise<AuthResponse> => {
  const response = await axiosClient.post('/auth/register', payload);
  return response.data;
};

export const signIn = async (payload: AuthPayload): Promise<AuthResponse> => {
  const response = await axiosClient.post('/auth/signin', payload);
  return response.data;
};
