import { axiosInstance } from '../../../app/lib/axiosInstance';

/**
 * Auth API Calls (external auth service)
 */

export const authApi = {
    googleCallback: async (code: string, businessName: string) => {
        const authService = process.env.NEXT_PUBLIC_AUTH_URL;

        if (!authService) {
            throw new Error('NEXT_PUBLIC_AUTH_URL environment variable is not set');
        }

        const { data } = await axiosInstance.get<{
            userInfo: {
                profileImage: string | null;
                username: string;
                name: string;
                email: string;
            };
        }>(`${authService}/auth/google/callback`, {
            params: { code, businessName },
        });

        return data;
    },

    logout: async (): Promise<void> => {
        const authService = process.env.NEXT_PUBLIC_AUTH_URL;
        
        if (!authService) {
            throw new Error('NEXT_PUBLIC_AUTH_URL environment variable is not set');
        }

        await axiosInstance.post(`${authService}/users/logout`);
    },
};
