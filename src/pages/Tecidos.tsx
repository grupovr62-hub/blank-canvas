import { useState, useEffect } from "react";
import { Plus, Search, Filter, Package, AlertTriangle, TrendingDown, TrendingUp, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/ui/status-badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { FabricModal } from "@/components/FabricModal";
import { EditFabricModal } from "@/components/EditFabricModal";
import { PurchaseFabricModal } from "@/components/PurchaseFabricModal";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Fabric {
  id: string;
  name: string;
  color: string;
  weight: string;
  supplier: string;
  stock: number;
  unit: string;
  minStock: number;
  pricePerMeter: number;
  lastPurchase: string;
  status: "disponivel" | "baixo" | "esgotado";
}

export default function Tecidos() {
  const [searchTerm, setSearchTerm] = useState("");
  const [fabrics, setFabrics] = useState<Fabric[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);
  const [selectedFabric, setSelectedFabric] = useState<Fabric | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const loadFabrics = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('fabrics')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        toast({
          title: "Erro ao carregar tecidos",
          description: error.message,
          variant: "destructive",
        });
      } else {
        const mappedFabrics: Fabric[] = data.map(fabric => ({
          id: fabric.id,
          name: fabric.name,
          color: fabric.color,
          weight: fabric.weight,
          supplier: fabric.supplier,
          stock: fabric.stock,
          unit: fabric.unit,
          minStock: fabric.min_stock,
          pricePerMeter: fabric.price_per_meter,
          lastPurchase: fabric.last_purchase,
          status: fabric.status as "disponivel" | "baixo" | "esgotado"
        }));
        setFabrics(mappedFabrics);
      }
    } catch (error) {
      toast({
        title: "Erro inesperado",
        description: "Falha ao carregar os tecidos.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (fabric: Fabric) => {
    try {
      const { error } = await supabase
        .from('fabrics')
        .delete()
        .eq('id', fabric.id);

      if (error) throw error;

      toast({
        title: "Tecido excluído",
        description: `${fabric.name} foi removido do estoque.`,
      });

      loadFabrics();
    } catch (error: any) {
      toast({
        title: "Erro ao excluir tecido",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    loadFabrics();
  }, []);

  const filteredFabrics = fabrics.filter(fabric =>
    fabric.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    fabric.color.toLowerCase().includes(searchTerm.toLowerCase()) ||
    fabric.supplier.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalValue = fabrics.reduce((sum, fabric) => sum + (fabric.stock * fabric.pricePerMeter), 0);
  const lowStock = fabrics.filter(f => f.status === "baixo").length;
  const outOfStock = fabrics.filter(f => f.status === "esgotado").length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Gestão de Tecidos</h1>
          <p className="text-muted-foreground">Controle seu estoque de matéria-prima</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Filter className="w-4 h-4 mr-2" />
            Filtros
          </Button>
          <Button 
            className="bg-gradient-primary text-primary-foreground"
            onClick={() => setIsModalOpen(true)}
          >
            <Plus className="w-4 h-4 mr-2" />
            Novo Tecido
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="shadow-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total em Estoque</p>
                <p className="text-2xl font-bold">R$ {totalValue.toLocaleString('pt-BR')}</p>
              </div>
              <Package className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Tipos de Tecido</p>
                <p className="text-2xl font-bold">{fabrics.length}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-success" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card border-warning/20 bg-warning/5">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Estoque Baixo</p>
                <p className="text-2xl font-bold text-warning">{lowStock}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-warning" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card border-destructive/20 bg-destructive/5">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Esgotados</p>
                <p className="text-2xl font-bold text-destructive">{outOfStock}</p>
              </div>
              <TrendingDown className="w-8 h-8 text-destructive" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Buscar tecidos por nome, cor ou fornecedor..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Table */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>Lista de Tecidos</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-[100px]">Código</TableHead>
                <TableHead className="min-w-[120px]">Nome</TableHead>
                <TableHead className="min-w-[100px]">Cor</TableHead>
                <TableHead className="min-w-[100px] hidden md:table-cell">Gramatura</TableHead>
                <TableHead className="min-w-[120px] hidden lg:table-cell">Fornecedor</TableHead>
                <TableHead className="min-w-[100px]">Estoque</TableHead>
                <TableHead className="min-w-[100px] hidden md:table-cell">Valor/Metro</TableHead>
                <TableHead className="min-w-[100px]">Status</TableHead>
                <TableHead className="min-w-[120px]">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredFabrics.map((fabric) => (
                <TableRow key={fabric.id}>
                  <TableCell className="font-medium text-xs">{fabric.id.slice(0, 8)}...</TableCell>
                  <TableCell className="font-medium">{fabric.name}</TableCell>
                  <TableCell>{fabric.color}</TableCell>
                  <TableCell className="hidden md:table-cell">{fabric.weight}</TableCell>
                  <TableCell className="hidden lg:table-cell">{fabric.supplier}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className={fabric.stock <= fabric.minStock ? "text-warning font-medium" : ""}>
                        {fabric.stock} {fabric.unit}
                      </span>
                      {fabric.stock <= fabric.minStock && fabric.stock > 0 && (
                        <AlertTriangle className="w-4 h-4 text-warning" />
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">R$ {fabric.pricePerMeter.toFixed(2)}</TableCell>
                  <TableCell>
                    <StatusBadge status={fabric.status} />
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col sm:flex-row gap-1 sm:gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="text-xs px-2"
                        onClick={() => {
                          setSelectedFabric(fabric);
                          setIsEditModalOpen(true);
                        }}
                      >
                        Editar
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="text-xs px-2"
                        onClick={() => {
                          setSelectedFabric(fabric);
                          setIsPurchaseModalOpen(true);
                        }}
                      >
                        Comprar
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="text-xs px-2 text-destructive hover:text-destructive"
                        onClick={() => handleDelete(fabric)}
                      >
                        <Trash2 className="w-3 h-3 mr-1" />
                        Excluir
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      <FabricModal 
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        onSuccess={loadFabrics}
      />
      
      <EditFabricModal 
        open={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
        fabric={selectedFabric}
        onSuccess={loadFabrics}
      />
      
      <PurchaseFabricModal 
        open={isPurchaseModalOpen}
        onOpenChange={setIsPurchaseModalOpen}
        fabric={selectedFabric}
        onSuccess={loadFabrics}
      />
    </div>
  );
}