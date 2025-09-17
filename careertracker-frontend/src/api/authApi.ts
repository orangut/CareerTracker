import axiosClient from './axiosClient';

const AUTH_URL = '/auth';

export const authLogin = async (username: string, password: string) => {
    // The browser handles the cookie automatically due to withCredentials: true
    await axiosClient.post(`${AUTH_URL}/login`, { username, password });
};

export const authSignup = async (username: string, password: string) => {
    await axiosClient.post(`${AUTH_URL}/register`, { username, password });
};