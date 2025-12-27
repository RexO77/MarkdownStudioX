
import { createContext, useContext, ReactNode } from 'react';

interface AuthUserShape {
  id: string;
  email?: string;
}

interface AuthContextType {
  user: AuthUserShape | null;
  loading: boolean;
  signUp: (email?: string, password?: string, fullName?: string) => Promise<{ error: any }>;
  signIn: (email?: string, password?: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  // Auth disabled - always return null user
  const value: AuthContextType = {
    user: null,
    loading: false,
    signUp: async () => ({ error: null }),
    signIn: async () => ({ error: null }),
    signOut: async () => { },
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    // Return a default value if not in provider (for backwards compatibility)
    return {
      user: null,
      loading: false,
      signUp: async () => ({ error: null }),
      signIn: async () => ({ error: null }),
      signOut: async () => { },
    };
  }
  return context;
};
