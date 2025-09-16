import type { User } from '../context/UserContext';
import axiosClient from './axiosClient';

export interface AuthPayload {
  username: string;
  password: string;
}

export interface AuthResponse {
  token?: string;
  user?: User;
  message?: string;
}

export const register = async (payload: AuthPayload): Promise<AuthResponse> => {
  try {
    const response = await axiosClient.post('/auth/register', payload);
    return response.data;
  } catch (error: any) {
    throw error.response?.data?.message || error.message || 'Registration failed';
  }
};

export const signIn = async (payload: AuthPayload): Promise<AuthResponse> => {
  try {
    const response = await axiosClient.post('/auth/signin', payload);
    return response.data;
  } catch (error: any) {
    throw error.response?.data?.message || error.message || 'Sign in failed';
  }
};
