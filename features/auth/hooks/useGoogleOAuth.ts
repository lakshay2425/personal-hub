"use client";

import { useState } from "react";
import { useGoogleLogin, type CodeResponse } from "@react-oauth/google";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { useAuth } from "@/app/context/AuthContext";
import { authApi } from "../service/authApi";

const businessName = process.env.NEXT_PUBLIC_BUSINESS_NAME ?? "IdeaHub";

export function useGoogleAuth() {
  const { setIsAuthenticated, setUser } = useAuth();
  const router = useRouter();
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  const googleResponse = async (authResult: CodeResponse) => {
    setIsAuthenticating(true);

    try {
      if (!authResult.code) {
        throw new Error("Missing Google authorization code");
      }

      const data = await authApi.googleCallback(authResult.code, businessName);

      setUser({
        profilePic: data.userInfo.profileImage,
        username: data.userInfo.username,
        name: data.userInfo.name,
        email: data.userInfo.email,
      });
      setIsAuthenticated(true);

    //   const doesUserExist = await userApi.getByEmail(data.userInfo.email);
    //   if (!doesUserExist.exist) {
    //     await createUser(data.userInfo.email, data.userInfo.name);
    //   }

      toast.success("Logged in successfully");
      router.push("/ideas");
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong!");
      setIsAuthenticating(false);
    }
  };

  const handleGoogleError = (error: { error?: string }) => {
    if (error.error === "popup_closed_by_user" || error.error === "access_denied") {
      toast.error("Account selection canceled.");
      return;
    }

    console.error("Google Login Error:", error);
    toast.error("Google login failed.");
  };

  const handleGoogleLogin = useGoogleLogin({
    onSuccess: googleResponse,
    onError: handleGoogleError,
    flow: "auth-code",
  });

  return { handleGoogleLogin, isAuthenticating };
}
