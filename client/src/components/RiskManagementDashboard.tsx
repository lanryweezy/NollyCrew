import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  User,
  Plus,
  Edit,
  Trash2,
  Filter,
  Search
} from "lucide-react";

interface Risk {
  id: string;
  title: string;
  description: string;
  category: 'financial' | 'operational' | 'technical' | 'legal' | 'market';
  probability: number; // 1-100
  impact: number; // 1-100
  status: 'identified' | 'mitigated' | 'resolved' | 'escalated';
  mitigationPlan: string;
  owner: string;
  ownerAvatar?: string;
  dueDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

interface RiskManagementDashboardProps {
  risks: Risk[];
  onRiskUpdate?: (risk: Risk) => void;
  onRiskCreate?: () => void;
  onRiskDelete?: (riskId: string) => void;
}

export default function RiskManagementDashboard({ 
  risks, 
  onRiskUpdate, 
  onRiskCreate,
  onRiskDelete
}: RiskManagementDashboardProps) {
  const [editingRisk, setEditingRisk] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Risk>>({});
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  // Calculate risk score (probability * impact)
  const calculateRiskScore = (risk: Risk) => {
    return (risk.probability * risk.impact) / 100;
  };

  // Get risk level based on score
  const getRiskLevel = (score: number) => {
    if (score >= 70) return { level: 'high', color: 'text-red-500', bg: 'bg-red-100' };
    if (score >= 40) return { level: 'medium', color: 'text-yellow-500', bg: 'bg-yellow-100' };
    return { level: 'low', color: 'text-green-500', bg: 'bg-green-100' };
  };

  // Get category color
  const getCategoryColor = (category: Risk['category']) => {
    switch (category) {
      case 'financial': return 'bg-blue-100 text-blue-800';
      case 'operational': return 'bg-purple-100 text-purple-800';
      case 'technical': return 'bg-green-100 text-green-800';
      case 'legal': return 'bg-red-100 text-red-800';
      case 'market': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Get status color
  const getStatusColor = (status: Risk['status']) => {
    switch (status) {
      case 'identified': return 'bg-gray-100 text-gray-800';
      case 'mitigated': return 'bg-blue-100 text-blue-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'escalated': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Filter risks based on search and filters
  const filteredRisks = risks.filter(risk => {
    const matchesSearch = risk.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         risk.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = filterCategory === "all" || risk.category === filterCategory;
    const matchesStatus = filterStatus === "all" || risk.status === filterStatus;
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Handle edit risk
  const handleEditRisk = (risk: Risk) => {
    setEditingRisk(risk.id);
    setEditForm(risk);
  };

  // Handle save edit
  const handleSaveEdit = () => {
    if (editingRisk && onRiskUpdate) {
      onRiskUpdate(editForm as Risk);
      setEditingRisk(null);
      setEditForm({});
    }
  };

  // Handle cancel edit
  const handleCancelEdit = () => {
    setEditingRisk(null);
    setEditForm({});
  };

  // Handle form change
  const handleFormChange = (field: string, value: any) => {
    setEditForm(prev => ({ ...prev, [field]: value }));
  };

  // Update risk status
  const updateRiskStatus = (risk: Risk, newStatus: Risk['status']) => {
    if (onRiskUpdate) {
      const updatedRisk = {
        ...risk,
        status: newStatus,
        updatedAt: new Date()
      };
      onRiskUpdate(updatedRisk);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="w-5 h-5" />
          Risk Management Dashboard
        </CardTitle>
        <div className="flex flex-wrap gap-2">
          <div className="relative">
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <input
              type="text"
              placeholder="Search risks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 pr-4 py-2 border rounded-lg text-sm w-40"
            />
          </div>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-3 py-2 border rounded-lg text-sm"
          >
            <option value="all">All Categories</option>
            <option value="financial">Financial</option>
            <option value="operational">Operational</option>
            <option value="technical">Technical</option>
            <option value="legal">Legal</option>
            <option value="market">Market</option>
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 border rounded-lg text-sm"
          >
            <option value="all">All Statuses</option>
            <option value="identified">Identified</option>
            <option value="mitigated">Mitigated</option>
            <option value="resolved">Resolved</option>
            <option value="escalated">Escalated</option>
          </select>
          <Button size="sm" onClick={onRiskCreate}>
            <Plus className="w-4 h-4 mr-2" />
            Add Risk
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {filteredRisks.map((risk) => {
            const riskScore = calculateRiskScore(risk);
            const riskLevel = getRiskLevel(riskScore);
            
            return (
              <div key={risk.id} className="border rounded-lg p-4 hover:bg-muted/50">
                {editingRisk === risk.id ? (
                  // Edit mode
                  <div className="space-y-3">
                    <input
                      type="text"
                      value={editForm.title || ''}
                      onChange={(e) => handleFormChange('title', e.target.value)}
                      className="font-medium text-lg w-full border-b pb-1"
                      placeholder="Risk title"
                    />
                    <textarea
                      value={editForm.description || ''}
                      onChange={(e) => handleFormChange('description', e.target.value)}
                      className="w-full border rounded p-2 text-sm"
                      placeholder="Risk description"
                      rows={2}
                    />
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs text-muted-foreground">Probability (%)</label>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={editForm.probability || 0}
                          onChange={(e) => handleFormChange('probability', parseInt(e.target.value) || 0)}
                          className="w-full border rounded p-2"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-muted-foreground">Impact (%)</label>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={editForm.impact || 0}
                          onChange={(e) => handleFormChange('impact', parseInt(e.target.value) || 0)}
                          className="w-full border rounded p-2"
                        />
                      </div>
                    </div>
                    <textarea
                      value={editForm.mitigationPlan || ''}
                      onChange={(e) => handleFormChange('mitigationPlan', e.target.value)}
                      className="w-full border rounded p-2 text-sm"
                      placeholder="Mitigation plan"
                      rows={2}
                    />
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
                        <div className={`p-2 rounded-full ${riskLevel.bg}`}>
                          <AlertTriangle className={`w-5 h-5 ${riskLevel.color}`} />
                        </div>
                        <div className="flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="font-medium">{risk.title}</h3>
                            <span className={`text-xs px-2 py-1 rounded-full ${getCategoryColor(risk.category)}`}>
                              {risk.category}
                            </span>
                            <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(risk.status)}`}>
                              {risk.status}
                            </span>
                            <span className={`text-xs px-2 py-1 rounded-full ${riskLevel.bg} ${riskLevel.color}`}>
                              {riskLevel.level} risk
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            {risk.description}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => handleEditRisk(risk)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => onRiskDelete && onRiskDelete(risk.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Probability</span>
                          <span>{risk.probability}%</span>
                        </div>
                        <Progress value={risk.probability} className="h-2" />
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Impact</span>
                          <span>{risk.impact}%</span>
                        </div>
                        <Progress value={risk.impact} className="h-2" />
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Risk Score</span>
                          <span>{riskScore.toFixed(1)}</span>
                        </div>
                        <Progress 
                          value={riskScore} 
                          className="h-2"
                          indicatorClassName={riskLevel.color.replace('text-', 'bg-')}
                        />
                      </div>
                    </div>
                    
                    <div className="bg-muted/50 rounded-lg p-3">
                      <h4 className="font-medium text-sm mb-2">Mitigation Plan</h4>
                      <p className="text-sm">{risk.mitigationPlan}</p>
                    </div>
                    
                    <div className="flex flex-wrap items-center justify-between gap-4">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm">{risk.owner}</span>
                        {risk.dueDate && (
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Clock className="w-4 h-4" />
                            <span>Due: {new Date(risk.dueDate).toLocaleDateString()}</span>
                          </div>
                        )}
                      </div>
                      <div className="flex gap-2">
                        {risk.status !== 'resolved' && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => updateRiskStatus(risk, 'mitigated')}
                          >
                            Mark Mitigated
                          </Button>
                        )}
                        {risk.status !== 'resolved' && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => updateRiskStatus(risk, 'resolved')}
                          >
                            Mark Resolved
                          </Button>
                        )}
                        {risk.status !== 'escalated' && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => updateRiskStatus(risk, 'escalated')}
                          >
                            Escalate
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
        
        {/* Summary */}
        <div className="mt-6 pt-4 border-t">
          <h3 className="font-medium mb-3">Risk Summary</h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="bg-red-50 p-3 rounded-lg">
              <div className="text-2xl font-bold text-red-600">
                {risks.filter(r => getRiskLevel(calculateRiskScore(r)).level === 'high').length}
              </div>
              <div className="text-sm text-muted-foreground">High Risks</div>
            </div>
            <div className="bg-yellow-50 p-3 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">
                {risks.filter(r => getRiskLevel(calculateRiskScore(r)).level === 'medium').length}
              </div>
              <div className="text-sm text-muted-foreground">Medium Risks</div>
            </div>
            <div className="bg-green-50 p-3 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {risks.filter(r => getRiskLevel(calculateRiskScore(r)).level === 'low').length}
              </div>
              <div className="text-sm text-muted-foreground">Low Risks</div>
            </div>
            <div className="bg-blue-50 p-3 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {risks.filter(r => r.status === 'mitigated').length}
              </div>
              <div className="text-sm text-muted-foreground">Mitigated</div>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg">
              <div className="text-2xl font-bold text-gray-600">
                {risks.filter(r => r.status === 'resolved').length}
              </div>
              <div className="text-sm text-muted-foreground">Resolved</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}