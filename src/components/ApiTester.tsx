import { useState, useEffect } from 'react';
import { ConversationSidebar } from './ConversationSidebar';
import { ChatInterface } from './ChatInterface';
import { MembersPanel } from './MembersPanel';
import { Button } from '@/components/ui/button';
import { Bot, Plus, ChevronLeft, ChevronRight, Settings, MessageSquare } from 'lucide-react';
import { z } from 'zod';

export interface EndpointSettings {
  url: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers: Record<string, string>;
  queryParams: Record<string, string>;
  body: string;
}

export interface ChatMessage {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  attachments?: {
    type: 'image' | 'audio';
    url: string;
    name: string;
  }[];
}

interface ConversationData {
  id: string;
  title: string;
  description: string;
  messages: ChatMessage[];
  endpointSettings: EndpointSettings;
}

// Schema de validación para entrada de usuario
const messageSchema = z.object({
  content: z.string().trim().min(1, "El mensaje no puede estar vacío").max(5000, "El mensaje es demasiado largo"),
  attachments: z.array(z.object({
    type: z.enum(['image', 'audio']),
    url: z.string().url(),
    name: z.string().max(255)
  })).optional()
});

const STORAGE_KEY = 'ai-tester-conversations';
const ACTIVE_CONVERSATION_KEY = 'ai-tester-active-conversation';

