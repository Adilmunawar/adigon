
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
        
        // Get initial session first
        const getInitialSession = async () => {
            try {
                const { data: { session }, error } = await supabase.auth.getSession();
                if (error) {
                    console.error('Error getting initial session:', error);
                } else {
                    console.log('Initial session:', session?.user?.email || 'No session');
                    setSession(session);
                    setUser(session?.user ?? null);
                }
            } catch (error) {
                console.error('Error in getSession:', error);
            } finally {
                setLoading(false);
            }
        };

        getInitialSession();
        
        // Set up auth state listener
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            console.log('Auth state changed:', event, session?.user?.email || 'No session');
            
            setSession(session);
            setUser(session?.user ?? null);
            
            // Handle different auth events
            if (event === 'SIGNED_IN' && session) {
                console.log('User signed in successfully');
                setLoading(false);
            } else if (event === 'SIGNED_OUT') {
                console.log('User signed out');
                setLoading(false);
            } else if (event === 'TOKEN_REFRESHED' && session) {
                console.log('Token refreshed');
                setLoading(false);
            }
        });

        return () => {
            subscription.unsubscribe();
        };
    }, []);

    useEffect(() => {
        // Only handle redirects after loading is complete
        if (loading) {
            console.log('Still loading, skipping redirect logic');
            return;
        }

        const currentPath = location.pathname;
        console.log('Checking navigation for:', currentPath, 'Session exists:', !!session);

        // Small delay to ensure auth state is fully settled
        const timeoutId = setTimeout(() => {
            // If user is authenticated and on auth page, redirect to home
            if (session && currentPath === '/auth') {
                console.log('Authenticated user on auth page, redirecting to home');
                navigate('/', { replace: true });
                return;
            }

            // If user is not authenticated and not on auth page, redirect to auth
            if (!session && currentPath !== '/auth') {
                console.log('Unauthenticated user, redirecting to auth');
                navigate('/auth', { replace: true });
                return;
            }
        }, 100);

        return () => clearTimeout(timeoutId);
    }, [session, loading, navigate, location.pathname]);

    const logout = async () => {
        console.log('Logging out...');
        setLoading(true);
        try {
            const { error } = await supabase.auth.signOut();
            if (error) {
                console.error('Logout error:', error);
            }
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            setLoading(false);
            navigate('/auth', { replace: true });
        }
    };

    const value = {
        user,
        session,
        loading,
        logout,
    };

    // Show loading screen only when initially loading and not on auth page
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
