import React, { useState, useEffect } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
} from '@dnd-kit/core';
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Package, Clock, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Task {
  id: string;
  title: string;
  model: string;
  quantity: number;
  dueDate: string;
  priority: 'baixa' | 'media' | 'alta' | 'urgente';
  status: 'piloto_tecido' | 'corte' | 'faccao' | 'travete' | 'lavanderia' | 'acabamento' | 'concluido';
}

interface Column {
  id: string;
  title: string;
  tasks: Task[];
  color: string;
}

// Draggable Task Component
function DraggableTask({ task, onStatusChange, getPriorityColor, isOverdue }: {
  task: Task;
  onStatusChange: (taskId: string, newStatus: string) => void;
  getPriorityColor: (priority: string) => string;
  isOverdue: (date: string) => boolean;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="cursor-grab active:cursor-grabbing"
    >
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold">{task.title}</h3>
          <Badge variant={getPriorityColor(task.priority) as any}>
            {task.priority}
          </Badge>
        </div>
        
        <p className="text-sm text-muted-foreground mb-2">{task.model}</p>
        
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Package className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">{task.quantity} peças</span>
          </div>
        </div>

        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className={isOverdue(task.dueDate) ? 'text-destructive' : ''}>
              {new Date(task.dueDate).toLocaleDateString('pt-BR')}
            </span>
          </div>
          {isOverdue(task.dueDate) && (
            <AlertCircle className="h-4 w-4 text-destructive" />
          )}
        </div>

        <div className="mt-3">
          <Select
            value={task.status}
            onValueChange={(newStatus) => onStatusChange(task.id, newStatus)}
          >
            <SelectTrigger className="h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="piloto_tecido">Piloto e Tecido</SelectItem>
              <SelectItem value="corte">Corte</SelectItem>
              <SelectItem value="faccao">Facção</SelectItem>
              <SelectItem value="travete">Travete</SelectItem>
              <SelectItem value="lavanderia">Lavanderia</SelectItem>
              <SelectItem value="acabamento">Acabamento</SelectItem>
              <SelectItem value="concluido">Concluído</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
}

const Kanban = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const { data, error } = await supabase
        .from('production_orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedTasks = data?.map(order => ({
        id: order.id,
        title: order.code,
        model: order.model,
        quantity: order.quantity,
        dueDate: order.deadline,
        priority: order.priority as Task["priority"],
        status: order.status as Task["status"]
      })) || [];

      setTasks(formattedTasks);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      toast.error('Erro ao carregar tarefas');
    } finally {
      setLoading(false);
    }
  };

  const columns: Column[] = [
    {
      id: 'piloto_tecido',
      title: 'Piloto e Tecido',
      tasks: tasks.filter(task => task.status === 'piloto_tecido'),
      color: 'bg-slate-100'
    },
    {
      id: 'corte',
      title: 'Corte',
      tasks: tasks.filter(task => task.status === 'corte'),
      color: 'bg-yellow-100'
    },
    {
      id: 'faccao',
      title: 'Facção',
      tasks: tasks.filter(task => task.status === 'faccao'),
      color: 'bg-purple-100'
    },
    {
      id: 'travete',
      title: 'Travete',
      tasks: tasks.filter(task => task.status === 'travete'),
      color: 'bg-pink-100'
    },
    {
      id: 'lavanderia',
      title: 'Lavanderia',
      tasks: tasks.filter(task => task.status === 'lavanderia'),
      color: 'bg-cyan-100'
    },
    {
      id: 'acabamento',
      title: 'Acabamento',
      tasks: tasks.filter(task => task.status === 'acabamento'),
      color: 'bg-orange-100'
    },
    {
      id: 'concluido',
      title: 'Concluído',
      tasks: tasks.filter(task => task.status === 'concluido'),
      color: 'bg-emerald-100'
    }
  ];

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 3,
        tolerance: 5,
      },
    })
  );

  const findTaskById = (id: string) => {
    return tasks.find(task => task.id === id) || null;
  };

  const moveTaskToColumn = async (taskId: string, newColumnId: string) => {
    try {
      const { error } = await supabase
        .from('production_orders')
        .update({ status: newColumnId })
        .eq('id', taskId);

      if (error) throw error;

      // Update local state
      setTasks(prevTasks => 
        prevTasks.map(task => 
          task.id === taskId 
            ? { ...task, status: newColumnId as Task['status'] }
            : task
        )
      );

      toast.success('Status atualizado com sucesso!');
    } catch (error) {
      console.error('Error updating task status:', error);
      toast.error('Erro ao atualizar status');
    }
  };

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const task = findTaskById(active.id as string);
    setActiveTask(task);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    if (activeId === overId) return;

    // Check if we're dragging over a column
    const overColumn = columns.find(col => col.id === overId);
    if (overColumn) {
      moveTaskToColumn(activeId, overColumn.id);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveTask(null);
  };

  const handleStatusChange = (taskId: string, newStatus: string) => {
    moveTaskToColumn(taskId, newStatus);
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
    return new Date(dueDate) < new Date();
  };

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Kanban de Produção</h1>
            <p className="text-muted-foreground">Arraste ou altere o status para mover as ordens</p>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-8">Carregando...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
            {columns.map((column) => (
              <div key={column.id} className="flex flex-col">
                <Card className="h-full">
                  <CardHeader className={`${column.color} rounded-t-lg`}>
                    <CardTitle className="flex items-center justify-between text-sm font-semibold">
                      <span>{column.title}</span>
                      <Badge variant="secondary">
                        {column.tasks.length}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 space-y-3 min-h-[500px]">
                    <SortableContext
                      items={column.tasks.map(task => task.id)}
                      strategy={verticalListSortingStrategy}
                    >
                      {column.tasks.map((task) => (
                        <DraggableTask
                          key={task.id}
                          task={task}
                          onStatusChange={handleStatusChange}
                          getPriorityColor={getPriorityColor}
                          isOverdue={isOverdue}
                        />
                      ))}
                    </SortableContext>
                    
                    {column.tasks.length === 0 && (
                      <div className="flex items-center justify-center h-32 border-2 border-dashed border-border rounded-lg">
                        <p className="text-muted-foreground text-sm">Arraste ordens aqui</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        )}
      </div>

      <DragOverlay>
        {activeTask ? (
          <Card className="w-80 shadow-lg rotate-3">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-foreground">{activeTask.title}</h3>
                <Badge variant={getPriorityColor(activeTask.priority) as any}>
                  {activeTask.priority}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">{activeTask.model}</p>
              <span className="text-xs bg-muted px-2 py-1 rounded">
                {activeTask.quantity} peças
              </span>
            </CardContent>
          </Card>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
};

export default Kanban;