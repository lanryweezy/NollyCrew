import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  Users, 
  Camera, 
  Lightbulb, 
  Music, 
  Car, 
  DollarSign,
  Plus,
  Edit,
  Trash2
} from "lucide-react";

interface Resource {
  id: string;
  name: string;
  type: 'crew' | 'equipment' | 'location' | 'vehicle';
  allocated: number;
  total: number;
  unit: string;
  costPerUnit?: number;
  assignedTo?: string[];
}

interface ResourceAllocationProps {
  resources: Resource[];
  onResourceUpdate?: (resource: Resource) => void;
  onResourceCreate?: () => void;
  onResourceDelete?: (resourceId: string) => void;
}

export default function ResourceAllocation({ 
  resources, 
  onResourceUpdate, 
  onResourceCreate,
  onResourceDelete
}: ResourceAllocationProps) {
  const [editingResource, setEditingResource] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Resource>>({});

  // Get icon for resource type
  const getResourceIcon = (type: Resource['type']) => {
    switch (type) {
      case 'crew': return <Users className="w-4 h-4" />;
      case 'equipment': return <Camera className="w-4 h-4" />;
      case 'location': return <Lightbulb className="w-4 h-4" />;
      case 'vehicle': return <Car className="w-4 h-4" />;
      default: return <Music className="w-4 h-4" />;
    }
  };

  // Get color for resource type
  const getResourceColor = (type: Resource['type']) => {
    switch (type) {
      case 'crew': return 'bg-blue-100 text-blue-800';
      case 'equipment': return 'bg-green-100 text-green-800';
      case 'location': return 'bg-purple-100 text-purple-800';
      case 'vehicle': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Calculate utilization percentage
  const calculateUtilization = (allocated: number, total: number) => {
    return total > 0 ? Math.round((allocated / total) * 100) : 0;
  };

  // Get utilization color
  const getUtilizationColor = (percentage: number) => {
    if (percentage < 50) return 'bg-green-500';
    if (percentage < 80) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  // Handle edit resource
  const handleEditResource = (resource: Resource) => {
    setEditingResource(resource.id);
    setEditForm(resource);
  };

  // Handle save edit
  const handleSaveEdit = () => {
    if (editingResource && onResourceUpdate) {
      onResourceUpdate(editForm as Resource);
      setEditingResource(null);
      setEditForm({});
    }
  };

  // Handle cancel edit
  const handleCancelEdit = () => {
    setEditingResource(null);
    setEditForm({});
  };

  // Handle form change
  const handleFormChange = (field: string, value: any) => {
    setEditForm(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Users className="w-5 h-5" />
          Resource Allocation
        </CardTitle>
        <Button size="sm" onClick={onResourceCreate}>
          <Plus className="w-4 h-4 mr-2" />
          Add Resource
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {resources.map((resource) => (
            <div key={resource.id} className="border rounded-lg p-4">
              {editingResource === resource.id ? (
                // Edit mode
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    {getResourceIcon(resource.type)}
                    <input
                      type="text"
                      value={editForm.name || ''}
                      onChange={(e) => handleFormChange('name', e.target.value)}
                      className="font-medium flex-1 border-b pb-1"
                      placeholder="Resource name"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs text-muted-foreground">Allocated</label>
                      <input
                        type="number"
                        value={editForm.allocated || 0}
                        onChange={(e) => handleFormChange('allocated', parseInt(e.target.value) || 0)}
                        className="w-full border rounded p-2"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground">Total</label>
                      <input
                        type="number"
                        value={editForm.total || 0}
                        onChange={(e) => handleFormChange('total', parseInt(e.target.value) || 0)}
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
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getResourceIcon(resource.type)}
                      <span className="font-medium">{resource.name}</span>
                      <span className={`text-xs px-2 py-1 rounded-full ${getResourceColor(resource.type)}`}>
                        {resource.type}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => handleEditResource(resource)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => onResourceDelete && onResourceDelete(resource.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <div className="flex justify-between text-sm mb-1">
                        <span>Allocation</span>
                        <span>{resource.allocated} / {resource.total} {resource.unit}</span>
                      </div>
                      <Progress 
                        value={calculateUtilization(resource.allocated, resource.total)} 
                        className="h-2"
                      />
                    </div>
                    <div className={`w-24 text-right text-sm font-medium ${getUtilizationColor(calculateUtilization(resource.allocated, resource.total))} text-white px-2 py-1 rounded`}>
                      {calculateUtilization(resource.allocated, resource.total)}%
                    </div>
                  </div>
                  
                  {resource.costPerUnit && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <DollarSign className="w-4 h-4" />
                      <span>
                        Cost: ₦{(resource.allocated * resource.costPerUnit).toLocaleString()}
                      </span>
                    </div>
                  )}
                  
                  {resource.assignedTo && resource.assignedTo.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {resource.assignedTo.map((person, index) => (
                        <span 
                          key={index} 
                          className="text-xs bg-muted px-2 py-1 rounded"
                        >
                          {person}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
        
        {/* Summary */}
        <div className="mt-6 pt-4 border-t">
          <h3 className="font-medium mb-3">Resource Summary</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 p-3 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {resources.filter(r => r.type === 'crew').length}
              </div>
              <div className="text-sm text-muted-foreground">Crew Members</div>
            </div>
            <div className="bg-green-50 p-3 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {resources.filter(r => r.type === 'equipment').length}
              </div>
              <div className="text-sm text-muted-foreground">Equipment</div>
            </div>
            <div className="bg-purple-50 p-3 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {resources.filter(r => r.type === 'location').length}
              </div>
              <div className="text-sm text-muted-foreground">Locations</div>
            </div>
            <div className="bg-yellow-50 p-3 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">
                {resources.filter(r => r.type === 'vehicle').length}
              </div>
              <div className="text-sm text-muted-foreground">Vehicles</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}