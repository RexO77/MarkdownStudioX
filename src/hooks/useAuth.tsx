
import { useMemo, createContext, useContext, ReactNode } from 'react';
import { useUser, useAuth as useClerkAuth } from '@clerk/clerk-react';

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
  const { isLoaded: isUserLoaded, user } = useUser();
  const { isLoaded: isAuthLoaded, signOut } = useClerkAuth();

  const loading = !(isUserLoaded && isAuthLoaded);

  const mappedUser: AuthUserShape | null = useMemo(() => {
    if (!user) return null;
    return {
      id: user.id,
      email: user.primaryEmailAddress?.emailAddress,
    };
  }, [user]);

  const signUp = async () => {
    // Defer to Clerk's hosted widget/page
    window.location.href = '/auth';
    return { error: null } as { error: any };
  };

  const signIn = async () => {
    // Defer to Clerk's hosted widget/page
    window.location.href = '/auth';
    return { error: null } as { error: any };
  };

  const value: AuthContextType = {
    user: mappedUser,
    loading,
    signUp,
    signIn,
    signOut: async () => {
      await signOut();
      window.location.href = '/';
    },
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
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
