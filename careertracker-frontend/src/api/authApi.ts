import axiosClient from './axiosClient';

const BASE_URL = '/auth';

export const authLogin = async (username: string, password: string) => {
    // The browser handles the cookie automatically due to withCredentials: true
    await axiosClient.post(`${BASE_URL}/login`, { username, password });
};

export const authSignup = async (username: string, password: string) => {
    await axiosClient.post(`${BASE_URL}/register`, { username, password });
};