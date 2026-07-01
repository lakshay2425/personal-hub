"use client";

import { useGoogleAuth } from "../hooks/useGoogleOAuth";
import { AuthLoadingOverlay } from "./AuthLoadingOverlay";

type GetStartedButtonProps = {
  children: React.ReactNode;
  className?: string;
};

export default function GetStartedButton({
  children,
  className,
}: GetStartedButtonProps) {
  const { handleGoogleLogin, isAuthenticating } = useGoogleAuth();

  return (
    <>
      {isAuthenticating && <AuthLoadingOverlay message="Setting up your account..." />}
      <button
        type="button"
        onClick={() => handleGoogleLogin()}
        disabled={isAuthenticating}
        className={className}
      >
        {children}
      </button>
    </>
  );
}
