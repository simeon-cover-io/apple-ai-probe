import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Plus, Hash, Bot, Settings, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
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
}

export const ConversationSidebar = ({ activeConversation, onSelectConversation, onCreateConversation }: ConversationSidebarProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [conversations] = useState<Conversation[]>([
    {
      id: '1',
      title: 'ChatGPT-4 API',
      lastMessage: 'Configuración lista para OpenAI',
      timestamp: new Date(),
      unread: 0,
      type: 'ai-agent',
      endpointSettings: {
        url: 'https://api.openai.com/v1/chat/completions',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer tu-api-key-aqui',
        },
        queryParams: {},
        body: JSON.stringify({
          model: "gpt-4",
          messages: [
            {
              role: "user",
              content: "{{message}}"
            }
          ],
          max_tokens: 1000
        }, null, 2),
      }
    },
    {
      id: '2',
      title: 'Claude API',
      lastMessage: 'Configuración para Anthropic',
      timestamp: new Date(Date.now() - 3600000),
      unread: 0,
      type: 'ai-agent',
      endpointSettings: {
        url: 'https://api.anthropic.com/v1/messages',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': 'tu-claude-key-aqui',
          'anthropic-version': '2023-06-01',
        },
        queryParams: {},
        body: JSON.stringify({
          model: "claude-3-sonnet-20240229",
          max_tokens: 1000,
          messages: [
            {
              role: "user",
              content: "{{message}}"
            }
          ]
        }, null, 2),
      }
    },
    {
      id: '3',
      title: 'Webhook Personalizado',
      lastMessage: 'Listo para tu endpoint',
      timestamp: new Date(Date.now() - 7200000),
      unread: 0,
      type: 'webhook',
      endpointSettings: {
        url: 'https://tu-endpoint.com/webhook',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer tu-token',
        },
        queryParams: {
          'user_id': '123',
          'session': 'abc'
        },
        body: JSON.stringify({
          message: "{{message}}",
          timestamp: "{{timestamp}}",
          attachments: "{{attachments}}"
        }, null, 2),
      }
    }
  ]);

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
          {filteredConversations.map((conversation) => (
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
                    <h3 className={`font-medium truncate ${
                      activeConversation === conversation.id 
                        ? 'text-sidebar-text-active' 
                        : 'text-foreground group-hover:text-foreground'
                    }`}>
                      {conversation.title}
                    </h3>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {conversation.unread > 0 && (
                        <Badge className="bg-destructive text-destructive-foreground text-xs px-2">
                          {conversation.unread}
                        </Badge>
                      )}
                      <span className="text-xs text-muted-foreground">
                        {formatTime(conversation.timestamp)}
                      </span>
                    </div>
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
          ))}
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