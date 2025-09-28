import { useState } from 'react';
import { ConversationSidebar } from './ConversationSidebar';
import { ChatInterface } from './ChatInterface';
import { MembersPanel } from './MembersPanel';
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

const ApiTester = () => {
  const [activeConversation, setActiveConversation] = useState('1');
  const [conversations, setConversations] = useState<ConversationData[]>([
    {
      id: '1',
      title: 'ChatGPT-4 API',
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
      },
      messages: [
        {
          id: '1',
          type: 'assistant',
          content: '¡Hola! Soy ChatGPT-4. Esta conversación está configurada para llamar a la API de OpenAI. Solo cambia tu API key en la configuración y estaré listo para responder.',
          timestamp: new Date(),
        },
      ]
    },
    {
      id: '2',
      title: 'Claude API',
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
      },
      messages: [
        {
          id: '1',
          type: 'assistant',
          content: '¡Hola! Soy Claude. Esta conversación está preconfigurada para Anthropic API. Agrega tu API key y podremos chatear.',
          timestamp: new Date(),
        },
      ]
    },
    {
      id: '3',
      title: 'Webhook Personalizado',
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
      },
      messages: [
        {
          id: '1',
          type: 'assistant',
          content: '¡Configuración de webhook lista! Solo cambia la URL por tu endpoint real y comenzaremos a enviar tus mensajes.',
          timestamp: new Date(),
        },
      ]
    }
  ]);
  
  const [isLoading, setIsLoading] = useState(false);

  const activeConversationData = conversations.find(c => c.id === activeConversation);

  const createNewConversation = () => {
    const newId = (conversations.length + 1).toString();
    const newConversation: ConversationData = {
      id: newId,
      title: `Nueva Conversación ${newId}`,
      endpointSettings: {
        url: '',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        queryParams: {},
        body: JSON.stringify({
          message: "{{message}}",
          timestamp: "{{timestamp}}"
        }, null, 2),
      },
      messages: [
        {
          id: '1',
          type: 'assistant',
          content: '¡Nueva conversación creada! Configura tu endpoint en el panel derecho.',
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
    <div className="flex h-screen bg-background">
      {/* Conversations Sidebar */}
      <ConversationSidebar
        activeConversation={activeConversation}
        onSelectConversation={setActiveConversation}
        onCreateConversation={createNewConversation}
      />

      {/* Chat Panel */}
      <div className="flex-1 flex flex-col">
        <ChatInterface
          messages={activeConversationData?.messages || []}
          onSendMessage={sendMessage}
          isLoading={isLoading}
        />
      </div>

      {/* Members Panel */}
      <MembersPanel
        settings={activeConversationData?.endpointSettings || {
          url: '',
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          queryParams: {},
          body: ''
        }}
        onSettingsChange={updateConversationSettings}
      />
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