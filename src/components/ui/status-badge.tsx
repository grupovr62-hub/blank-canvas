import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: string;
  variant?: "default" | "success" | "warning" | "destructive" | "secondary";
}

const statusMap: Record<string, { variant: StatusBadgeProps["variant"]; label: string }> = {
  // Produção
  piloto_tecido: { variant: "secondary", label: "Piloto e Tecido" },
  corte: { variant: "warning", label: "Corte" },
  faccao: { variant: "default", label: "Facção" },
  travete: { variant: "default", label: "Travete" },
  lavanderia: { variant: "default", label: "Lavanderia" },
  acabamento: { variant: "warning", label: "Acabamento" },
  fotos: { variant: "success", label: "Fotos" },
  concluido: { variant: "success", label: "Concluído" },
  
  // Estoque
  disponivel: { variant: "success", label: "Disponível" },
  baixo: { variant: "warning", label: "Estoque Baixo" },
  esgotado: { variant: "destructive", label: "Esgotado" },
  
  // Geral
  ativo: { variant: "success", label: "Ativo" },
  inativo: { variant: "secondary", label: "Inativo" },
  pendente: { variant: "warning", label: "Pendente" },
  cancelado: { variant: "destructive", label: "Cancelado" },
  atrasado: { variant: "destructive", label: "Atrasado" },
};

export function StatusBadge({ status, variant }: StatusBadgeProps) {
  const statusConfig = statusMap[status.toLowerCase()] || { 
    variant: variant || "default", 
    label: status 
  };

  return (
    <Badge 
      variant={statusConfig.variant}
      className={cn(
        "font-medium",
        statusConfig.variant === "success" && "bg-success text-success-foreground",
        statusConfig.variant === "warning" && "bg-warning text-warning-foreground",
      )}
    >
      {statusConfig.label}
    </Badge>
  );
}