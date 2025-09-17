import axiosClient from './axiosClient';

interface UserData {
    id: string;
    username: string;
}

export const fetchCurrentUser = async (): Promise<UserData> => {
    const response = await axiosClient.get('/user/me');
    return response.data;
};