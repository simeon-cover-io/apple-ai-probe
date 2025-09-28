import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Plus, Hash, Bot, Settings, Search, Edit2, Trash2, MoreVertical } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import type { EndpointSettings } from './ApiTester';

interface Conversation {
  id: string;
  title: string;
  lastMessage: string;
  timestamp: Date;
  unread: number;
  type: 'ai-agent' | 'webhook';
  endpointSettings: EndpointSettings;
}

interface ConversationSidebarProps {
  activeConversation?: string;
  onSelectConversation: (id: string) => void;
  onCreateConversation: () => void;
  onRenameConversation: (id: string, newTitle: string) => void;
  onDeleteConversation: (id: string) => void;
  conversations: Conversation[];
}

export const ConversationSidebar = ({ 
  activeConversation, 
  onSelectConversation, 
  onCreateConversation, 
  onRenameConversation, 
  onDeleteConversation, 
  conversations 
}: ConversationSidebarProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');

  const filteredConversations = conversations.filter(conv =>
    conv.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Obtener la configuración del endpoint para mostrar en la vista previa
  const getConversationSettings = (id: string): EndpointSettings => {
    const defaultSettings: EndpointSettings = {
      url: '',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      queryParams: {},
      body: ''
    };
    return conversations.find(c => c.id === id)?.endpointSettings || defaultSettings;
  };

  const handleRename = (id: string, title: string) => {
    setEditingId(id);
    setEditTitle(title);
  };

  const saveRename = () => {
    if (editingId && editTitle.trim()) {
      onRenameConversation(editingId, editTitle.trim());
    }
    setEditingId(null);
    setEditTitle('');
  };

  const cancelRename = () => {
    setEditingId(null);
    setEditTitle('');
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    
    if (hours < 1) return 'ahora';
    if (hours < 24) return `${hours}h`;
    return date.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' });
  };

  return (
    <div className="w-80 bg-sidebar-bg border-r border-border flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-lg font-semibold text-foreground">Conversaciones</h1>
          <Button 
            size="sm" 
            className="bg-primary hover:bg-primary/90 shadow-glow"
            onClick={onCreateConversation}
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>
        
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Buscar conversaciones..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-input border-border focus:border-primary"
          />
        </div>
      </div>

      {/* Conversations List */}
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {conversations.length === 0 ? (
            <div className="text-center p-8 text-muted-foreground">
              <Bot className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p className="text-sm mb-2">No hay conversaciones</p>
              <p className="text-xs">Haz clic en + para crear una nueva</p>
            </div>
          ) : (
            filteredConversations.map((conversation) => (
              <button
                key={conversation.id}
                onClick={() => onSelectConversation(conversation.id)}
                className={`w-full p-3 rounded-lg text-left transition-all duration-200 group ${
                  activeConversation === conversation.id
                    ? 'bg-sidebar-active text-sidebar-text-active shadow-glow'
                    : 'hover:bg-sidebar-hover text-sidebar-text'
                }`}
              >
                <div className="flex items-start gap-3">
                  <Avatar className="w-10 h-10 flex-shrink-0">
                    <AvatarFallback className={`${
                      conversation.type === 'ai-agent' 
                        ? 'bg-primary text-primary-foreground' 
                        : 'bg-secondary text-secondary-foreground'
                    }`}>
                      {conversation.type === 'ai-agent' ? (
                        <Bot className="w-5 h-5" />
                      ) : (
                        <Hash className="w-5 h-5" />
                      )}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      {editingId === conversation.id ? (
                        <div className="flex-1 flex items-center gap-2">
                          <Input
                            value={editTitle}
                            onChange={(e) => setEditTitle(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') saveRename();
                              if (e.key === 'Escape') cancelRename();
                            }}
                            className="h-6 text-sm"
                            autoFocus
                          />
                          <Button size="sm" variant="ghost" onClick={saveRename} className="h-6 w-6 p-0">
                            ✓
                          </Button>
                          <Button size="sm" variant="ghost" onClick={cancelRename} className="h-6 w-6 p-0">
                            ✕
                          </Button>
                        </div>
                      ) : (
                        <>
                          <h3 className={`font-medium truncate ${
                            activeConversation === conversation.id 
                              ? 'text-sidebar-text-active' 
                              : 'text-foreground group-hover:text-foreground'
                          }`}>
                            {conversation.title}
                          </h3>
                          <div className="flex items-center gap-1 flex-shrink-0">
                            {conversation.unread > 0 && (
                              <Badge className="bg-destructive text-destructive-foreground text-xs px-2">
                                {conversation.unread}
                              </Badge>
                            )}
                            <span className="text-xs text-muted-foreground">
                              {formatTime(conversation.timestamp)}
                            </span>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button 
                                  size="sm" 
                                  variant="ghost" 
                                  className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <MoreVertical className="w-3 h-3" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={(e) => {
                                  e.stopPropagation();
                                  handleRename(conversation.id, conversation.title);
                                }}>
                                  <Edit2 className="w-4 h-4 mr-2" />
                                  Renombrar
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onDeleteConversation(conversation.id);
                                  }}
                                  className="text-destructive focus:text-destructive"
                                >
                                  <Trash2 className="w-4 h-4 mr-2" />
                                  Eliminar
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </>
                      )}
                    </div>
                    
                    <p className={`text-sm truncate mb-1 ${
                      activeConversation === conversation.id 
                        ? 'text-sidebar-text-active/70' 
                        : 'text-muted-foreground'
                    }`}>
                      {conversation.lastMessage}
                    </p>

                    {/* URL Preview */}
                    {conversation.endpointSettings.url && (
                      <div className="text-xs text-muted-foreground/60 truncate">
                        <code className="bg-sidebar-bg px-1 rounded">
                          {conversation.endpointSettings.method} {conversation.endpointSettings.url}
                        </code>
                      </div>
                    )}
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      </ScrollArea>

      {/* Settings */}
      <div className="p-4 border-t border-border">
        <Button 
          variant="ghost" 
          className="w-full justify-start text-sidebar-text hover:bg-sidebar-hover hover:text-sidebar-text-active"
        >
          <Settings className="w-4 h-4 mr-2" />
          Configuración
        </Button>
      </div>
    </div>
  );
};