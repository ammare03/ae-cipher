import { useAuth } from "@clerk/nextjs";

export function useAuthCheck() {
  const { isSignedIn, isLoaded } = useAuth();

  return {
    isSignedIn,
    isLoaded,
    isAuthenticated: isLoaded && isSignedIn,
  };
}
