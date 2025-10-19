import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Calendar, 
  User, 
  Clock,
  AlertTriangle
} from "lucide-react";

interface GanttTask {
  id: string;
  name: string;
  startDate: Date;
  endDate: Date;
  progress: number;
  assignee: string;
  assigneeAvatar?: string;
  dependencies?: string[];
  priority: 'low' | 'medium' | 'high';
  status: 'not-started' | 'in-progress' | 'completed' | 'blocked';
}

interface GanttChartProps {
  tasks: GanttTask[];
  onTaskUpdate?: (task: GanttTask) => void;
  onTaskCreate?: () => void;
}

export default function GanttChart({ tasks, onTaskUpdate, onTaskCreate }: GanttChartProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'week' | 'month'>('week');

  // Generate timeline dates
  const generateTimelineDates = () => {
    const dates = [];
    const startDate = new Date(currentDate);
    
    if (viewMode === 'week') {
      startDate.setDate(startDate.getDate() - startDate.getDay());
      for (let i = 0; i < 7; i++) {
        const date = new Date(startDate);
        date.setDate(startDate.getDate() + i);
        dates.push(date);
      }
    } else {
      // Month view - show weeks
      startDate.setDate(1);
      for (let i = 0; i < 4; i++) {
        const weekStart = new Date(startDate);
        weekStart.setDate(startDate.getDate() + (i * 7));
        dates.push(weekStart);
      }
    }
    
    return dates;
  };

  // Calculate task position and width
  const calculateTaskPosition = (task: GanttTask) => {
    const timelineStart = generateTimelineDates()[0];
    const timelineEnd = generateTimelineDates()[generateTimelineDates().length - 1];
    
    const taskStart = new Date(task.startDate);
    const taskEnd = new Date(task.endDate);
    
    const timelineDuration = timelineEnd.getTime() - timelineStart.getTime();
    const taskStartOffset = taskStart.getTime() - timelineStart.getTime();
    const taskDuration = taskEnd.getTime() - taskStart.getTime();
    
    const left = Math.max(0, (taskStartOffset / timelineDuration) * 100);
    const width = Math.min(100 - left, (taskDuration / timelineDuration) * 100);
    
    return { left: `${left}%`, width: `${width}%` };
  };

  // Get status color
  const getStatusColor = (status: GanttTask['status']) => {
    switch (status) {
      case 'not-started': return 'bg-gray-200';
      case 'in-progress': return 'bg-blue-500';
      case 'completed': return 'bg-green-500';
      case 'blocked': return 'bg-red-500';
      default: return 'bg-gray-200';
    }
  };

  // Get priority icon
  const getPriorityIcon = (priority: GanttTask['priority']) => {
    switch (priority) {
      case 'high': return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case 'medium': return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'low': return <AlertTriangle className="w-4 h-4 text-green-500" />;
      default: return null;
    }
  };

  // Navigate timeline
  const navigateTimeline = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (viewMode === 'week') {
      newDate.setDate(newDate.getDate() + (direction === 'prev' ? -7 : 7));
    } else {
      newDate.setMonth(newDate.getMonth() + (direction === 'prev' ? -1 : 1));
    }
    setCurrentDate(newDate);
  };

  const timelineDates = generateTimelineDates();

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Calendar className="w-5 h-5" />
          Project Timeline
        </CardTitle>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            <Button 
              variant="outline" 
              size="icon" 
              onClick={() => navigateTimeline('prev')}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="text-sm font-medium px-2">
              {viewMode === 'week' 
                ? `${timelineDates[0].toLocaleDateString()} - ${timelineDates[6].toLocaleDateString()}`
                : currentDate.toLocaleDateString('default', { month: 'long', year: 'numeric' })}
            </span>
            <Button 
              variant="outline" 
              size="icon" 
              onClick={() => navigateTimeline('next')}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setViewMode(viewMode === 'week' ? 'month' : 'week')}
          >
            {viewMode === 'week' ? 'Month View' : 'Week View'}
          </Button>
          <Button size="sm" onClick={onTaskCreate}>
            <Plus className="w-4 h-4 mr-2" />
            Add Task
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {/* Timeline Header */}
        <div className="flex border-b">
          <div className="w-64 p-2 font-medium">Task</div>
          <div className="flex-1 grid grid-cols-7 gap-1">
            {timelineDates.map((date, index) => (
              <div key={index} className="p-2 text-center text-sm text-muted-foreground">
                {viewMode === 'week' 
                  ? date.toLocaleDateString('default', { weekday: 'short', day: 'numeric' })
                  : `Week ${Math.ceil(date.getDate() / 7)}`}
              </div>
            ))}
          </div>
        </div>

        {/* Tasks */}
        <div className="max-h-96 overflow-y-auto">
          {tasks.map((task) => {
            const position = calculateTaskPosition(task);
            return (
              <div key={task.id} className="flex border-b hover:bg-muted/50">
                {/* Task Info */}
                <div className="w-64 p-3">
                  <div className="flex items-center gap-2">
                    {getPriorityIcon(task.priority)}
                    <span className="font-medium text-sm">{task.name}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <User className="w-3 h-3 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">{task.assignee}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <Clock className="w-3 h-3 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">
                      {task.progress}% complete
                    </span>
                  </div>
                </div>

                {/* Timeline Bar */}
                <div className="flex-1 relative p-3">
                  <div className="absolute inset-y-0 left-0 right-0 flex items-center">
                    <div 
                      className={`h-6 rounded ${getStatusColor(task.status)} relative`}
                      style={{ left: position.left, width: position.width }}
                    >
                      <div 
                        className="h-full bg-white/30 rounded"
                        style={{ width: `${task.progress}%` }}
                      />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-xs font-medium text-white">
                          {task.progress}%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-4 mt-4 pt-4 border-t">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-gray-200 rounded"></div>
            <span className="text-xs">Not Started</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-500 rounded"></div>
            <span className="text-xs">In Progress</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded"></div>
            <span className="text-xs">Completed</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-500 rounded"></div>
            <span className="text-xs">Blocked</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}