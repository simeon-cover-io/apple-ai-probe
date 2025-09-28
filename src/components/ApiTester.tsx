import { useState } from 'react';
import { ConversationSidebar } from './ConversationSidebar';
import { ChatInterface } from './ChatInterface';
import { MembersPanel } from './MembersPanel';

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

const ApiTester = () => {
  const [activeConversation, setActiveConversation] = useState('1');
  const [endpointSettings, setEndpointSettings] = useState<EndpointSettings>({
    url: '',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    queryParams: {},
    body: '',
  });

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      type: 'assistant',
      content: '¡Hola! Soy tu agente de AI. Configura el endpoint en el panel derecho y envíame mensajes para probar la integración.',
      timestamp: new Date(),
    },
  ]);

  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = async (content: string, attachments?: ChatMessage['attachments']) => {
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content,
      timestamp: new Date(),
      attachments,
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      // Simulate API call - replace with actual endpoint call
      const response = await simulateApiCall(endpointSettings, content, attachments);
      
      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: response,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: `Error: ${error instanceof Error ? error.message : 'Error desconocido'}`,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-background">
      {/* Conversations Sidebar */}
      <ConversationSidebar
        activeConversation={activeConversation}
        onSelectConversation={setActiveConversation}
      />

      {/* Chat Panel */}
      <div className="flex-1 flex flex-col">
        <ChatInterface
          messages={messages}
          onSendMessage={sendMessage}
          isLoading={isLoading}
        />
      </div>

      {/* Members Panel */}
      <MembersPanel
        settings={endpointSettings}
        onSettingsChange={setEndpointSettings}
      />
    </div>
  );
};

// Simulate API call - replace with actual implementation
const simulateApiCall = async (
  settings: EndpointSettings,
  message: string,
  attachments?: ChatMessage['attachments']
): Promise<string> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));

  if (!settings.url) {
    throw new Error('URL del endpoint no configurada');
  }

  // Simulate different responses
  const responses = [
    'Perfecto, he recibido tu mensaje y procesado la información correctamente.',
    'Interesante punto. Déjame analizar esto más a fondo...',
    'Basándome en tu consulta, puedo sugerir las siguientes opciones.',
    'He procesado tu solicitud. ¿Te gustaría que profundice en algún aspecto específico?',
  ];

  if (attachments && attachments.length > 0) {
    return `He recibido tu mensaje junto con ${attachments.length} archivo(s). ${responses[Math.floor(Math.random() * responses.length)]}`;
  }

  return responses[Math.floor(Math.random() * responses.length)];
};

export default ApiTester;