const ApiTester = () => {
  const [activeConversation, setActiveConversation] = useState<string | null>(null);
  const [conversations, setConversations] = useState<ConversationData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [leftSidebarOpen, setLeftSidebarOpen] = useState(true);
  const [rightSidebarOpen, setRightSidebarOpen] = useState(true);

  // Cargar conversaciones desde localStorage al iniciar
  useEffect(() => {
    const savedConversations = localStorage.getItem(STORAGE_KEY);
    const savedActiveConversation = localStorage.getItem(ACTIVE_CONVERSATION_KEY);
    
    if (savedConversations) {
      try {
        const parsed = JSON.parse(savedConversations);
        // Convertir timestamps a Date objects
        const conversationsWithDates = parsed.map((conv: any) => ({
          ...conv,
          messages: conv.messages.map((msg: any) => ({
            ...msg,
            timestamp: new Date(msg.timestamp)
          }))
        }));
        setConversations(conversationsWithDates);
      } catch (error) {
        console.error('Error parsing saved conversations:', error);
      }
    }
    
    if (savedActiveConversation) {
      setActiveConversation(savedActiveConversation);
    }
  }, []);

  // Guardar conversaciones en localStorage cuando cambien
  useEffect(() => {
    if (conversations.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(conversations));
    }
  }, [conversations]);

  // Guardar conversación activa en localStorage cuando cambie
  useEffect(() => {
    if (activeConversation) {
      localStorage.setItem(ACTIVE_CONVERSATION_KEY, activeConversation);
    }
  }, [activeConversation]);

  const activeConversationData = conversations.find(c => c.id === activeConversation);

  const createNewConversation = () => {
    const newId = Date.now().toString();
    const newConversation: ConversationData = {
      id: newId,
      title: `Conversación ${conversations.length + 1}`,
      description: 'Nueva conversación de prueba de API',
      endpointSettings: {
        url: '',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        queryParams: {},
        body: JSON.stringify({
          message: "{{message}}"
        }, null, 2),
      },
      messages: [
        {
          id: '1',
          type: 'assistant',
          content: '¡Hola! Nueva conversación creada. Configura tu endpoint en el panel derecho y empezemos a chatear.',
          timestamp: new Date(),
        },
      ]
    };

    setConversations(prev => [...prev, newConversation]);
    setActiveConversation(newId);
  };

  const updateConversationSettings = (settings: EndpointSettings) => {
    setConversations(prev => 
      prev.map(conv => 
        conv.id === activeConversation 
          ? { ...conv, endpointSettings: settings }
          : conv
      )
    );
  };

  const renameConversation = (id: string, newTitle: string) => {
    setConversations(prev => 
      prev.map(conv => 
        conv.id === id 
          ? { ...conv, title: newTitle }
          : conv
      )
    );
  };

  const updateConversationDescription = (id: string, newDescription: string) => {
    setConversations(prev => 
      prev.map(conv => 
        conv.id === id 
          ? { ...conv, description: newDescription }
          : conv
      )
    );
  };

  const deleteConversation = (id: string) => {
    setConversations(prev => prev.filter(conv => conv.id !== id));
    if (activeConversation === id) {
      const remaining = conversations.filter(conv => conv.id !== id);
      setActiveConversation(remaining.length > 0 ? remaining[0].id : null);
    }
  };

  const exportToCurl = (conversation: ConversationData) => {
    const { endpointSettings } = conversation;
    const headers = Object.entries(endpointSettings.headers)
      .map(([key, value]) => `-H "${key}: ${value}"`)
      .join(' ');
    
    const queryParams = Object.entries(endpointSettings.queryParams)
      .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
      .join('&');
    
    const url = queryParams ? `${endpointSettings.url}?${queryParams}` : endpointSettings.url;
    
    let curlCommand = `curl -X ${endpointSettings.method} "${url}"`;
    
    if (headers) {
      curlCommand += ` ${headers}`;
    }
    
    if (endpointSettings.method !== 'GET' && endpointSettings.body) {
      curlCommand += ` -d '${endpointSettings.body}'`;
    }
    
    return curlCommand;
  };

  const importFromCurl = (curlCommand: string) => {
    try {
      // Parse básico de cURL command
      const urlMatch = curlCommand.match(/curl\s+(?:-X\s+(\w+)\s+)?["']?([^"'\s]+)["']?/);
      const methodMatch = curlCommand.match(/-X\s+(\w+)/);
      const headerMatches = curlCommand.match(/-H\s+["']([^"']+)["']/g) || [];
      const dataMatch = curlCommand.match(/-d\s+['"]([^'"]+)['"]/);
      
      if (!urlMatch || !urlMatch[2]) {
        throw new Error('URL no encontrada en el comando cURL');
      }
      
      const url = urlMatch[2];
      const method = (methodMatch?.[1] || 'GET').toUpperCase() as EndpointSettings['method'];
      
      const headers: Record<string, string> = {};
      headerMatches.forEach(headerMatch => {
        const match = headerMatch.match(/-H\s+["']([^"']+)["']/);
        if (match && match[1]) {
          const [key, ...valueParts] = match[1].split(':');
          if (key && valueParts.length > 0) {
            headers[key.trim()] = valueParts.join(':').trim();
          }
        }
      });
      
      const body = dataMatch?.[1] || (method !== 'GET' ? '{}' : '');
      
      return {
        url,
        method,
        headers: Object.keys(headers).length > 0 ? headers : { 'Content-Type': 'application/json' },
        queryParams: {},
        body
      };
    } catch (error) {
      throw new Error('Error parsing cURL command: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  };

  const sendMessage = async (content: string, attachments?: ChatMessage['attachments']) => {
    if (!activeConversationData) return;

    // Validar entrada del usuario
    try {
      messageSchema.parse({ content, attachments });
    } catch (error) {
      console.error('Error de validación:', error);
      const errorMessage: ChatMessage = {
        id: Date.now().toString(),
        type: 'assistant',
        content: 'Error: El mensaje contiene datos inválidos.',
        timestamp: new Date(),
      };
      
      setConversations(prev => 
        prev.map(conv => 
          conv.id === activeConversation 
            ? { ...conv, messages: [...conv.messages, errorMessage] }
            : conv
        )
      );
      return;
    }

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content,
      timestamp: new Date(),
      attachments,
    };

    // Añadir mensaje del usuario
    setConversations(prev => 
      prev.map(conv => 
        conv.id === activeConversation 
          ? { ...conv, messages: [...conv.messages, userMessage] }
          : conv
      )
    );

    setIsLoading(true);

    try {
      // Llamada real al endpoint
      const response = await callRealEndpoint(activeConversationData.endpointSettings, content, attachments);
      
      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: response,
        timestamp: new Date(),
      };

      setConversations(prev => 
        prev.map(conv => 
          conv.id === activeConversation 
            ? { ...conv, messages: [...conv.messages, assistantMessage] }
            : conv
        )
      );
    } catch (error) {
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: `Error: ${error instanceof Error ? error.message : 'Error desconocido'}`,
        timestamp: new Date(),
      };

      setConversations(prev => 
        prev.map(conv => 
          conv.id === activeConversation 
            ? { ...conv, messages: [...conv.messages, errorMessage] }
            : conv
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-background relative">
      {/* Toggle button for left sidebar */}
      {!leftSidebarOpen && (
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setLeftSidebarOpen(true)}
          className="fixed top-4 left-4 z-50 bg-card/90 backdrop-blur-sm border border-border hover:bg-card shadow-lg"
        >
          <MessageSquare className="w-4 h-4" />
        </Button>
      )}

      {/* Left Sidebar - Conversations */}
      <div className={`transition-all duration-300 relative ${leftSidebarOpen ? 'w-80' : 'w-0'} overflow-hidden`}>
        {leftSidebarOpen && (
          <>
            <ConversationSidebar
              activeConversation={activeConversation}
              onSelectConversation={(id) => setActiveConversation(id)}
              onCreateConversation={createNewConversation}
              onRenameConversation={renameConversation}
              onUpdateDescription={updateConversationDescription}
              onDeleteConversation={deleteConversation}
              conversations={conversations.map(conv => ({
                id: conv.id,
                title: conv.title,
                description: conv.description,
                lastMessage: conv.messages[conv.messages.length - 1]?.content || 'Nueva conversación',
                timestamp: conv.messages[conv.messages.length - 1]?.timestamp || new Date(),
                unread: 0,
                type: 'webhook' as const,
                endpointSettings: conv.endpointSettings
              }))}
            />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setLeftSidebarOpen(false)}
              className="absolute top-4 right-2 z-10 bg-transparent hover:bg-sidebar-hover"
            >
              <ChevronLeft className="w-4 h-4 text-sidebar-text" />
            </Button>
          </>
        )}
      </div>

      {/* Chat Panel */}
      <div className="flex-1 flex flex-col">
        {activeConversationData ? (
          <ChatInterface
            messages={activeConversationData.messages}
            onSendMessage={sendMessage}
            isLoading={isLoading}
          />
        ) : (
          <div className="flex-1 flex items-center justify-center bg-chat-bg">
            <div className="text-center text-muted-foreground">
              <Bot className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <h2 className="text-xl font-semibold mb-2">Bienvenido al AI Agent Tester</h2>
              <p className="mb-4">Crea una nueva conversación para empezar</p>
              <Button onClick={createNewConversation} className="bg-primary hover:bg-primary/90">
                <Plus className="w-4 h-4 mr-2" />
                Crear Conversación
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Toggle button for right sidebar */}
      {!rightSidebarOpen && activeConversationData && (
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setRightSidebarOpen(true)}
          className="fixed top-4 right-4 z-50 bg-card/90 backdrop-blur-sm border border-border hover:bg-card shadow-lg"
        >
          <Settings className="w-4 h-4" />
        </Button>
      )}

      {/* Right Sidebar - Configuration */}
      {activeConversationData && (
        <div className={`transition-all duration-300 relative ${rightSidebarOpen ? 'w-80' : 'w-0'} overflow-hidden`}>
          {rightSidebarOpen && (
            <>
              <MembersPanel
                settings={activeConversationData.endpointSettings}
                onSettingsChange={updateConversationSettings}
                onExportCurl={() => exportToCurl(activeConversationData)}
                onImportCurl={importFromCurl}
              />
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setRightSidebarOpen(false)}
                className="absolute top-4 right-2 z-10 bg-transparent hover:bg-members-hover"
              >
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </Button>
            </>
          )}
        </div>
      )}
    </div>
  );
};

