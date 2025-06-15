
import React from 'react';
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarGroup,
  SidebarGroupContent
} from "@/components/ui/sidebar";
import { Settings, RefreshCw, Bot } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useSidebar } from './ui/sidebar';

interface AppSidebarProps {
  isSettingsOpen: boolean;
  setIsSettingsOpen: (isOpen: boolean) => void;
  tempApiKey: string;
  setTempApiKey: (key: string) => void;
  handleSaveApiKey: () => void;
  handleNewChat: () => void;
}

const AppSidebar = ({
  isSettingsOpen,
  setIsSettingsOpen,
  tempApiKey,
  setTempApiKey,
  handleSaveApiKey,
  handleNewChat,
}: AppSidebarProps) => {
  const { collapsed } = useSidebar();

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center text-primary shrink-0">
                <Bot size={24} />
            </div>
            {!collapsed && (
              <h1 className="text-xl font-semibold bg-gradient-to-r from-blue-400 to-purple-500 text-transparent bg-clip-text">
                  AdiGon
              </h1>
            )}
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <SidebarMenuButton>
                        <RefreshCw size={18} />
                        {!collapsed && <span>New Chat</span>}
                    </SidebarMenuButton>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="bg-background">
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will start a new chat and your current conversation will be cleared.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={handleNewChat} className="bg-primary hover:bg-primary/90">Continue</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </SidebarMenuItem>
              <SidebarMenuItem>
                 <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
                    <DialogTrigger asChild>
                      <SidebarMenuButton>
                          <Settings size={18} />
                          {!collapsed && <span>Settings</span>}
                      </SidebarMenuButton>
                    </DialogTrigger>
                    <DialogContent className="bg-background">
                        <DialogHeader>
                        <DialogTitle>Settings</DialogTitle>
                        <DialogDescription>
                            Manage your API keys here. You can get your Runware API key from the{" "}
                            <a href="https://runware.ai/" target="_blank" rel="noopener noreferrer" className="underline">Runware dashboard</a>.
                        </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="runware-api-key" className="text-right">
                            Runware API Key
                            </Label>
                            <Input
                            id="runware-api-key"
                            value={tempApiKey}
                            onChange={(e) => setTempApiKey(e.target.value)}
                            className="col-span-3"
                            type="password"
                            />
                        </div>
                        </div>
                        <DialogFooter>
                        <Button onClick={handleSaveApiKey} className="bg-primary hover:bg-primary/90">Save changes</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
};

export default AppSidebar;
