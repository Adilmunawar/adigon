
import React, { createContext, useState, useEffect, ReactNode, useContext } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate, useLocation } from 'react-router-dom';
import { LoaderCircle } from 'lucide-react';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signOut: () => Promise<void>;
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
  const [initialized, setInitialized] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Initialize auth state
  useEffect(() => {
    console.log('🔄 Initializing auth state...');
    
    let isMounted = true;

    const initializeAuth = async () => {
      try {
        // Get current session
        const { data: { session: currentSession }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('❌ Error getting session:', error);
        } else {
          console.log('✅ Current session:', currentSession ? 'Found' : 'None');
        }

        if (isMounted) {
          setSession(currentSession);
          setUser(currentSession?.user ?? null);
          setLoading(false);
          setInitialized(true);
        }
      } catch (error) {
        console.error('❌ Auth initialization error:', error);
        if (isMounted) {
          setLoading(false);
          setInitialized(true);
        }
      }
    };

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        console.log(`🔔 Auth event: ${event}`, newSession ? 'Session exists' : 'No session');
        
        if (isMounted) {
          setSession(newSession);
          setUser(newSession?.user ?? null);
          
          // Only set loading to false after we've processed the auth change
          if (initialized) {
            setLoading(false);
          }
        }
      }
    );

    initializeAuth();

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [initialized]);

  // Handle navigation after auth state is established
  useEffect(() => {
    if (!initialized || loading) {
      return;
    }

    const currentPath = location.pathname;
    console.log(`🧭 Navigation check - Path: ${currentPath}, Session: ${session ? 'Yes' : 'No'}`);

    // Use a small delay to ensure all auth state updates are complete
    const navigationTimer = setTimeout(() => {
      if (session && currentPath === '/auth') {
        console.log('🏠 Redirecting authenticated user to home');
        navigate('/', { replace: true });
      } else if (!session && currentPath !== '/auth') {
        console.log('🔐 Redirecting unauthenticated user to auth');
        navigate('/auth', { replace: true });
      }
    }, 100);

    return () => clearTimeout(navigationTimer);
  }, [session, initialized, loading, location.pathname, navigate]);

  const signOut = async () => {
    console.log('🚪 Signing out...');
    setLoading(true);
    
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('❌ Sign out error:', error);
        throw error;
      }
      console.log('✅ Sign out successful');
    } catch (error) {
      console.error('❌ Sign out failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    session,
    loading,
    signOut,
  };

  // Show loading spinner during initial load (but not on auth page)
  if (!initialized && location.pathname !== '/auth') {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <div className="text-center">
          <LoaderCircle className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