// Función para llamar al endpoint real
const callRealEndpoint = async (
  settings: EndpointSettings,
  message: string,
  attachments?: ChatMessage['attachments']
): Promise<string> => {
  if (!settings.url) {
    throw new Error('URL del endpoint no configurada');
  }

  // Validar URL
  try {
    new URL(settings.url);
  } catch (error) {
    throw new Error('URL del endpoint inválida');
  }

  // Preparar el body reemplazando placeholders
  let requestBody = settings.body;
  const timestamp = new Date().toISOString();
  
  // Reemplazar placeholders de forma segura
  requestBody = requestBody
    .replace(/\{\{message\}\}/g, JSON.stringify(message).slice(1, -1)) // Remove quotes from JSON.stringify
    .replace(/\{\{timestamp\}\}/g, timestamp)
    .replace(/\{\{attachments\}\}/g, JSON.stringify(attachments || []));

  // Construir URL con query params
  const url = new URL(settings.url);
  Object.entries(settings.queryParams).forEach(([key, value]) => {
    if (value) {
      url.searchParams.append(encodeURIComponent(key), encodeURIComponent(value));
    }
  });

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

  try {
    const response = await fetch(url.toString(), {
      method: settings.method,
      headers: {
        ...settings.headers,
        // Asegurar que el Content-Type esté presente para POST/PUT/PATCH
        ...(settings.method !== 'GET' && !settings.headers['Content-Type'] && {
          'Content-Type': 'application/json'
        })
      },
      body: settings.method !== 'GET' ? requestBody : undefined,
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText || response.statusText}`);
    }

    const responseData = await response.text();
    
    // Intentar parsear como JSON para extraer el mensaje de respuesta
    try {
      const jsonResponse = JSON.parse(responseData);
      
      // Para OpenAI API
      if (jsonResponse.choices && jsonResponse.choices[0]?.message?.content) {
        return jsonResponse.choices[0].message.content;
      }
      
      // Para Claude API
      if (jsonResponse.content && jsonResponse.content[0]?.text) {
        return jsonResponse.content[0].text;
      }
      
      // Para respuestas con campo 'message'
      if (jsonResponse.message) {
        return jsonResponse.message;
      }
      
      // Para respuestas con campo 'response'
      if (jsonResponse.response) {
        return jsonResponse.response;
      }
      
      // Retornar JSON formateado si no hay campo específico
      return JSON.stringify(jsonResponse, null, 2);
      
    } catch (parseError) {
      // Si no es JSON válido, retornar el texto tal como está
      return responseData;
    }

  } catch (error) {
    clearTimeout(timeoutId);
    
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        throw new Error('Timeout: El endpoint tardó demasiado en responder');
      }
      throw error;
    }
    
    throw new Error('Error desconocido al llamar al endpoint');
  }
};

export default ApiTester;