import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Fabric {
  id: string;
  name: string;
  color: string;
  stock: number;
  unit: string;
  pricePerMeter: number;
}

interface PurchaseFabricModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  fabric: Fabric | null;
  onSuccess: () => void;
}

export function PurchaseFabricModal({ open, onOpenChange, fabric, onSuccess }: PurchaseFabricModalProps) {
  const [quantity, setQuantity] = useState(0);
  const [unitPrice, setUnitPrice] = useState(0);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!fabric || quantity <= 0) return;

    try {
      const newStock = fabric.stock + quantity;
      const newPricePerMeter = unitPrice > 0 ? unitPrice : fabric.pricePerMeter;
      
      // Determina o status baseado no estoque
      let status = "disponivel";
      const { data: fabricData } = await supabase
        .from('fabrics')
        .select('min_stock')
        .eq('id', fabric.id)
        .single();
      
      if (fabricData) {
        if (newStock <= fabricData.min_stock) {
          status = "baixo";
        }
      }

      const { error } = await supabase
        .from('fabrics')
        .update({
          stock: newStock,
          price_per_meter: newPricePerMeter,
          last_purchase: new Date().toISOString().split('T')[0],
          status: status,
        })
        .eq('id', fabric.id);

      if (error) throw error;

      toast({
        title: "Compra registrada!",
        description: `${quantity} ${fabric.unit} de ${fabric.name} adicionados ao estoque.`,
      });

      onOpenChange(false);
      setQuantity(0);
      setUnitPrice(0);
      onSuccess();
    } catch (error: any) {
      toast({
        title: "Erro ao registrar compra",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const totalCost = quantity * (unitPrice > 0 ? unitPrice : fabric?.pricePerMeter || 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Registrar Compra de Tecido</DialogTitle>
          <DialogDescription>
            {fabric && `${fabric.name} - ${fabric.color}`}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="quantity">
              Quantidade ({fabric?.unit || "metros"})
            </Label>
            <Input
              id="quantity"
              type="number"
              min="0"
              step="0.01"
              value={quantity}
              onChange={(e) => setQuantity(parseFloat(e.target.value) || 0)}
              placeholder="0"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="unitPrice">
              Preço por {fabric?.unit || "metro"} (R$)
            </Label>
            <Input
              id="unitPrice"
              type="number"
              min="0"
              step="0.01"
              value={unitPrice}
              onChange={(e) => setUnitPrice(parseFloat(e.target.value) || 0)}
              placeholder={fabric?.pricePerMeter.toFixed(2) || "0.00"}
            />
            <p className="text-sm text-muted-foreground">
              Deixe em branco para manter o preço atual (R$ {fabric?.pricePerMeter.toFixed(2)})
            </p>
          </div>

          {quantity > 0 && (
            <div className="bg-muted p-3 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="font-medium">Total da compra:</span>
                <span className="text-lg font-bold">
                  R$ {totalCost.toFixed(2)}
                </span>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Estoque atual: {fabric?.stock} {fabric?.unit} → {fabric ? fabric.stock + quantity : 0} {fabric?.unit}
              </p>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button 
              type="submit" 
              className="bg-gradient-primary text-primary-foreground"
              disabled={quantity <= 0}
            >
              Registrar Compra
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}