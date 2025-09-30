import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Users, Settings, Plus, X, Code, Database, Download, Upload, Copy } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { EndpointSettings } from './ApiTester';

interface MembersPanelProps {
  settings: EndpointSettings;
  onSettingsChange: (settings: EndpointSettings) => void;
  onExportCurl: () => string;
  onImportCurl: (curlCommand: string) => EndpointSettings;
}

export const MembersPanel = ({ settings, onSettingsChange, onExportCurl, onImportCurl }: MembersPanelProps) => {
  const [newHeaderKey, setNewHeaderKey] = useState('');
  const [newHeaderValue, setNewHeaderValue] = useState('');
  const [newParamKey, setNewParamKey] = useState('');
  const [newParamValue, setNewParamValue] = useState('');
  const [curlCommand, setCurlCommand] = useState('');
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const { toast } = useToast();

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

  const handleExportCurl = async () => {
    try {
      const curl = onExportCurl();
      await navigator.clipboard.writeText(curl);
      toast({
        title: "cURL exportado",
        description: "El comando cURL se ha copiado al portapapeles",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo copiar el comando cURL",
        variant: "destructive",
      });
    }
  };

  const handleImportCurl = () => {
    try {
      const newSettings = onImportCurl(curlCommand);
      onSettingsChange(newSettings);
      setCurlCommand('');
      setIsImportDialogOpen(false);
      toast({
        title: "cURL importado",
        description: "La configuración se ha actualizado desde el comando cURL",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Error al importar cURL",
        variant: "destructive",
      });
    }
  };

  const members = [
    { id: '1', name: 'AI Agent', status: 'online', role: 'Bot' },
    { id: '2', name: 'Webhook Handler', status: 'idle', role: 'Service' },
  ];

  return (
    <div className="w-[480px] bg-members-bg border-l border-border flex flex-col h-full">
      <Tabs defaultValue="members" className="flex-1 flex flex-col">
        <div className="border-b border-border">
          <TabsList className="w-full grid grid-cols-2 rounded-none bg-transparent h-12">
            <TabsTrigger 
              value="members" 
              className="data-[state=active]:bg-sidebar-active data-[state=active]:text-sidebar-text-active"
            >
              <Users className="w-4 h-4 mr-1" />
              Miembros
            </TabsTrigger>
            <TabsTrigger 
              value="config" 
              className="data-[state=active]:bg-sidebar-active data-[state=active]:text-sidebar-text-active"
            >
              <Settings className="w-4 h-4 mr-1" />
              Config
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="members" className="flex-1 mt-0">
          <ScrollArea className="h-full">
            <div className="p-4 space-y-4">
              <div>
                <h3 className="text-sm font-medium text-foreground mb-3">Conectados - {members.length}</h3>
                <div className="space-y-2">
                  {members.map((member) => (
                    <div key={member.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-members-hover transition-colors">
                      <div className={`w-2 h-2 rounded-full ${
                        member.status === 'online' ? 'bg-green-500' : 'bg-yellow-500'
                      }`} />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-foreground">{member.name}</p>
                        <p className="text-xs text-muted-foreground">{member.role}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="config" className="flex-1 mt-0">
          <ScrollArea className="h-full">
            <div className="p-4 space-y-6">
              {/* Basic Configuration */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-foreground flex items-center gap-2">
                    <Database className="w-4 h-4 text-primary" />
                    Endpoint Configuration
                  </h3>
                  <div className="flex gap-2">
                    <Button
                      onClick={handleExportCurl}
                      size="sm"
                      variant="outline"
                      className="text-xs"
                    >
                      <Download className="w-3 h-3 mr-1" />
                      Export cURL
                    </Button>
                    <Dialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
                      <DialogTrigger asChild>
                        <Button size="sm" variant="outline" className="text-xs">
                          <Upload className="w-3 h-3 mr-1" />
                          Import cURL
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Importar comando cURL</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="curl-input">Comando cURL</Label>
                            <Textarea
                              id="curl-input"
                              placeholder="curl -X POST https://api.ejemplo.com/endpoint -H &quot;Content-Type: application/json&quot; -d &quot;{message: test}&quot;"
                              value={curlCommand}
                              onChange={(e) => setCurlCommand(e.target.value)}
                              className="min-h-[100px] font-mono text-xs"
                            />
                          </div>
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              onClick={() => {
                                setCurlCommand('');
                                setIsImportDialogOpen(false);
                              }}
                            >
                              Cancelar
                            </Button>
                            <Button onClick={handleImportCurl} disabled={!curlCommand.trim()}>
                              Importar
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="space-y-2">
                    <Label htmlFor="url" className="text-xs text-muted-foreground">
                      URL del Endpoint
                    </Label>
                    <Input
                      id="url"
                      placeholder="https://api.ejemplo.com/webhook"
                      value={settings.url}
                      onChange={(e) => updateSettings({ url: e.target.value })}
                      className="bg-input border-border focus:border-primary text-sm"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="method" className="text-xs text-muted-foreground">
                      Método HTTP
                    </Label>
                    <Select
                      value={settings.method}
                      onValueChange={(value: EndpointSettings['method']) => 
                        updateSettings({ method: value })
                      }
                    >
                      <SelectTrigger className="bg-input border-border text-sm">
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
              </div>

              <Separator />

              {/* Headers */}
              <div className="space-y-3">
                <h4 className="text-xs font-medium text-foreground">Headers</h4>
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Key"
                      value={newHeaderKey}
                      onChange={(e) => setNewHeaderKey(e.target.value)}
                      className="bg-input border-border text-xs"
                    />
                    <Input
                      placeholder="Value"
                      value={newHeaderValue}
                      onChange={(e) => setNewHeaderValue(e.target.value)}
                      className="bg-input border-border text-xs"
                    />
                    <Button onClick={addHeader} size="sm" className="bg-primary hover:bg-primary/90">
                      <Plus className="w-3 h-3" />
                    </Button>
                  </div>

                  <div className="space-y-1 max-h-32 overflow-y-auto">
                    {Object.entries(settings.headers).map(([key, value]) => (
                      <div key={key} className="flex items-center justify-between p-2 bg-sidebar-bg rounded border border-border">
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-foreground truncate">{key}</p>
                          <p className="text-xs text-muted-foreground truncate">{value}</p>
                        </div>
                        <Button
                          onClick={() => removeHeader(key)}
                          size="sm"
                          variant="ghost"
                          className="text-destructive hover:text-destructive h-6 w-6 p-0"
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <Separator />

              {/* Query Params */}
              <div className="space-y-3">
                <h4 className="text-xs font-medium text-foreground">Query Parameters</h4>
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Param"
                      value={newParamKey}
                      onChange={(e) => setNewParamKey(e.target.value)}
                      className="bg-input border-border text-xs"
                    />
                    <Input
                      placeholder="Value"
                      value={newParamValue}
                      onChange={(e) => setNewParamValue(e.target.value)}
                      className="bg-input border-border text-xs"
                    />
                    <Button onClick={addQueryParam} size="sm" className="bg-primary hover:bg-primary/90">
                      <Plus className="w-3 h-3" />
                    </Button>
                  </div>

                  <div className="space-y-1 max-h-32 overflow-y-auto">
                    {Object.entries(settings.queryParams).map(([key, value]) => (
                      <div key={key} className="flex items-center justify-between p-2 bg-sidebar-bg rounded border border-border">
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-foreground truncate">{key}</p>
                          <p className="text-xs text-muted-foreground truncate">{value}</p>
                        </div>
                        <Button
                          onClick={() => removeQueryParam(key)}
                          size="sm"
                          variant="ghost"
                          className="text-destructive hover:text-destructive h-6 w-6 p-0"
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <Separator />

              {/* Body */}
              <div className="space-y-3">
                <h4 className="text-xs font-medium text-foreground">Request Body</h4>
                <Textarea
                  placeholder='{"message": "texto del usuario", "attachments": []}'
                  value={settings.body}
                  onChange={(e) => updateSettings({ body: e.target.value })}
                  className="bg-input border-border focus:border-primary font-mono text-xs min-h-[80px] resize-none"
                />
              </div>

              {/* URL Preview */}
              {settings.url && (
                <>
                  <Separator />
                  <div className="space-y-2">
                    <h4 className="text-xs font-medium text-foreground flex items-center gap-2">
                      <Code className="w-3 h-3 text-primary" />
                      URL Preview
                    </h4>
                    <div className="p-2 bg-sidebar-bg rounded border border-border">
                      <code className="text-xs text-muted-foreground break-all block">
                        {settings.url}
                        {Object.keys(settings.queryParams).length > 0 && 
                          '?' + Object.entries(settings.queryParams)
                            .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
                            .join('&')
                        }
                      </code>
                    </div>
                  </div>
                </>
              )}
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
};