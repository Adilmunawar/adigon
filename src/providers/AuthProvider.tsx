
import React, { createContext, useState, useEffect, ReactNode, useContext } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate, useLocation } from 'react-router-dom';
import { LoaderCircle } from 'lucide-react';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        console.log('Setting up auth state listener...');
        
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            console.log('Auth state changed:', event, session?.user?.email);
            setSession(session);
            setUser(session?.user ?? null);
            setLoading(false);
        });

        // Get initial session
        supabase.auth.getSession().then(({ data: { session } }) => {
            console.log('Initial session:', session?.user?.email);
            setSession(session);
            setUser(session?.user ?? null);
            setLoading(false);
        });

        return () => {
            subscription.unsubscribe();
        };
    }, []);

    useEffect(() => {
        // Only handle redirects after loading is complete and we have auth state
        if (loading) return;

        const currentPath = location.pathname;
        console.log('Checking navigation for:', currentPath, 'Session exists:', !!session);

        // If user is authenticated and on auth page, redirect to home
        if (session && currentPath === '/auth') {
            console.log('Authenticated user on auth page, redirecting to home');
            navigate('/');
            return;
        }

        // If user is not authenticated and not on auth page, redirect to auth
        if (!session && currentPath !== '/auth') {
            console.log('Unauthenticated user, redirecting to auth');
            navigate('/auth');
            return;
        }
    }, [session, loading, navigate, location.pathname]);

    const logout = async () => {
        console.log('Logging out...');
        await supabase.auth.signOut();
        navigate('/auth');
    };

    const value = {
        user,
        session,
        loading,
        logout,
    };

    if (loading && location.pathname !== '/auth') {
        return (
            <div className="flex items-center justify-center h-screen bg-background">
                <LoaderCircle className="h-10 w-10 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};
