import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Plus, X, Settings, Code, Database } from 'lucide-react';
import type { EndpointSettings } from './ApiTester';

interface EndpointConfigProps {
  settings: EndpointSettings;
  onSettingsChange: (settings: EndpointSettings) => void;
}

export const EndpointConfig = ({ settings, onSettingsChange }: EndpointConfigProps) => {
  const [newHeaderKey, setNewHeaderKey] = useState('');
  const [newHeaderValue, setNewHeaderValue] = useState('');
  const [newParamKey, setNewParamKey] = useState('');
  const [newParamValue, setNewParamValue] = useState('');

  const updateSettings = (updates: Partial<EndpointSettings>) => {
    onSettingsChange({ ...settings, ...updates });
  };

  const addHeader = () => {
    if (newHeaderKey && newHeaderValue) {
      updateSettings({
        headers: { ...settings.headers, [newHeaderKey]: newHeaderValue }
      });
      setNewHeaderKey('');
      setNewHeaderValue('');
    }
  };

  const removeHeader = (key: string) => {
    const { [key]: removed, ...rest } = settings.headers;
    updateSettings({ headers: rest });
  };

  const addQueryParam = () => {
    if (newParamKey && newParamValue) {
      updateSettings({
        queryParams: { ...settings.queryParams, [newParamKey]: newParamValue }
      });
      setNewParamKey('');
      setNewParamValue('');
    }
  };

  const removeQueryParam = (key: string) => {
    const { [key]: removed, ...rest } = settings.queryParams;
    updateSettings({ queryParams: rest });
  };

  return (
    <div className="h-full flex flex-col">
      <CardHeader className="border-b border-border bg-apple-gray-1">
        <CardTitle className="flex items-center gap-2 text-apple-gray-5">
          <Settings className="w-5 h-5 text-primary" />
          Configuración del Endpoint
        </CardTitle>
      </CardHeader>

      <CardContent className="flex-1 overflow-auto p-6 space-y-6">
        {/* Basic Configuration */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="url" className="text-sm font-medium text-apple-gray-5">
              URL del Endpoint
            </Label>
            <Input
              id="url"
              placeholder="https://api.ejemplo.com/webhook"
              value={settings.url}
              onChange={(e) => updateSettings({ url: e.target.value })}
              className="bg-chat-input border-apple-gray-3 focus:border-primary focus:ring-1 focus:ring-primary"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="method" className="text-sm font-medium text-apple-gray-5">
              Método HTTP
            </Label>
            <Select
              value={settings.method}
              onValueChange={(value: EndpointSettings['method']) => 
                updateSettings({ method: value })
              }
            >
              <SelectTrigger className="bg-chat-input border-apple-gray-3">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="GET">GET</SelectItem>
                <SelectItem value="POST">POST</SelectItem>
                <SelectItem value="PUT">PUT</SelectItem>
                <SelectItem value="DELETE">DELETE</SelectItem>
                <SelectItem value="PATCH">PATCH</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Tabs defaultValue="headers" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3 bg-apple-gray-2">
            <TabsTrigger value="headers" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              Headers
            </TabsTrigger>
            <TabsTrigger value="params" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              Query Params
            </TabsTrigger>
            <TabsTrigger value="body" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              Body
            </TabsTrigger>
          </TabsList>

          <TabsContent value="headers" className="space-y-4">
            <div className="space-y-3">
              <div className="flex gap-2">
                <Input
                  placeholder="Clave"
                  value={newHeaderKey}
                  onChange={(e) => setNewHeaderKey(e.target.value)}
                  className="bg-chat-input border-apple-gray-3"
                />
                <Input
                  placeholder="Valor"
                  value={newHeaderValue}
                  onChange={(e) => setNewHeaderValue(e.target.value)}
                  className="bg-chat-input border-apple-gray-3"
                />
                <Button
                  onClick={addHeader}
                  size="sm"
                  className="bg-primary hover:bg-primary/90 shadow-apple"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>

              <div className="space-y-2 max-h-48 overflow-y-auto">
                {Object.entries(settings.headers).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between p-3 bg-apple-gray-1 rounded-lg border border-apple-gray-3">
                    <div className="flex-1 space-y-1">
                      <Badge variant="outline" className="text-xs">
                        {key}
                      </Badge>
                      <p className="text-sm text-apple-gray-4 break-all">
                        {value}
                      </p>
                    </div>
                    <Button
                      onClick={() => removeHeader(key)}
                      size="sm"
                      variant="ghost"
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="params" className="space-y-4">
            <div className="space-y-3">
              <div className="flex gap-2">
                <Input
                  placeholder="Parámetro"
                  value={newParamKey}
                  onChange={(e) => setNewParamKey(e.target.value)}
                  className="bg-chat-input border-apple-gray-3"
                />
                <Input
                  placeholder="Valor"
                  value={newParamValue}
                  onChange={(e) => setNewParamValue(e.target.value)}
                  className="bg-chat-input border-apple-gray-3"
                />
                <Button
                  onClick={addQueryParam}
                  size="sm"
                  className="bg-primary hover:bg-primary/90 shadow-apple"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>

              <div className="space-y-2 max-h-48 overflow-y-auto">
                {Object.entries(settings.queryParams).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between p-3 bg-apple-gray-1 rounded-lg border border-apple-gray-3">
                    <div className="flex-1 space-y-1">
                      <Badge variant="outline" className="text-xs">
                        {key}
                      </Badge>
                      <p className="text-sm text-apple-gray-4 break-all">
                        {value}
                      </p>
                    </div>
                    <Button
                      onClick={() => removeQueryParam(key)}
                      size="sm"
                      variant="ghost"
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="body" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="body" className="text-sm font-medium text-apple-gray-5">
                Request Body (JSON)
              </Label>
              <Textarea
                id="body"
                placeholder='{\n  "message": "texto del usuario",\n  "attachments": []\n}'
                value={settings.body}
                onChange={(e) => updateSettings({ body: e.target.value })}
                className="bg-chat-input border-apple-gray-3 focus:border-primary focus:ring-1 focus:ring-primary font-mono text-sm min-h-[200px]"
              />
            </div>
          </TabsContent>
        </Tabs>

        {/* URL Preview */}
        {settings.url && (
          <Card className="bg-apple-gray-1 border-apple-gray-3">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2 text-apple-gray-5">
                <Code className="w-4 h-4 text-primary" />
                Vista previa de la URL
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <code className="text-xs text-apple-gray-4 break-all bg-apple-gray-2 p-2 rounded block">
                {settings.url}
                {Object.keys(settings.queryParams).length > 0 && 
                  '?' + Object.entries(settings.queryParams)
                    .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
                    .join('&')
                }
              </code>
            </CardContent>
          </Card>
        )}
      </CardContent>
    </div>
  );
};