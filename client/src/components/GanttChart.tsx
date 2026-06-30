import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import {
  ChevronLeft, ChevronRight, Plus, Calendar, User, Clock, GripVertical, Loader2
} from "lucide-react";

interface GanttTask {
  id: string;
  name: string;
  startDate: Date;
  endDate: Date;
  progress: number;
  assignee: string;
  priority: 'low' | 'medium' | 'high';
  status: 'not-started' | 'in-progress' | 'completed' | 'blocked';
}

interface GanttChartProps {
  tasks: GanttTask[];
  onTaskUpdate?: (task: GanttTask) => void;
  onTaskCreate?: () => void;
}

const STATUS_COLORS: Record<string, string> = {
  'not-started': 'bg-gray-300',
  'in-progress': 'bg-blue-500',
  'completed': 'bg-green-500',
  'blocked': 'bg-red-500',
};

export default function GanttChart({ tasks: initialTasks, onTaskUpdate, onTaskCreate }: GanttChartProps) {
  const { toast } = useToast();
  const [tasks, setTasks] = useState<GanttTask[]>(initialTasks);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newTask, setNewTask] = useState({ name: "", assignee: "", startDate: "", endDate: "", priority: "medium" as string });
  const [adding, setAdding] = useState(false);

  function handleDragStart(index: number) {
    setDraggedIndex(index);
  }

  function handleDragOver(e: React.DragEvent, index: number) {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;
    const newTasks = [...tasks];
    const draggedTask = newTasks[draggedIndex];
    newTasks.splice(draggedIndex, 1);
    newTasks.splice(index, 0, draggedTask);
    setTasks(newTasks);
    setDraggedIndex(index);
  }

  function handleDragEnd() {
    setDraggedIndex(null);
    toast({ title: "Tasks reordered" });
  }

  function toggleStatus(taskId: string) {
    setTasks(prev => prev.map(t => {
      if (t.id !== taskId) return t;
      const nextStatus = t.status === 'completed' ? 'not-started' : t.status === 'not-started' ? 'in-progress' : 'completed';
      return { ...t, status: nextStatus, progress: nextStatus === 'completed' ? 100 : nextStatus === 'in-progress' ? 50 : 0 };
    }));
  }

  async function handleAddTask() {
    if (!newTask.name.trim()) return;
    setAdding(true);
    const task: GanttTask = {
      id: `task-${Date.now()}`,
      name: newTask.name,
      assignee: newTask.assignee || "Unassigned",
      startDate: newTask.startDate ? new Date(newTask.startDate) : new Date(),
      endDate: newTask.endDate ? new Date(newTask.endDate) : new Date(Date.now() + 7 * 86400000),
      progress: 0,
      priority: newTask.priority as any,
      status: 'not-started',
    };
    setTasks(prev => [...prev, task]);
    toast({ title: "Task added!" });
    setShowAddDialog(false);
    setNewTask({ name: "", assignee: "", startDate: "", endDate: "", priority: "medium" });
    setAdding(false);
  }

  // Simple timeline calculation
  const allDates = tasks.flatMap(t => [new Date(t.startDate).getTime(), new Date(t.endDate).getTime()]);
  const minDate = allDates.length > 0 ? new Date(Math.min(...allDates)) : new Date();
  const maxDate = allDates.length > 0 ? new Date(Math.max(...allDates)) : new Date(Date.now() + 30 * 86400000);
  const totalDays = Math.max(1, Math.ceil((maxDate.getTime() - minDate.getTime()) / 86400000));

  function getPosition(task: GanttTask) {
    const start = new Date(task.startDate).getTime();
    const end = new Date(task.endDate).getTime();
    const left = ((start - minDate.getTime()) / (maxDate.getTime() - minDate.getTime())) * 100;
    const width = Math.max(2, ((end - start) / (maxDate.getTime() - minDate.getTime())) * 100);
    return { left: `${left}%`, width: `${width}%` };
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2"><Calendar className="w-5 h-5" /> Project Timeline</CardTitle>
        <Button size="sm" onClick={() => setShowAddDialog(true)}>
          <Plus className="w-4 h-4 mr-2" /> Add Task
        </Button>
      </CardHeader>
      <CardContent>
        {/* Timeline Header */}
        <div className="flex border-b mb-2">
          <div className="w-48 p-2 font-medium text-sm">Task</div>
          <div className="flex-1 p-2 text-sm text-muted-foreground">
            {minDate.toLocaleDateString()} — {maxDate.toLocaleDateString()} ({totalDays} days)
          </div>
        </div>

        {/* Tasks with drag-to-reorder */}
        <div className="space-y-1">
          {tasks.map((task, index) => {
            const pos = getPosition(task);
            return (
              <div key={task.id}
                draggable
                onDragStart={() => handleDragStart(index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDragEnd={handleDragEnd}
                className={`flex items-center border rounded-lg p-2 cursor-grab active:cursor-grabbing hover:bg-muted/50 transition-colors ${draggedIndex === index ? "opacity-50" : ""}`}
              >
                <GripVertical className="w-4 h-4 text-muted-foreground mr-2 flex-shrink-0" />
                <div className="w-48 flex-shrink-0">
                  <p className="font-medium text-sm truncate">{task.name}</p>
                  <p className="text-xs text-muted-foreground">{task.assignee}</p>
                </div>
                <div className="flex-1 relative h-8">
                  <div className="absolute inset-y-0 left-0 right-0 flex items-center">
                    <div
                      className={`h-6 rounded ${STATUS_COLORS[task.status]} relative cursor-pointer`}
                      style={{ left: pos.left, width: pos.width }}
                      onClick={() => toggleStatus(task.id)}
                    >
                      <div className="h-full bg-white/30 rounded" style={{ width: `${task.progress}%` }} />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-[10px] font-medium text-white">{task.progress}%</span>
                      </div>
                    </div>
                  </div>
                </div>
                <Badge variant="outline" className="ml-2 text-[10px]">{task.status.replace('-', ' ')}</Badge>
              </div>
            );
          })}
        </div>

        {tasks.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <Calendar className="w-12 h-12 mx-auto mb-4" />
            <p>No tasks yet. Click "Add Task" to start.</p>
          </div>
        )}

        {/* Legend */}
        <div className="flex flex-wrap gap-4 mt-4 pt-4 border-t">
          {Object.entries(STATUS_COLORS).map(([status, color]) => (
            <div key={status} className="flex items-center gap-2">
              <div className={`w-3 h-3 ${color} rounded`} />
              <span className="text-xs capitalize">{status.replace('-', ' ')}</span>
            </div>
          ))}
        </div>
      </CardContent>

      {/* Add Task Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add Task</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Task Name *</Label>
              <Input placeholder="e.g. Principal Photography" value={newTask.name} onChange={(e) => setNewTask({ ...newTask, name: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Assignee</Label>
              <Input placeholder="e.g. John Doe" value={newTask.assignee} onChange={(e) => setNewTask({ ...newTask, assignee: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Start Date</Label>
                <Input type="date" value={newTask.startDate} onChange={(e) => setNewTask({ ...newTask, startDate: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>End Date</Label>
                <Input type="date" value={newTask.endDate} onChange={(e) => setNewTask({ ...newTask, endDate: e.target.value })} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Priority</Label>
              <Select value={newTask.priority} onValueChange={(v) => setNewTask({ ...newTask, priority: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleAddTask} className="w-full" disabled={adding || !newTask.name.trim()}>
              {adding ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Plus className="w-4 h-4 mr-2" />}
              Add Task
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
