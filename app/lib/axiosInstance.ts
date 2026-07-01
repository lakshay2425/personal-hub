import axios from 'axios';

export const axiosInstance = axios.create({
    baseURL: process.env.NEXT_PUBLIC_APP_URL || '',
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    },
});
