import React, { createContext, useContext, ReactNode } from "react";
import { trpc } from "@/lib/trpc";
import { TRPCClientError } from "@trpc/client";

export interface User {
  id: number;
  name: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  googleLogin: (credential: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const utils = trpc.useUtils();

  const meQuery = trpc.auth.me.useQuery(undefined, {
    retry: false,
    refetchOnWindowFocus: false,
  });

  const logoutMutation = trpc.auth.logout.useMutation({
    onSuccess: () => {
      utils.auth.me.setData(undefined, null);
    },
  });

  const googleLoginMutation = trpc.auth.googleLogin.useMutation({
    onSuccess: () => {
      utils.auth.me.invalidate();
    },
  });

  const googleLogin = async (credential: string) => {
    try {
      await googleLoginMutation.mutateAsync({ credential });
      return { success: true };
    } catch (err) {
      const message = err instanceof TRPCClientError ? err.message : "Google login failed";
      return { success: false, error: message };
    }
  };

  const logout = () => {
    logoutMutation.mutate();
  };

  const user = meQuery.data ?? null;

  return (
    <AuthContext.Provider value={{
      user: user as User | null,
      isLoading: meQuery.isLoading || googleLoginMutation.isPending,
      isAuthenticated: !!user,
      googleLogin,
      logout,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
