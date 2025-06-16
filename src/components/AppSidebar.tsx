
import React from 'react';
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel
} from "@/components/ui/sidebar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Settings, RefreshCw, Bot, MessageSquare, Trash2 } from 'lucide-react';
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
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useSidebar } from './ui/sidebar';

interface Conversation {
  id: string;
  title: string;
}

interface AppSidebarProps {
  isSettingsOpen: boolean;
  setIsSettingsOpen: (isOpen: boolean) => void;
  tempApiKey: string;
  setTempApiKey: (key: string) => void;
  handleSaveApiKey: () => void;
  handleNewChat: () => void;
  conversations: Conversation[];
  activeConversationId: string | null;
  onSelectConversation: (id: string) => void;
  onDeleteConversation: (id: string) => void;
}

const AppSidebar = ({
  isSettingsOpen,
  setIsSettingsOpen,
  tempApiKey,
  setTempApiKey,
  handleSaveApiKey,
  handleNewChat,
  conversations,
  activeConversationId,
  onSelectConversation,
  onDeleteConversation,
}: AppSidebarProps) => {
  const { collapsed } = useSidebar();

  return (
    <Sidebar className="border-r border-border/40">
      <SidebarHeader className="border-b border-border/40">
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
      <SidebarContent className="flex flex-col overflow-hidden">
        <SidebarGroup className="py-2">
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton onClick={handleNewChat} className="w-full">
                    <RefreshCw size={18} />
                    {!collapsed && <span>New Chat</span>}
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="flex-1 overflow-hidden">
          {!collapsed && <SidebarGroupLabel>History</SidebarGroupLabel>}
          <SidebarGroupContent className="overflow-hidden">
            <ScrollArea className="h-full">
              <SidebarMenu className="space-y-1 pr-2">
                {conversations.map((convo) => (
                  <SidebarMenuItem key={convo.id}>
                    <div className="group flex items-center w-full">
                      <SidebarMenuButton
                        onClick={() => onSelectConversation(convo.id)}
                        variant={activeConversationId === convo.id ? "secondary" : "ghost"}
                        className="w-full justify-start truncate flex-1 pr-1"
                      >
                        {!collapsed && <span className="truncate flex-1 text-left">{convo.title}</span>}
                      </SidebarMenuButton>
                      {!collapsed && (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="shrink-0 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Trash2 size={16} />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent className="bg-background">
                            <AlertDialogHeader>
                              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This action cannot be undone. This will permanently delete this conversation.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => onDeleteConversation(convo.id)} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      )}
                    </div>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </ScrollArea>
          </SidebarGroupContent>
        </SidebarGroup>
        
        <SidebarGroup className="mt-auto border-t border-border/40 py-2">
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                 <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
                    <DialogTrigger asChild>
                      <SidebarMenuButton className="w-full">
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
