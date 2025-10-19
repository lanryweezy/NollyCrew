import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  CheckCircle, 
  Circle, 
  AlertCircle, 
  Calendar, 
  Flag,
  Plus,
  Edit,
  Trash2,
  Clock
} from "lucide-react";

interface Milestone {
  id: string;
  title: string;
  description: string;
  dueDate: Date;
  completedDate?: Date;
  status: 'not-started' | 'in-progress' | 'completed' | 'overdue';
  progress: number;
  dependencies?: string[];
  assignedTo?: string[];
  budget?: number;
  actualCost?: number;
}

interface MilestoneTrackerProps {
  milestones: Milestone[];
  onMilestoneUpdate?: (milestone: Milestone) => void;
  onMilestoneCreate?: () => void;
  onMilestoneDelete?: (milestoneId: string) => void;
}

export default function MilestoneTracker({ 
  milestones, 
  onMilestoneUpdate, 
  onMilestoneCreate,
  onMilestoneDelete
}: MilestoneTrackerProps) {
  const [editingMilestone, setEditingMilestone] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Milestone>>({});

  // Get status icon
  const getStatusIcon = (status: Milestone['status']) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'in-progress': return <Circle className="w-5 h-5 text-blue-500" />;
      case 'overdue': return <AlertCircle className="w-5 h-5 text-red-500" />;
      default: return <Circle className="w-5 h-5 text-gray-300" />;
    }
  };

  // Get status color
  const getStatusColor = (status: Milestone['status']) => {
    switch (status) {
      case 'completed': return 'border-green-200 bg-green-50';
      case 'in-progress': return 'border-blue-200 bg-blue-50';
      case 'overdue': return 'border-red-200 bg-red-50';
      default: return 'border-gray-200 bg-gray-50';
    }
  };

  // Check if milestone is overdue
  const isOverdue = (milestone: Milestone) => {
    return (
      milestone.status !== 'completed' && 
      new Date(milestone.dueDate) < new Date()
    );
  };

  // Handle edit milestone
  const handleEditMilestone = (milestone: Milestone) => {
    setEditingMilestone(milestone.id);
    setEditForm(milestone);
  };

  // Handle save edit
  const handleSaveEdit = () => {
    if (editingMilestone && onMilestoneUpdate) {
      onMilestoneUpdate(editForm as Milestone);
      setEditingMilestone(null);
      setEditForm({});
    }
  };

  // Handle cancel edit
  const handleCancelEdit = () => {
    setEditingMilestone(null);
    setEditForm({});
  };

  // Handle form change
  const handleFormChange = (field: string, value: any) => {
    setEditForm(prev => ({ ...prev, [field]: value }));
  };

  // Toggle milestone completion
  const toggleMilestoneCompletion = (milestone: Milestone) => {
    if (onMilestoneUpdate) {
      const updatedMilestone = {
        ...milestone,
        status: milestone.status === 'completed' ? 'in-progress' : 'completed',
        completedDate: milestone.status === 'completed' ? undefined : new Date(),
        progress: milestone.status === 'completed' ? 50 : 100
      };
      onMilestoneUpdate(updatedMilestone);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Flag className="w-5 h-5" />
          Project Milestones
        </CardTitle>
        <Button size="sm" onClick={onMilestoneCreate}>
          <Plus className="w-4 h-4 mr-2" />
          Add Milestone
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {milestones.map((milestone) => {
            // Update status if overdue
            const updatedStatus = isOverdue(milestone) ? 'overdue' : milestone.status;
            
            return (
              <div 
                key={milestone.id} 
                className={`border rounded-lg p-4 ${getStatusColor(updatedStatus)}`}
              >
                {editingMilestone === milestone.id ? (
                  // Edit mode
                  <div className="space-y-3">
                    <input
                      type="text"
                      value={editForm.title || ''}
                      onChange={(e) => handleFormChange('title', e.target.value)}
                      className="font-medium text-lg w-full border-b pb-1"
                      placeholder="Milestone title"
                    />
                    <textarea
                      value={editForm.description || ''}
                      onChange={(e) => handleFormChange('description', e.target.value)}
                      className="w-full border rounded p-2 text-sm"
                      placeholder="Milestone description"
                      rows={3}
                    />
                    <div className="flex gap-4">
                      <div>
                        <label className="text-xs text-muted-foreground">Due Date</label>
                        <input
                          type="date"
                          value={editForm.dueDate ? new Date(editForm.dueDate).toISOString().split('T')[0] : ''}
                          onChange={(e) => handleFormChange('dueDate', new Date(e.target.value))}
                          className="w-full border rounded p-2"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-muted-foreground">Progress (%)</label>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={editForm.progress || 0}
                          onChange={(e) => handleFormChange('progress', parseInt(e.target.value) || 0)}
                          className="w-full border rounded p-2"
                        />
                      </div>
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" size="sm" onClick={handleCancelEdit}>
                        Cancel
                      </Button>
                      <Button size="sm" onClick={handleSaveEdit}>
                        Save
                      </Button>
                    </div>
                  </div>
                ) : (
                  // View mode
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => toggleMilestoneCompletion(milestone)}
                          className="mt-1"
                        >
                          {getStatusIcon(updatedStatus)}
                        </Button>
                        <div>
                          <h3 className="font-medium text-lg">{milestone.title}</h3>
                          <p className="text-sm text-muted-foreground mt-1">
                            {milestone.description}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => handleEditMilestone(milestone)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => onMilestoneDelete && onMilestoneDelete(milestone.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <div className="flex-1">
                        <div className="flex justify-between text-sm mb-1">
                          <span>Progress</span>
                          <span>{milestone.progress}%</span>
                        </div>
                        <Progress value={milestone.progress} className="h-2" />
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-1 text-sm">
                          <Calendar className="w-4 h-4" />
                          <span>
                            {new Date(milestone.dueDate).toLocaleDateString()}
                          </span>
                        </div>
                        {isOverdue(milestone) && (
                          <div className="flex items-center gap-1 text-xs text-red-500 mt-1">
                            <Clock className="w-3 h-3" />
                            <span>Overdue</span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {milestone.assignedTo && milestone.assignedTo.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {milestone.assignedTo.map((person, index) => (
                          <span 
                            key={index} 
                            className="text-xs bg-muted px-2 py-1 rounded"
                          >
                            {person}
                          </span>
                        ))}
                      </div>
                    )}
                    
                    {milestone.budget && (
                      <div className="flex items-center gap-2 text-sm">
                        <span className="font-medium">
                          Budget: ₦{milestone.budget.toLocaleString()}
                        </span>
                        {milestone.actualCost && (
                          <span className={milestone.actualCost > milestone.budget ? 'text-red-500' : 'text-green-500'}>
                            Actual: ₦{milestone.actualCost.toLocaleString()}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
        
        {/* Summary */}
        <div className="mt-6 pt-4 border-t">
          <h3 className="font-medium mb-3">Milestone Summary</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 p-3 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {milestones.filter(m => m.status === 'in-progress').length}
              </div>
              <div className="text-sm text-muted-foreground">In Progress</div>
            </div>
            <div className="bg-green-50 p-3 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {milestones.filter(m => m.status === 'completed').length}
              </div>
              <div className="text-sm text-muted-foreground">Completed</div>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg">
              <div className="text-2xl font-bold text-gray-600">
                {milestones.filter(m => m.status === 'not-started').length}
              </div>
              <div className="text-sm text-muted-foreground">Not Started</div>
            </div>
            <div className="bg-red-50 p-3 rounded-lg">
              <div className="text-2xl font-bold text-red-600">
                {milestones.filter(m => isOverdue(m)).length}
              </div>
              <div className="text-sm text-muted-foreground">Overdue</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}