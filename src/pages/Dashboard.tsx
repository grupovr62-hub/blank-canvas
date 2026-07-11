import { useState, useEffect } from "react";
import { 
  Package, 
  ClipboardList, 
  Scissors, 
  TrendingUp, 
  Clock, 
  CheckCircle,
  AlertTriangle,
  Calendar,
  Download,
  CalendarRange
} from "lucide-react";
import { MetricCard } from "@/components/ui/metric-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { StatusBadge } from "@/components/ui/status-badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import factoryHero from "@/assets/factory-hero.jpg";
import { supabase } from "@/integrations/supabase/client";
import { startOfDay, startOfWeek, startOfMonth, startOfYear, isAfter, isBefore, format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast";

export default function Dashboard() {
  const { toast } = useToast();
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [fabricStock, setFabricStock] = useState<any[]>([]);
  const [periodFilter, setPeriodFilter] = useState<string>("month");
  const [customStartDate, setCustomStartDate] = useState<Date | undefined>();
  const [customEndDate, setCustomEndDate] = useState<Date | undefined>();
  const [allOrdersData, setAllOrdersData] = useState<any[]>([]);
  const [metrics, setMetrics] = useState({
    activeOrders: 0,
    totalFabricStock: 0,
    todayPieces: 0,
    productivity: 0,
    overdueOrders: 0,
    completedOrders: 0,
    completedPieces: 0,
    lowStockFabrics: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  useEffect(() => {
    if (allOrdersData.length > 0) {
      calculateCompletedPieces(allOrdersData);
    }
  }, [periodFilter, allOrdersData, customStartDate, customEndDate]);

  const getStartOfPeriod = (period: string): Date => {
    const now = new Date();
    switch (period) {
      case "today":
        return startOfDay(now);
      case "week":
        return startOfWeek(now, { weekStartsOn: 1 });
      case "month":
        return startOfMonth(now);
      case "year":
        return startOfYear(now);
      case "custom":
        return customStartDate || startOfMonth(now);
      default:
        return startOfMonth(now);
    }
  };

  const getEndOfPeriod = (): Date | null => {
    if (periodFilter === "custom" && customEndDate) {
      return customEndDate;
    }
    return null;
  };

  const calculateCompletedPieces = (orders: any[]) => {
    const startDate = getStartOfPeriod(periodFilter);
    const endDate = getEndOfPeriod();
    
    const completedInPeriod = orders.filter(order => {
      if (order.status !== 'concluido') return false;
      const completedAt = order.completed_at ? new Date(order.completed_at) : new Date(order.updated_at);
      const afterStart = isAfter(completedAt, startDate);
      const beforeEnd = endDate ? isBefore(completedAt, endDate) || completedAt.getTime() === endDate.getTime() : true;
      return afterStart && beforeEnd;
    });
    const totalPieces = completedInPeriod.reduce((sum, order) => sum + order.quantity, 0);
    
    setMetrics(prev => ({
      ...prev,
      completedPieces: totalPieces
    }));
  };

  const getStatusLabel = (status: string) => {
    const labels: { [key: string]: string } = {
      'piloto_tecido': 'Piloto & Tecido',
      'corte': 'Corte',
      'faccao': 'Facção',
      'travete': 'Travete',
      'lavanderia': 'Lavanderia',
      'acabamento': 'Acabamento',
      'concluido': 'Concluído'
    };
    return labels[status] || status;
  };

  const exportReport = async () => {
    try {
      const { data: orders } = await supabase
        .from('production_orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (!orders || orders.length === 0) {
        toast({
          title: "Sem dados",
          description: "Não há ordens de produção para exportar.",
          variant: "destructive"
        });
        return;
      }

      const startDate = getStartOfPeriod(periodFilter);
      const endDate = getEndOfPeriod();
      
      const filteredOrders = orders.filter(order => {
        const orderDate = new Date(order.created_at);
        const afterStart = isAfter(orderDate, startDate);
        const beforeEnd = endDate ? isBefore(orderDate, endDate) || orderDate.getTime() === endDate.getTime() : true;
        return afterStart && beforeEnd;
      });

      if (filteredOrders.length === 0) {
        toast({
          title: "Sem dados no período",
          description: "Não há ordens de produção no período selecionado.",
          variant: "destructive"
        });
        return;
      }

      // Generate CSV
      const headers = ['Código', 'Modelo', 'Quantidade', 'Status', 'Prioridade', 'Tecido', 'Prazo', 'Facção Destino', 'Data Criação'];
      const csvRows = [headers.join(';')];
      
      filteredOrders.forEach(order => {
        const row = [
          order.code,
          order.model,
          order.quantity,
          getStatusLabel(order.status),
          order.priority === 'alta' ? 'Alta' : order.priority === 'media' ? 'Média' : 'Baixa',
          order.fabric_name || '-',
          format(new Date(order.deadline), 'dd/MM/yyyy'),
          order.destination_faction || '-',
          format(new Date(order.created_at), 'dd/MM/yyyy HH:mm')
        ];
        csvRows.push(row.join(';'));
      });

      const csvContent = csvRows.join('\n');
      const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      const periodLabel = periodFilter === 'custom' && customStartDate && customEndDate
        ? `${format(customStartDate, 'dd-MM-yyyy')}_a_${format(customEndDate, 'dd-MM-yyyy')}`
        : periodFilter;
      
      link.download = `relatorio_producao_${periodLabel}.csv`;
      link.click();
      URL.revokeObjectURL(url);

      toast({
        title: "Relatório exportado",
        description: `${filteredOrders.length} ordens exportadas com sucesso.`,
      });
    } catch (error) {
      console.error('Error exporting report:', error);
      toast({
        title: "Erro ao exportar",
        description: "Não foi possível exportar o relatório.",
        variant: "destructive"
      });
    }
  };

  const fetchDashboardData = async () => {
    try {
      // Fetch recent production orders
      const { data: orders } = await supabase
        .from('production_orders')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(4);

      // Fetch fabric stock
      const { data: fabrics } = await supabase
        .from('fabrics')
        .select('*')
        .order('name');

      // Calculate metrics
      const { data: allOrders } = await supabase
        .from('production_orders')
        .select('status, quantity, created_at, deadline, completed_at, updated_at');

      setAllOrdersData(allOrders || []);

      const activeOrders = allOrders?.filter(order => order.status !== 'concluido') || [];
      const completedOrders = allOrders?.filter(order => order.status === 'concluido') || [];
      const totalStock = fabrics?.reduce((sum, fabric) => sum + fabric.stock, 0) || 0;
      
      // Calculate pieces in production (from corte to acabamento, excluding concluido)
      const productionStages = ['corte', 'faccao', 'travete', 'lavanderia', 'acabamento'];
      const inProductionOrders = allOrders?.filter(order => productionStages.includes(order.status)) || [];
      const todayPieces = inProductionOrders.reduce((sum, order) => sum + order.quantity, 0);
      
      // Calculate productivity based on completed vs total orders
      const totalOrders = allOrders?.length || 1;
      const productivity = Math.round((completedOrders.length / totalOrders) * 100);

      // Calculate overdue orders (only active orders past deadline)
      const today = new Date();
      const overdueOrders = activeOrders.filter(order => {
        const deadline = new Date(order.deadline);
        return deadline < today;
      });

      // Calculate low stock fabrics
      const lowStockFabrics = fabrics?.filter(fabric => fabric.stock <= fabric.min_stock) || [];

      setRecentOrders(orders || []);
      setFabricStock(fabrics || []);
      setMetrics({
        activeOrders: activeOrders.length,
        totalFabricStock: totalStock,
        todayPieces,
        productivity,
        overdueOrders: overdueOrders.length,
        completedOrders: completedOrders.length,
        completedPieces: 0,
        lowStockFabrics: lowStockFabrics.length
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getOrderProgress = (status: string) => {
    const statusProgress: { [key: string]: number } = {
      'piloto_tecido': 10,
      'corte': 25,
      'faccao': 40,
      'travete': 55,
      'lavanderia': 70,
      'acabamento': 85,
      'concluido': 100
    };
    return statusProgress[status] || 0;
  };

  const getFabricStatus = (fabric: any) => {
    if (fabric.stock === 0) return 'esgotado';
    if (fabric.stock <= fabric.min_stock) return 'baixo';
    return 'disponivel';
  };

  return (
    <div className="space-y-6">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-lg">
        <img 
          src={factoryHero} 
          alt="Fábrica de Jeans" 
          className="w-full h-48 object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-primary/90 to-primary/60 flex items-center">
          <div className="p-8 text-primary-foreground">
            <h1 className="text-3xl font-bold mb-2">Sistema de Produção JeansPro</h1>
            <p className="text-primary-foreground/90 text-lg">
              Controle total da sua produção de jeans
            </p>
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Ordens Ativas"
          value={loading ? "..." : metrics.activeOrders.toString()}
          subtitle="Em produção"
          icon={ClipboardList}
          trend={{ value: "+12%", type: "increase" }}
          variant="accent"
        />
        <MetricCard
          title="Tecidos em Estoque"
          value={loading ? "..." : `${metrics.totalFabricStock}`}
          subtitle="metros"
          icon={Package}
          trend={{ value: "-5%", type: "decrease" }}
        />
        <MetricCard
          title="Peças em Produção"
          value={loading ? "..." : metrics.todayPieces.toString()}
          subtitle="do corte ao acabamento"
          icon={Scissors}
          trend={{ value: "+8%", type: "increase" }}
          variant="success"
        />
        <MetricCard
          title="Produtividade"
          value={loading ? "..." : `${metrics.productivity}%`}
          subtitle="meta: 85%"
          icon={TrendingUp}
          trend={{ value: "+2%", type: "increase" }}
          variant="success"
        />
      </div>

      {/* Completed Pieces Card with Period Filter */}
      <Card className="shadow-card">
        <CardHeader className="flex flex-row items-center justify-between flex-wrap gap-4">
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-success" />
            Peças Concluídas
          </CardTitle>
          <div className="flex items-center gap-2 flex-wrap">
            <Select value={periodFilter} onValueChange={setPeriodFilter}>
              <SelectTrigger className="w-[160px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="today">Hoje</SelectItem>
                <SelectItem value="week">Esta semana</SelectItem>
                <SelectItem value="month">Este mês</SelectItem>
                <SelectItem value="year">Este ano</SelectItem>
                <SelectItem value="custom">Personalizado</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm" onClick={exportReport}>
              <Download className="w-4 h-4 mr-2" />
              Exportar
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {periodFilter === "custom" && (
            <div className="flex flex-wrap gap-4 mb-4 pb-4 border-b border-border">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">De:</span>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" size="sm" className="w-[140px] justify-start">
                      <CalendarRange className="w-4 h-4 mr-2" />
                      {customStartDate ? format(customStartDate, 'dd/MM/yyyy') : 'Início'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <CalendarComponent
                      mode="single"
                      selected={customStartDate}
                      onSelect={setCustomStartDate}
                      locale={ptBR}
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Até:</span>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" size="sm" className="w-[140px] justify-start">
                      <CalendarRange className="w-4 h-4 mr-2" />
                      {customEndDate ? format(customEndDate, 'dd/MM/yyyy') : 'Fim'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <CalendarComponent
                      mode="single"
                      selected={customEndDate}
                      onSelect={setCustomEndDate}
                      locale={ptBR}
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          )}
          <div className="text-4xl font-bold text-success">
            {loading ? "..." : metrics.completedPieces.toLocaleString('pt-BR')}
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            peças finalizadas no período
          </p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ClipboardList className="w-5 h-5 text-primary" />
              Ordens de Produção Recentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {loading ? (
                <div className="text-center py-4">
                  <p className="text-muted-foreground">Carregando ordens...</p>
                </div>
              ) : recentOrders.length === 0 ? (
                <div className="text-center py-4">
                  <p className="text-muted-foreground">Nenhuma ordem encontrada</p>
                </div>
              ) : (
                recentOrders.map((order) => {
                  const progress = getOrderProgress(order.status);
                  return (
                    <div key={order.id} className="flex items-center justify-between p-3 border border-border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="font-semibold text-foreground">{order.code}</span>
                          <StatusBadge status={order.status} />
                        </div>
                        <p className="text-sm text-muted-foreground">{order.model}</p>
                        <div className="mt-2">
                          <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                            <span>Progresso</span>
                            <span>{progress}%</span>
                          </div>
                          <Progress value={progress} className="h-2" />
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </CardContent>
        </Card>

        {/* Fabric Stock */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="w-5 h-5 text-primary" />
              Estoque de Tecidos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {loading ? (
                <div className="text-center py-4">
                  <p className="text-muted-foreground">Carregando tecidos...</p>
                </div>
              ) : fabricStock.length === 0 ? (
                <div className="text-center py-4">
                  <p className="text-muted-foreground">Nenhum tecido encontrado</p>
                </div>
              ) : (
                fabricStock.map((fabric) => {
                  const status = getFabricStatus(fabric);
                  return (
                    <div key={fabric.id} className="flex items-center justify-between p-3 border border-border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium text-foreground">{fabric.name}</span>
                          <StatusBadge status={status} />
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {fabric.stock} {fabric.unit}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" />
            Próximas Ações
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3 p-3 border border-warning/20 bg-warning/5 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-warning" />
              <div>
                <p className="font-medium text-foreground">{metrics.lowStockFabrics} tecidos com estoque baixo</p>
                <p className="text-xs text-muted-foreground">Verificar necessidade de compra</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 border border-primary/20 bg-primary/5 rounded-lg">
              <Clock className="w-5 h-5 text-primary" />
              <div>
                <p className="font-medium text-foreground">{metrics.overdueOrders} ordens em atraso</p>
                <p className="text-xs text-muted-foreground">Revisar cronograma</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 border border-success/20 bg-success/5 rounded-lg">
              <CheckCircle className="w-5 h-5 text-success" />
              <div>
                <p className="font-medium text-foreground">{metrics.completedOrders} ordens concluídas</p>
                <p className="text-xs text-muted-foreground">Prontas para estoque</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}