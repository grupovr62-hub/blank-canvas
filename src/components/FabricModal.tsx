import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface FabricModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function FabricModal({ open, onOpenChange, onSuccess }: FabricModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    color: "",
    weight: "",
    supplier: "",
    stock: "",
    minStock: "",
    pricePerMeter: "",
    lastPurchase: "",
  });
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const fabricData = {
        name: formData.name,
        color: formData.color,
        weight: formData.weight,
        supplier: formData.supplier,
        stock: parseInt(formData.stock) || 0,
        min_stock: parseInt(formData.minStock) || 0,
        price_per_meter: parseFloat(formData.pricePerMeter) || 0,
        last_purchase: formData.lastPurchase || null,
        status: parseInt(formData.stock) <= parseInt(formData.minStock) 
          ? parseInt(formData.stock) === 0 ? 'esgotado' : 'baixo'
          : 'disponivel'
      };

      const { error } = await supabase
        .from('fabrics')
        .insert(fabricData);

      if (error) {
        toast({
          title: "Erro ao criar tecido",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Tecido criado com sucesso!",
          description: "O tecido foi adicionado ao estoque.",
        });
        
        // Reset form
        setFormData({
          name: "",
          color: "",
          weight: "",
          supplier: "",
          stock: "",
          minStock: "",
          pricePerMeter: "",
          lastPurchase: "",
        });
        
        onSuccess();
        onOpenChange(false);
      }
    } catch (error) {
      toast({
        title: "Erro inesperado",
        description: "Algo deu errado. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Novo Tecido</DialogTitle>
          <DialogDescription>
            Adicione um novo tecido ao estoque
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome*</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Ex: Denim Clássico"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="color">Cor*</Label>
              <Input
                id="color"
                value={formData.color}
                onChange={(e) => handleInputChange('color', e.target.value)}
                placeholder="Ex: Azul Índigo"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="weight">Gramatura*</Label>
              <Input
                id="weight"
                value={formData.weight}
                onChange={(e) => handleInputChange('weight', e.target.value)}
                placeholder="Ex: 14oz"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="supplier">Fornecedor*</Label>
              <Input
                id="supplier"
                value={formData.supplier}
                onChange={(e) => handleInputChange('supplier', e.target.value)}
                placeholder="Ex: Têxtil São Paulo"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="stock">Estoque (metros)*</Label>
              <Input
                id="stock"
                type="number"
                value={formData.stock}
                onChange={(e) => handleInputChange('stock', e.target.value)}
                placeholder="250"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="minStock">Estoque Mínimo*</Label>
              <Input
                id="minStock"
                type="number"
                value={formData.minStock}
                onChange={(e) => handleInputChange('minStock', e.target.value)}
                placeholder="100"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="pricePerMeter">Preço por Metro (R$)*</Label>
              <Input
                id="pricePerMeter"
                type="number"
                step="0.01"
                value={formData.pricePerMeter}
                onChange={(e) => handleInputChange('pricePerMeter', e.target.value)}
                placeholder="18.50"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastPurchase">Última Compra</Label>
              <Input
                id="lastPurchase"
                type="date"
                value={formData.lastPurchase}
                onChange={(e) => handleInputChange('lastPurchase', e.target.value)}
              />
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="bg-gradient-primary text-primary-foreground"
              disabled={isLoading}
            >
              {isLoading ? "Criando..." : "Criar Tecido"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}