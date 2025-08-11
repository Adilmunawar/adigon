import * as React from "react"
import { useState } from "react"
import {
  MessageSquare,
  Plus,
  Settings,
  Trash2,
  Bot,
  Key,
  LogOut,
  User,
  Zap
} from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useAuth } from "@/providers/AuthProvider"
import { supabase } from "@/integrations/supabase/client"
import { toast } from "@/components/ui/sonner"
import AdvancedSettings from "./AdvancedSettings"

interface AppSidebarProps {
  isSettingsOpen: boolean
  setIsSettingsOpen: (open: boolean) => void
  tempApiKey: string
  setTempApiKey: (key: string) => void
  handleSaveApiKey: () => void
  handleNewChat: () => Promise<void>
  conversations: { id: string; title: string }[]
  activeConversationId: string | null
  onSelectConversation: (id: string) => void
  onDeleteConversation: (id: string) => void
}

export default function AppSidebar({
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
}: AppSidebarProps) {
  const { user, signOut } = useAuth()
  const [isAdvancedSettingsOpen, setIsAdvancedSettingsOpen] = useState(false)

  const handleSignOut = async () => {
    try {
      await signOut()
      toast.success("Signed out successfully!")
    } catch (error) {
      toast.error("Error signing out")
    }
  }

  return (
    <>
      <Sidebar variant="sidebar" className="bg-slate-900 border-slate-800">
        <SidebarHeader className="border-b border-slate-800 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">AdiGon AI</h1>
              <p className="text-sm text-slate-400">Intelligent Assistant</p>
            </div>
          </div>
        </SidebarHeader>

        <SidebarContent className="p-4">
          <SidebarGroup>
            <SidebarGroupLabel className="text-slate-400 text-xs uppercase tracking-wider mb-3">
              Chat
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton 
                    onClick={handleNewChat}
                    className="w-full justify-start gap-3 p-3 bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 hover:border-blue-500/40 text-blue-400 hover:text-blue-300 rounded-xl transition-all duration-200"
                  >
                    <Plus className="w-5 h-5" />
                    <span className="font-medium">New Chat</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          {conversations.length > 0 && (
            <SidebarGroup>
              <SidebarGroupLabel className="text-slate-400 text-xs uppercase tracking-wider mb-3">
                Recent Chats
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {conversations.slice(0, 10).map((conversation) => (
                    <SidebarMenuItem key={conversation.id}>
                      <div className="flex items-center gap-2 group">
                        <SidebarMenuButton
                          onClick={() => onSelectConversation(conversation.id)}
                          className={cn(
                            "flex-1 justify-start gap-3 p-3 rounded-xl transition-all duration-200 truncate",
                            activeConversationId === conversation.id
                              ? "bg-slate-800 text-white border border-slate-700"
                              : "text-slate-300 hover:bg-slate-800/50 hover:text-white"
                          )}
                        >
                          <MessageSquare className="w-4 h-4 flex-shrink-0" />
                          <span className="truncate text-sm">{conversation.title}</span>
                        </SidebarMenuButton>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onDeleteConversation(conversation.id)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 h-8 w-8 text-slate-500 hover:text-red-400 hover:bg-red-500/10"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          )}
        </SidebarContent>

        <SidebarFooter className="border-t border-slate-800 p-4">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton 
                onClick={() => setIsSettingsOpen(true)}
                className="w-full justify-start gap-3 p-3 text-slate-300 hover:bg-slate-800/50 hover:text-white rounded-xl transition-all duration-200"
              >
                <Key className="w-5 h-5" />
                <span>API Settings</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton 
                onClick={() => setIsAdvancedSettingsOpen(true)}
                className="w-full justify-start gap-3 p-3 text-slate-300 hover:bg-slate-800/50 hover:text-white rounded-xl transition-all duration-200"
              >
                <Settings className="w-5 h-5" />
                <span>Advanced Settings</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            {user && (
              <SidebarMenuItem>
                <SidebarMenuButton 
                  onClick={handleSignOut}
                  className="w-full justify-start gap-3 p-3 text-slate-300 hover:bg-red-500/10 hover:text-red-400 rounded-xl transition-all duration-200"
                >
                  <LogOut className="w-5 h-5" />
                  <span>Sign Out</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )}
          </SidebarMenu>
          
          {user && (
            <div className="mt-4 p-3 bg-slate-800/50 rounded-xl border border-slate-700/50">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                  <User className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">
                    {user.email}
                  </p>
                  <p className="text-xs text-slate-400">Authenticated</p>
                </div>
              </div>
            </div>
          )}
        </SidebarFooter>
        <SidebarRail />
      </Sidebar>

      {/* API Settings Sheet */}
      <Sheet open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
        <SheetContent side="left" className="w-96 bg-slate-900 border-slate-800">
          <SheetHeader>
            <SheetTitle className="text-white flex items-center gap-2">
              <Key className="w-5 h-5" />
              API Configuration
            </SheetTitle>
            <SheetDescription className="text-slate-400">
              Configure your Gemini API key to start chatting
            </SheetDescription>
          </SheetHeader>
          
          <div className="space-y-6 mt-6">
            <div className="space-y-3">
              <Label htmlFor="api-key" className="text-white font-medium">
                Gemini API Key
              </Label>
              <Input
                id="api-key"
                type="password"
                placeholder="Enter your API key..."
                value={tempApiKey}
                onChange={(e) => setTempApiKey(e.target.value)}
                className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 focus:border-blue-500"
              />
              <p className="text-sm text-slate-400">
                Get your API key from{" "}
                <a
                  href="https://makersuite.google.com/app/apikey"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-300 underline"
                >
                  Google AI Studio
                </a>
              </p>
            </div>
            
            <Button 
              onClick={handleSaveApiKey} 
              className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-medium"
            >
              <Zap className="w-4 h-4 mr-2" />
              Save Configuration
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      {/* Advanced Settings Dialog */}
      <Dialog open={isAdvancedSettingsOpen} onOpenChange={setIsAdvancedSettingsOpen}>
        <DialogContent className="max-w-4xl w-full bg-slate-900 border-slate-800 text-white max-h-[90vh] overflow-hidden p-0">
          <DialogHeader className="p-6 pb-0">
            <DialogTitle className="text-white flex items-center gap-2 text-xl">
              <Settings className="w-6 h-6" />
              Advanced Settings
            </DialogTitle>
            <DialogDescription className="text-slate-400">
              Customize your AI experience and manage your preferences
            </DialogDescription>
          </DialogHeader>
          
          <div className="overflow-y-auto flex-1">
            <AdvancedSettings />
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
