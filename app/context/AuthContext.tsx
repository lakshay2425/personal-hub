"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { authApi } from "@/features/auth/service/authApi";

export type StoredUserInfo = {
  profilePic: string | null;
  username: string;
  name: string;
  email: string;
};

type AuthContextValue = {
  isAuthenticated: boolean;
  user: StoredUserInfo | null;
  setIsAuthenticated: (value: boolean) => void;
  setUser: (value: StoredUserInfo | null) => void;
//   createUser: (email: string, fullName: string, role?: string) => Promise<void>;
  logout: () => Promise<void>;
};

const USER_INFO_KEY = "userInfo";

function readStoredAuthState(): {
  user: StoredUserInfo | null;
  isAuthenticated: boolean;
} {
  try {
    const storedUser = localStorage.getItem(USER_INFO_KEY);

    if (storedUser) {
      return {
        user: JSON.parse(storedUser) as StoredUserInfo,
        isAuthenticated: true,
      };
    }
  } catch (error) {
    console.error("Failed to read stored auth state:", error);
  }

  return { user: null, isAuthenticated: false };
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [user, setUserState] = useState<StoredUserInfo | null>(
    () => readStoredAuthState().user,
  );
  const [isAuthenticated, setIsAuthenticated] = useState(
    () => readStoredAuthState().isAuthenticated,
  );

  const setUser = useCallback((value: StoredUserInfo | null) => {
    setUserState(value);

    if (value === null) {
      localStorage.removeItem(USER_INFO_KEY);
    } else {
      localStorage.setItem(USER_INFO_KEY, JSON.stringify(value));
    }

    window.dispatchEvent(
      new CustomEvent("localStorage-change", {
        detail: { key: USER_INFO_KEY, value },
      }),
    );
  }, []);

//   const createUser = useCallback(
//     async (email: string, fullName: string, role = "user") => {
//       await userApi.create({ email, fullName, role });
//     },
//     [],
//   );

  const logout = useCallback(async () => {
    try {
      await authApi.logout();

      setUser(null);
      setIsAuthenticated(false);
      router.push("/");
      toast.success("Logged out successfully");
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong!");
    }
  }, [router, setUser]);

  const value = useMemo(
    () => ({
      isAuthenticated,
      user,
      setIsAuthenticated,
      setUser,
      logout,
    }),
    [isAuthenticated, logout, setUser, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
}
