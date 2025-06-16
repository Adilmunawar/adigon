
import React from 'react';
import { Button } from '@/components/ui/button';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { LogOut } from 'lucide-react';

interface UserHeaderProps {
  user: any;
  signOut: () => void;
}

const UserHeader = ({ user, signOut }: UserHeaderProps) => {
  return (
    <header className="flex items-center justify-between p-4 border-b border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex items-center gap-3">
        <SidebarTrigger className="transition-all duration-300 hover:scale-110" />
        <div className="h-6 w-px bg-border/50" />
        <h1 className="text-xl font-semibold bg-gradient-to-r from-primary/80 to-primary text-transparent bg-clip-text">
          AdiGon AI
        </h1>
      </div>
      
      {user && (
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground hidden sm:inline max-w-[200px] truncate">
            {user.email}
          </span>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={signOut} 
            className="rounded-full transition-all duration-300 hover:scale-110 hover:bg-destructive/10 hover:text-destructive" 
            aria-label="Logout"
          >
            <LogOut size={16} />
          </Button>
        </div>
      )}
    </header>
  );
};

export default UserHeader;
