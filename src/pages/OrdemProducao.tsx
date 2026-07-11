import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Search, Plus, Edit, Trash2, Calendar, User, Target } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface OrdemProducao {
  id: string;
  code: string;
  model: string;
  description: string;
  quantity: number;
  fabric_name: string;
  deadline: string;
  priority: 'baixa' | 'media' | 'alta' | 'urgente';
  status: 'piloto_tecido' | 'corte' | 'faccao' | 'travete' | 'lavanderia' | 'acabamento' | 'fotos' | 'concluido';
  destination_faction: string;
  observations: string;
}

const OrdemProducaoPage = () => {
  const [ordens, setOrdens] = useState<OrdemProducao[]>([]);
  const [fabrics, setFabrics] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingOrdem, setEditingOrdem] = useState<OrdemProducao | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrdens();
    fetchFabrics();
  }, []);

  const fetchOrdens = async () => {
    try {
      const { data, error } = await supabase
        .from('production_orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedOrdens = data?.map(order => ({
        id: order.id,
        code: order.code,
        model: order.model,
        description: order.description || '',
        quantity: order.quantity,
        fabric_name: order.fabric_name || '',
        deadline: order.deadline,
        priority: order.priority as OrdemProducao["priority"],
        status: order.status as OrdemProducao["status"],
        destination_faction: order.destination_faction || '',
        observations: order.observations || ''
      })) || [];

      setOrdens(formattedOrdens);
    } catch (error) {
      console.error('Error fetching production orders:', error);
      toast.error('Erro ao carregar ordens de produção');
    } finally {
      setLoading(false);
    }
  };

  const fetchFabrics = async () => {
    try {
      const { data, error } = await supabase
        .from('fabrics')
        .select('*')
        .order('name');

      if (error) throw error;
      setFabrics(data || []);
    } catch (error) {
      console.error('Error fetching fabrics:', error);
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    
    const form = event.currentTarget;
    const formData = new FormData(form);
    
    const orderData = {
      code: formData.get("codigo") as string,
      model: formData.get("modelo") as string,
      description: formData.get("descricao") as string,
      quantity: parseInt(formData.get("quantidade") as string),
      fabric_name: formData.get("tecido") as string,
      deadline: formData.get("prazo") as string,
      priority: formData.get("prioridade") as OrdemProducao["priority"],
      destination_faction: formData.get("faccaoDestino") as string,
      observations: formData.get("observacoes") as string
    };

    try {
      if (editingOrdem) {
        const { error } = await supabase
          .from('production_orders')
          .update(orderData)
          .eq('id', editingOrdem.id);

        if (error) throw error;
        toast.success("Ordem de produção atualizada com sucesso!");
      } else {
        const { error } = await supabase
          .from('production_orders')
          .insert([orderData]);

        if (error) throw error;
        toast.success("Ordem de produção criada com sucesso!");
      }

      setIsDialogOpen(false);
      setEditingOrdem(null);
      fetchOrdens();
    } catch (error) {
      console.error('Error saving production order:', error);
      toast.error("Erro ao salvar ordem de produção");
    }
  };

  const handleEdit = (ordem: OrdemProducao) => {
    setEditingOrdem(ordem);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('production_orders')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      toast.success("Ordem de produção excluída com sucesso!");
      fetchOrdens();
    } catch (error) {
      console.error('Error deleting production order:', error);
      toast.error("Erro ao excluir ordem de produção");
    }
  };

  const filteredOrdens = ordens.filter(ordem =>
    ordem.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ordem.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ordem.destination_faction.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getPriorityColor = (priority: OrdemProducao["priority"]) => {
    const priorityColors = {
      baixa: "secondary",
      media: "default",
      alta: "warning",
      urgente: "destructive"
    };
    return priorityColors[priority];
  };

  const getStatusLabel = (status: OrdemProducao["status"]) => {
    const statusLabels = {
      piloto_tecido: "Piloto e Tecido",
      corte: "Corte",
      faccao: "Facção",
      travete: "Travete",
      lavanderia: "Lavanderia",
      acabamento: "Acabamento",
      fotos: "Fotos",
      concluido: "Concluído"
    };
    return statusLabels[status];
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Ordens de Produção</h1>
          <p className="text-muted-foreground">Gerencie e acompanhe todas as ordens de produção</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              className="bg-gradient-primary text-primary-foreground"
              onClick={() => setEditingOrdem(null)}
            >
              <Plus className="w-4 h-4 mr-2" />
              Nova Ordem
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingOrdem ? "Editar Ordem de Produção" : "Nova Ordem de Produção"}
              </DialogTitle>
              <DialogDescription>
                Preencha os dados para {editingOrdem ? "atualizar" : "criar"} uma ordem de produção
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="codigo">Código da OP</Label>
                  <Input
                    id="codigo"
                    name="codigo"
                    placeholder="OP001"
                    defaultValue={editingOrdem?.code || ""}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="modelo">Modelo</Label>
                  <Input
                    id="modelo"
                    name="modelo"
                    placeholder="Camisa Polo Básica"
                    defaultValue={editingOrdem?.model || ""}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="descricao">Descrição</Label>
                <Textarea
                  id="descricao"
                  name="descricao"
                  placeholder="Descrição detalhada do produto..."
                  defaultValue={editingOrdem?.description || ""}
                  className="min-h-[80px]"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="quantidade">Quantidade</Label>
                  <Input
                    id="quantidade"
                    name="quantidade"
                    type="number"
                    placeholder="50"
                    defaultValue={editingOrdem?.quantity || ""}
                    required
                    min="1"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="tecido">Tecido</Label>
                  <Select name="tecido" defaultValue={editingOrdem?.fabric_name || ""}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tecido" />
                    </SelectTrigger>
                    <SelectContent>
                      {fabrics.map((fabric) => (
                        <SelectItem key={fabric.id} value={fabric.name}>
                          {fabric.name} - {fabric.color}
                        </SelectItem>
                      ))}
                      <SelectItem value="outro">Outro tecido</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="prazo">Prazo de Entrega</Label>
                  <Input
                    id="prazo"
                    name="prazo"
                    type="date"
                    defaultValue={editingOrdem?.deadline || ""}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="prioridade">Prioridade</Label>
                  <Select name="prioridade" defaultValue={editingOrdem?.priority || "media"}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a prioridade" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="baixa">Baixa</SelectItem>
                      <SelectItem value="media">Média</SelectItem>
                      <SelectItem value="alta">Alta</SelectItem>
                      <SelectItem value="urgente">Urgente</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="faccaoDestino">Facção de Destino</Label>
                <Input
                  id="faccaoDestino"
                  name="faccaoDestino"
                  placeholder="Nome da facção"
                  defaultValue={editingOrdem?.destination_faction || ""}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="observacoes">Observações</Label>
                <Textarea
                  id="observacoes"
                  name="observacoes"
                  placeholder="Observações especiais..."
                  defaultValue={editingOrdem?.observations || ""}
                  className="min-h-[80px]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" className="bg-gradient-primary text-primary-foreground">
                  {editingOrdem ? "Atualizar" : "Criar"} Ordem
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Buscar por código, modelo ou facção..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="grid gap-4">
        {loading ? (
          <div className="text-center py-8">Carregando...</div>
        ) : filteredOrdens.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            {searchTerm ? "Nenhuma ordem encontrada" : "Nenhuma ordem de produção cadastrada"}
          </div>
        ) : (
          filteredOrdens.map((ordem) => (
            <Card key={ordem.id} className="p-4">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{ordem.code}</CardTitle>
                  <div className="flex gap-2">
                    <Badge variant={getPriorityColor(ordem.priority) as any}>
                      {ordem.priority.toUpperCase()}
                    </Badge>
                    <Badge variant="outline">
                      {getStatusLabel(ordem.status)}
                    </Badge>
                  </div>
                </div>
                <CardDescription>{ordem.model}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Target className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">Quantidade:</span>
                      <span>{ordem.quantity} unidades</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Tecido:</span>
                      <span>{ordem.fabric_name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">Prazo:</span>
                      <span>{new Date(ordem.deadline).toLocaleDateString('pt-BR')}</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">Facção:</span>
                      <span>{ordem.destination_faction || "Não definido"}</span>
                    </div>
                    {ordem.description && (
                      <div>
                        <span className="font-medium">Descrição:</span>
                        <p className="text-muted-foreground mt-1">{ordem.description}</p>
                      </div>
                    )}
                    {ordem.observations && (
                      <div>
                        <span className="font-medium">Observações:</span>
                        <p className="text-muted-foreground mt-1">{ordem.observations}</p>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex gap-2 pt-2">
                  <Button variant="outline" size="sm" onClick={() => handleEdit(ordem)}>
                    <Edit className="h-4 w-4 mr-2" />
                    Editar
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleDelete(ordem.id)}>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Excluir
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default OrdemProducaoPage;