import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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

interface EditFabricModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  fabric: Fabric | null;
  onSuccess: () => void;
}

export function EditFabricModal({ open, onOpenChange, fabric, onSuccess }: EditFabricModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    color: "",
    weight: "",
    supplier: "",
    stock: 0,
    unit: "metros",
    minStock: 0,
    pricePerMeter: 0,
    lastPurchase: "",
    status: "disponivel" as "disponivel" | "baixo" | "esgotado",
  });
  const { toast } = useToast();

  useEffect(() => {
    if (fabric) {
      setFormData({
        name: fabric.name,
        color: fabric.color,
        weight: fabric.weight,
        supplier: fabric.supplier,
        stock: fabric.stock,
        unit: fabric.unit,
        minStock: fabric.minStock,
        pricePerMeter: fabric.pricePerMeter,
        lastPurchase: fabric.lastPurchase || "",
        status: fabric.status,
      });
    }
  }, [fabric]);

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!fabric) return;

    try {
      const { error } = await supabase
        .from('fabrics')
        .update({
          name: formData.name,
          color: formData.color,
          weight: formData.weight,
          supplier: formData.supplier,
          stock: formData.stock,
          unit: formData.unit,
          min_stock: formData.minStock,
          price_per_meter: formData.pricePerMeter,
          last_purchase: formData.lastPurchase || null,
          status: formData.status,
        })
        .eq('id', fabric.id);

      if (error) throw error;

      toast({
        title: "Sucesso!",
        description: "Tecido atualizado com sucesso.",
      });

      onOpenChange(false);
      onSuccess();
    } catch (error: any) {
      toast({
        title: "Erro ao atualizar tecido",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Tecido</DialogTitle>
          <DialogDescription>
            Atualize as informações do tecido
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome do Tecido</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Ex: Algodão Penteado"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="color">Cor</Label>
              <Input
                id="color"
                value={formData.color}
                onChange={(e) => handleInputChange('color', e.target.value)}
                placeholder="Ex: Azul Marinho"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="weight">Gramatura</Label>
              <Input
                id="weight"
                value={formData.weight}
                onChange={(e) => handleInputChange('weight', e.target.value)}
                placeholder="Ex: 180g/m²"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="supplier">Fornecedor</Label>
              <Input
                id="supplier"
                value={formData.supplier}
                onChange={(e) => handleInputChange('supplier', e.target.value)}
                placeholder="Ex: Textile Company"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="stock">Estoque Atual</Label>
              <Input
                id="stock"
                type="number"
                min="0"
                step="0.01"
                value={formData.stock}
                onChange={(e) => handleInputChange('stock', parseFloat(e.target.value) || 0)}
                placeholder="100"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="unit">Unidade</Label>
              <Select value={formData.unit} onValueChange={(value) => handleInputChange('unit', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="metros">Metros</SelectItem>
                  <SelectItem value="kg">Quilogramas</SelectItem>
                  <SelectItem value="rolos">Rolos</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="minStock">Estoque Mínimo</Label>
              <Input
                id="minStock"
                type="number"
                min="0"
                step="0.01"
                value={formData.minStock}
                onChange={(e) => handleInputChange('minStock', parseFloat(e.target.value) || 0)}
                placeholder="10"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="pricePerMeter">Preço por Metro (R$)</Label>
              <Input
                id="pricePerMeter"
                type="number"
                min="0"
                step="0.01"
                value={formData.pricePerMeter}
                onChange={(e) => handleInputChange('pricePerMeter', parseFloat(e.target.value) || 0)}
                placeholder="25.50"
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

          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="disponivel">Disponível</SelectItem>
                <SelectItem value="baixo">Estoque Baixo</SelectItem>
                <SelectItem value="esgotado">Esgotado</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" className="bg-gradient-primary text-primary-foreground">
              Atualizar Tecido
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}