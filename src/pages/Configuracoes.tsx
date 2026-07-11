import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Settings, User, Bell, Palette, Shield, Save } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

export default function Configuracoes() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  // Company settings
  const [companySettings, setCompanySettings] = useState({
    name: "JeansPro Confecções",
    email: "contato@jeanspro.com",
    phone: "(11) 9999-9999",
    address: "Rua das Confecções, 123",
    cnpj: "12.345.678/0001-99"
  });

  // Production settings
  const [productionSettings, setProductionSettings] = useState({
    defaultProductionDays: 15,
    autoAssignFabrics: true,
    sendEmailNotifications: true,
    showProgressPercentage: true
  });

  const handleSave = async () => {
    setLoading(true);
    try {
      // Simulate save operation
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Configurações salvas",
        description: "Suas configurações foram atualizadas com sucesso.",
      });
    } catch (error) {
      toast({
        title: "Erro ao salvar",
        description: "Ocorreu um erro ao salvar as configurações.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Settings className="w-6 h-6 text-primary" />
        <h1 className="text-2xl font-bold text-foreground">Configurações</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Company Information */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5 text-primary" />
              Informações da Empresa
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="company-name">Nome da Empresa</Label>
              <Input
                id="company-name"
                value={companySettings.name}
                onChange={(e) => setCompanySettings(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="company-email">Email</Label>
              <Input
                id="company-email"
                type="email"
                value={companySettings.email}
                onChange={(e) => setCompanySettings(prev => ({ ...prev, email: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="company-phone">Telefone</Label>
              <Input
                id="company-phone"
                value={companySettings.phone}
                onChange={(e) => setCompanySettings(prev => ({ ...prev, phone: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="company-address">Endereço</Label>
              <Input
                id="company-address"
                value={companySettings.address}
                onChange={(e) => setCompanySettings(prev => ({ ...prev, address: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="company-cnpj">CNPJ</Label>
              <Input
                id="company-cnpj"
                value={companySettings.cnpj}
                onChange={(e) => setCompanySettings(prev => ({ ...prev, cnpj: e.target.value }))}
              />
            </div>
          </CardContent>
        </Card>

        {/* Production Settings */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5 text-primary" />
              Configurações de Produção
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="production-days">Prazo Padrão de Produção (dias)</Label>
              <Input
                id="production-days"
                type="number"
                min="1"
                value={productionSettings.defaultProductionDays}
                onChange={(e) => setProductionSettings(prev => ({ 
                  ...prev, 
                  defaultProductionDays: parseInt(e.target.value) || 15 
                }))}
              />
            </div>
            
            <Separator />
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Auto-atribuir Tecidos</Label>
                  <p className="text-sm text-muted-foreground">
                    Atribuir automaticamente tecidos disponíveis às ordens
                  </p>
                </div>
                <Switch
                  checked={productionSettings.autoAssignFabrics}
                  onCheckedChange={(checked) => 
                    setProductionSettings(prev => ({ ...prev, autoAssignFabrics: checked }))
                  }
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Notificações por Email</Label>
                  <p className="text-sm text-muted-foreground">
                    Enviar emails sobre atualizações de status
                  </p>
                </div>
                <Switch
                  checked={productionSettings.sendEmailNotifications}
                  onCheckedChange={(checked) => 
                    setProductionSettings(prev => ({ ...prev, sendEmailNotifications: checked }))
                  }
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Mostrar Percentual de Progresso</Label>
                  <p className="text-sm text-muted-foreground">
                    Exibir progresso visual nas ordens
                  </p>
                </div>
                <Switch
                  checked={productionSettings.showProgressPercentage}
                  onCheckedChange={(checked) => 
                    setProductionSettings(prev => ({ ...prev, showProgressPercentage: checked }))
                  }
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* User Account */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" />
              Conta do Usuário
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Email</Label>
              <Input value={user?.email || ""} disabled />
            </div>
            <div>
              <Label>ID do Usuário</Label>
              <Input value={user?.id || ""} disabled className="font-mono text-xs" />
            </div>
            <div>
              <Label>Criado em</Label>
              <Input 
                value={user?.created_at ? new Date(user.created_at).toLocaleString('pt-BR') : ""} 
                disabled 
              />
            </div>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-primary" />
              Notificações
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Ordens Atrasadas</Label>
                <p className="text-sm text-muted-foreground">
                  Alertas sobre ordens com atraso
                </p>
              </div>
              <Switch defaultChecked />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Estoque Baixo</Label>
                <p className="text-sm text-muted-foreground">
                  Notificações de tecidos com estoque baixo
                </p>
              </div>
              <Switch defaultChecked />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Ordens Concluídas</Label>
                <p className="text-sm text-muted-foreground">
                  Alertas quando ordens são finalizadas
                </p>
              </div>
              <Switch defaultChecked />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button 
          onClick={handleSave} 
          disabled={loading}
          className="flex items-center gap-2"
        >
          <Save className="w-4 h-4" />
          {loading ? "Salvando..." : "Salvar Configurações"}
        </Button>
      </div>
    </div>
  );
}