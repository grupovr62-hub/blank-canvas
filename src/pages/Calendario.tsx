import React, { useState, useEffect } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Package, AlertTriangle, CheckCircle2 } from "lucide-react";
import { format, isSameDay, addDays, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface CalendarTask {
  id: string;
  title: string;
  model: string;
  quantity: number;
  dueDate: string;
  status: 'piloto_tecido' | 'corte' | 'faccao' | 'lavanderia' | 'acabamento' | 'fotos' | 'concluido';
  priority: 'baixa' | 'media' | 'alta' | 'urgente';
}

const Calendario = () => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [tasks, setTasks] = useState<CalendarTask[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const { data, error } = await supabase
        .from('production_orders')
        .select('*')
        .order('deadline', { ascending: true });

      if (error) throw error;

      const formattedTasks = data?.map(order => ({
        id: order.id,
        title: order.code,
        model: order.model,
        quantity: order.quantity,
        dueDate: order.deadline,
        status: order.status as CalendarTask["status"],
        priority: order.priority as CalendarTask["priority"]
      })) || [];

      setTasks(formattedTasks);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      toast.error('Erro ao carregar tarefas');
    } finally {
      setLoading(false);
    }
  };

  const getTasksForDate = (date: Date) => {
    return tasks.filter(task => 
      isSameDay(parseISO(task.dueDate), date)
    );
  };

  const getTasksWithDates = () => {
    return tasks.map(task => parseISO(task.dueDate));
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgente': return 'destructive';
      case 'alta': return 'warning';
      case 'media': return 'default';
      case 'baixa': return 'secondary';
      default: return 'secondary';
    }
  };

  const isOverdue = (dueDate: string) => {
    return parseISO(dueDate) < new Date() && parseISO(dueDate).toDateString() !== new Date().toDateString();
  };

  const selectedDateTasks = selectedDate ? getTasksForDate(selectedDate) : [];
  const upcomingTasks = tasks
    .filter(task => parseISO(task.dueDate) >= new Date())
    .sort((a, b) => parseISO(a.dueDate).getTime() - parseISO(b.dueDate).getTime())
    .slice(0, 5);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Calendário de Produção</h1>
          <p className="text-muted-foreground">Visualize prazos e entregas programadas</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Calendário de Produção</CardTitle>
            <CardDescription>
              Clique em uma data para ver as entregas programadas
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">Carregando...</div>
            ) : (
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                locale={ptBR}
                className="rounded-md border"
                modifiers={{
                  hasTask: getTasksWithDates()
                }}
                modifiersStyles={{
                  hasTask: {
                    backgroundColor: '#dbeafe',
                    color: '#1e40af',
                    fontWeight: 'bold'
                  }
                }}
              />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              {selectedDate ? format(selectedDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR }) : 'Selecione uma data'}
            </CardTitle>
            <CardDescription>
              Entregas programadas para esta data
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {selectedDateTasks.length === 0 ? (
              <div className="text-center py-8">
                <Package className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                <p className="text-muted-foreground">Nenhuma entrega programada</p>
              </div>
            ) : (
              selectedDateTasks.map((task) => (
                <Card key={task.id} className="border">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold">{task.title}</h3>
                      <div className="flex items-center gap-2">
                        <Badge variant={getPriorityColor(task.priority) as any}>
                          {task.priority}
                        </Badge>
                        {isOverdue(task.dueDate) && (
                          <AlertTriangle className="h-4 w-4 text-destructive" />
                        )}
                      </div>
                    </div>
                    
                    <p className="text-sm text-muted-foreground mb-2">{task.model}</p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Package className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{task.quantity} peças</span>
                      </div>
                      <Badge variant="outline">
                        {task.status === 'piloto_tecido' ? 'Piloto e Tecido' :
                         task.status === 'corte' ? 'Corte' :
                         task.status === 'faccao' ? 'Facção' :
                         task.status === 'lavanderia' ? 'Lavanderia' :
                         task.status === 'acabamento' ? 'Acabamento' :
                         task.status === 'fotos' ? 'Fotos' :
                         task.status === 'concluido' ? 'Concluído' : task.status}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5" />
            Próximas Entregas
          </CardTitle>
          <CardDescription>
            Entregas programadas para os próximos dias
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {upcomingTasks.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">
                Nenhuma entrega programada
              </p>
            ) : (
              upcomingTasks.map((task) => (
                <div key={task.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                  <div>
                    <h4 className="font-semibold">{task.title} - {task.model}</h4>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Package className="h-4 w-4" />
                      <span>{task.quantity} peças</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={getPriorityColor(task.priority) as any}>
                      {task.priority}
                    </Badge>
                    <span className="text-sm font-medium">
                      {format(parseISO(task.dueDate), "dd/MM/yyyy")}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Calendario;