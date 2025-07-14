import React, { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import { supabaseClient } from "@/db/supabase.client";
import type { User, AuthChangeEvent, Session } from "@supabase/supabase-js";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  setNewPassword: (password: string) => Promise<void>;
  changePassword: (oldPassword: string, newPassword: string) => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const getSession = async () => {
      setLoading(true);
      const { data, error } = await supabaseClient.auth.getUser();
      if (error) {
        setUser(null);
      } else {
        setUser(data.user ?? null);
      }
      setLoading(false);
    };
    getSession();
    const { data: listener } = supabaseClient.auth.onAuthStateChange(
      (_event: AuthChangeEvent, session: Session | null) => {
        setUser(session?.user ?? null);
      }
    );
    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    const { error } = await supabaseClient.auth.signInWithPassword({ email, password });
    if (error) setError(error.message);
    await refreshUser();
    setLoading(false);
  };

  const register = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    const { error } = await supabaseClient.auth.signUp({ email, password });
    if (error) setError(error.message);
    await refreshUser();
    setLoading(false);
  };

  const logout = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Call API endpoint to properly clear server-side session
      const response = await fetch("/api/auth/logout", {
        method: "POST",
      });
      
      if (!response.ok) {
        const data = await response.json();
        setError(data.error);
      }
      
      // Also clear client-side session
      await supabaseClient.auth.signOut();
    } catch (error) {
      setError("Network error");
    }
    
    setUser(null);
    setLoading(false);
  };

  const resetPassword = async (email: string) => {
    setLoading(true);
    setError(null);
    const { error } = await supabaseClient.auth.resetPasswordForEmail(email);
    if (error) setError(error.message);
    setLoading(false);
  };

  const setNewPassword = async (password: string) => {
    setLoading(true);
    setError(null);
    const { error } = await supabaseClient.auth.updateUser({ password });
    if (error) setError(error.message);
    await refreshUser();
    setLoading(false);
  };

  const changePassword = async (_oldPassword: string, newPassword: string) => {
    setLoading(true);
    setError(null);
    const { error } = await supabaseClient.auth.updateUser({ password: newPassword });
    if (error) setError(error.message);
    await refreshUser();
    setLoading(false);
  };

  const refreshUser = async () => {
    const { data, error } = await supabaseClient.auth.getUser();
    if (!error) setUser(data.user ?? null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        login,
        register,
        logout,
        resetPassword,
        setNewPassword,
        changePassword,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
