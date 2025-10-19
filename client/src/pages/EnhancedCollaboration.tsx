import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import Navigation from "@/components/Navigation";
import ThemeToggle from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Folder,
  FileText,
  Image,
  Video,
  Plus,
  Search,
  Filter,
  Upload,
  Download,
  Share2,
  Users,
  CheckCircle,
  Circle,
  Trash2,
  Edit3,
  MessageSquare,
  Calendar,
  BarChart3,
  AlertTriangle,
  Flag
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import PageHeader from "@/components/PageHeader";
import RealTimeChat from "@/components/RealTimeChat";
import CollaborativeEditor from "@/components/CollaborativeEditor";
import GanttChart from "@/components/GanttChart";
import ResourceAllocation from "@/components/ResourceAllocation";
import MilestoneTracker from "@/components/MilestoneTracker";
import RiskManagementDashboard from "@/components/RiskManagementDashboard";
import { useWebSocket } from "@/lib/websocket";

interface Document {
  id: string;
  name: string;
  type: "document" | "image" | "video";
  size: string;
  lastModified: Date;
  owner: string;
  ownerAvatar: string;
  sharedWith: string[];
}

interface Task {
  id: string;
  title: string;
  description: string;
  status: "todo" | "in-progress" | "review" | "done";
  assignee: string;
  assigneeAvatar: string;
  dueDate?: Date;
  projectId?: string;
}

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

interface Risk {
  id: string;
  title: string;
  description: string;
  category: 'financial' | 'operational' | 'technical' | 'legal' | 'market';
  probability: number;
  impact: number;
  status: 'identified' | 'mitigated' | 'resolved' | 'escalated';
  mitigationPlan: string;
  owner: string;
  ownerAvatar?: string;
  dueDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export default function EnhancedCollaboration() {
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState("documents");
  const [searchQuery, setSearchQuery] = useState("");
  const { connect, disconnect } = useWebSocket();

  // Connect to WebSocket on mount
  useEffect(() => {
    connect();
    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  // Mock data
  const documents: Document[] = [
    {
      id: "1",
      name: "Script Draft v2.pdf",
      type: "document",
      size: "2.4 MB",
      lastModified: new Date(Date.now() - 1000 * 60 * 60 * 24),
      owner: "John Doe",
      ownerAvatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
      sharedWith: ["Sarah Johnson", "Mike Wilson"]
    },
    {
      id: "2",
      name: "Scene 12A Storyboard.png",
      type: "image",
      size: "5.1 MB",
      lastModified: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3),
      owner: "Sarah Johnson",
      ownerAvatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
      sharedWith: ["John Doe", "Mike Wilson", "Lisa Chen"]
    },
    {
      id: "3",
      name: "Behind the Scenes.mp4",
      type: "video",
      size: "1.2 GB",
      lastModified: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7),
      owner: "Mike Wilson",
      ownerAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
      sharedWith: ["John Doe", "Sarah Johnson"]
    }
  ];

  const tasks: Task[] = [
    {
      id: "1",
      title: "Review Script Draft",
      description: "Check for continuity errors and character development",
      status: "in-progress",
      assignee: "Sarah Johnson",
      assigneeAvatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
      dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 3)
    },
    {
      id: "2",
      title: "Location Scouting",
      description: "Find 3 potential locations for exterior scenes",
      status: "todo",
      assignee: "Mike Wilson",
      assigneeAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face"
    },
    {
      id: "3",
      title: "Cast Callbacks",
      description: "Schedule callbacks for supporting roles",
      status: "done",
      assignee: "John Doe",
      assigneeAvatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face"
    },
    {
      id: "4",
      title: "Equipment List",
      description: "Finalize camera and lighting equipment needs",
      status: "review",
      assignee: "Lisa Chen",
      assigneeAvatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&h=150&fit=crop&crop=face"
    }
  ];

  const ganttTasks: GanttTask[] = [
    {
      id: "1",
      name: "Pre-production",
      startDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30),
      endDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 15),
      progress: 100,
      assignee: "John Doe",
      priority: "high",
      status: "completed"
    },
    {
      id: "2",
      name: "Principal Photography",
      startDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10),
      endDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 20),
      progress: 65,
      assignee: "Mike Wilson",
      priority: "high",
      status: "in-progress"
    },
    {
      id: "3",
      name: "Post-production",
      startDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 25),
      endDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 60),
      progress: 0,
      assignee: "Sarah Johnson",
      priority: "medium",
      status: "not-started"
    }
  ];

  const resources: Resource[] = [
    {
      id: "1",
      name: "Camera Operators",
      type: "crew",
      allocated: 3,
      total: 5,
      unit: "people",
      costPerUnit: 50000,
      assignedTo: ["John Doe", "Mike Wilson", "Lisa Chen"]
    },
    {
      id: "2",
      name: "ARRI Alexa Mini",
      type: "equipment",
      allocated: 2,
      total: 3,
      unit: "units",
      costPerUnit: 200000
    },
    {
      id: "3",
      name: "Studio A",
      type: "location",
      allocated: 1,
      total: 1,
      unit: "location",
      costPerUnit: 500000
    }
  ];

  const milestones: Milestone[] = [
    {
      id: "1",
      title: "Script Finalized",
      description: "Final script approval from all stakeholders",
      dueDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 20),
      completedDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 22),
      status: "completed",
      progress: 100,
      budget: 500000,
      actualCost: 480000
    },
    {
      id: "2",
      title: "Casting Complete",
      description: "All principal roles cast",
      dueDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5),
      status: "completed",
      progress: 100,
      budget: 2000000,
      actualCost: 2100000
    },
    {
      id: "3",
      title: "Principal Photography",
      description: "Complete all principal photography",
      dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 15),
      status: "in-progress",
      progress: 65,
      budget: 15000000,
      actualCost: 9750000
    }
  ];

  const risks: Risk[] = [
    {
      id: "1",
      title: "Weather Delays",
      description: "Potential rain delays for exterior scenes",
      category: "operational",
      probability: 70,
      impact: 60,
      status: "mitigated",
      mitigationPlan: "Schedule backup interior scenes for rainy days",
      owner: "Mike Wilson",
      dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 45),
      updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10)
    },
    {
      id: "2",
      title: "Budget Overrun",
      description: "Potential cost overruns in post-production",
      category: "financial",
      probability: 40,
      impact: 80,
      status: "identified",
      mitigationPlan: "Regular budget reviews and cost tracking",
      owner: "John Doe",
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30),
      updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5)
    }
  ];

  const getDocumentIcon = (type: string) => {
    switch (type) {
      case "document": return <FileText className="w-5 h-5" />;
      case "image": return <Image className="w-5 h-5" />;
      case "video": return <Video className="w-5 h-5" />;
      default: return <FileText className="w-5 h-5" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "todo": return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100";
      case "in-progress": return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100";
      case "review": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100";
      case "done": return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const filteredDocuments = documents.filter(doc => 
    doc.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredTasks = tasks.filter(task => 
    task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    task.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <div className="relative">
        <Navigation 
          isAuthenticated={true}
          userRole="producer"
          userName="John Producer"
        />
        <div className="absolute top-4 right-4 z-50">
          <ThemeToggle />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <PageHeader 
          title="Enhanced Collaboration Hub" 
          description="Real-time collaboration, project management, and team communication"
        >
          <div className="flex gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search documents and tasks..."
                className="pl-10 w-64"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button variant="outline">
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </Button>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              New
            </Button>
          </div>
        </PageHeader>

        <div className="flex gap-6">
          {/* Sidebar */}
          <div className="w-64 flex-shrink-0 hidden lg:block">
            <Card>
              <CardHeader>
                <CardTitle>Projects</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="secondary" className="w-full justify-start">
                  <Folder className="w-4 h-4 mr-2" />
                  Love in Lagos
                </Button>
                <Button variant="ghost" className="w-full justify-start">
                  <Folder className="w-4 h-4 mr-2" />
                  Battle on Buka Street 3
                </Button>
                <Button variant="ghost" className="w-full justify-start">
                  <Folder className="w-4 h-4 mr-2" />
                  The Set Up 3
                </Button>
                <Button variant="ghost" className="w-full justify-start">
                  <Folder className="w-4 h-4 mr-2" />
                  New Project
                </Button>
              </CardContent>
            </Card>

            <Card className="mt-4">
              <CardHeader>
                <CardTitle>Team</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-3">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face" />
                    <AvatarFallback>JD</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="text-sm font-medium">John Doe</div>
                    <div className="text-xs text-muted-foreground">Producer</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face" />
                    <AvatarFallback>SJ</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="text-sm font-medium">Sarah Johnson</div>
                    <div className="text-xs text-muted-foreground">Lead Actor</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face" />
                    <AvatarFallback>MW</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="text-sm font-medium">Mike Wilson</div>
                    <div className="text-xs text-muted-foreground">Director</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-4 lg:grid-cols-6 mb-6">
                <TabsTrigger value="documents">Documents</TabsTrigger>
                <TabsTrigger value="tasks">Tasks</TabsTrigger>
                <TabsTrigger value="chat">Chat</TabsTrigger>
                <TabsTrigger value="editor">Editor</TabsTrigger>
                <TabsTrigger value="schedule">Schedule</TabsTrigger>
                <TabsTrigger value="management">Management</TabsTrigger>
              </TabsList>

              <TabsContent value="documents" className="mt-0">
                <Card>
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <CardTitle>Shared Documents</CardTitle>
                      <Button>
                        <Upload className="w-4 h-4 mr-2" />
                        Upload
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {filteredDocuments.map((doc) => (
                        <Card key={doc.id} className="hover:shadow-md transition-shadow">
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between">
                              <div className="flex items-center gap-3">
                                <div className="p-2 bg-muted rounded-lg">
                                  {getDocumentIcon(doc.type)}
                                </div>
                                <div>
                                  <h3 className="font-medium text-sm truncate max-w-[160px]">{doc.name}</h3>
                                  <p className="text-xs text-muted-foreground">{doc.size}</p>
                                </div>
                              </div>
                              <Button variant="ghost" size="icon">
                                <Share2 className="w-4 h-4" />
                              </Button>
                            </div>
                            <div className="flex items-center justify-between mt-4">
                              <div className="flex items-center gap-2">
                                <Avatar className="w-6 h-6">
                                  <AvatarImage src={doc.ownerAvatar} />
                                  <AvatarFallback>{doc.owner.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                                </Avatar>
                                <span className="text-xs text-muted-foreground">{doc.owner}</span>
                              </div>
                              <span className="text-xs text-muted-foreground">
                                {doc.lastModified.toLocaleDateString()}
                              </span>
                            </div>
                            <div className="flex items-center gap-1 mt-2">
                              <Users className="w-3 h-3 text-muted-foreground" />
                              <span className="text-xs text-muted-foreground">
                                Shared with {doc.sharedWith.length} people
                              </span>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="tasks" className="mt-0">
                <Card>
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <CardTitle>Task Management</CardTitle>
                      <Button>
                        <Plus className="w-4 h-4 mr-2" />
                        New Task
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {filteredTasks.map((task) => (
                        <div key={task.id} className="flex items-center gap-4 p-4 border rounded-lg hover:bg-muted/50">
                          <Button variant="ghost" size="icon">
                            {task.status === "done" ? (
                              <CheckCircle className="w-5 h-5 text-green-500" />
                            ) : (
                              <Circle className="w-5 h-5" />
                            )}
                          </Button>
                          <div className="flex-1">
                            <h3 className="font-medium">{task.title}</h3>
                            <p className="text-sm text-muted-foreground mt-1">{task.description}</p>
                            <div className="flex items-center gap-4 mt-2">
                              <Badge className={getStatusColor(task.status)}>
                                {task.status.replace('-', ' ')}
                              </Badge>
                              {task.dueDate && (
                                <span className="text-xs text-muted-foreground">
                                  Due: {task.dueDate.toLocaleDateString()}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Avatar className="w-8 h-8">
                              <AvatarImage src={task.assigneeAvatar} />
                              <AvatarFallback>{task.assignee.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                            </Avatar>
                            <Button variant="ghost" size="icon">
                              <Edit3 className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="icon">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="chat" className="mt-0">
                <div className="h-[600px]">
                  <RealTimeChat 
                    projectId="project-1" 
                    users={[
                      { id: "1", name: "John Doe", isOnline: true },
                      { id: "2", name: "Sarah Johnson", isOnline: true },
                      { id: "3", name: "Mike Wilson", isOnline: false }
                    ]} 
                  />
                </div>
              </TabsContent>

              <TabsContent value="editor" className="mt-0">
                <div className="h-[600px]">
                  <CollaborativeEditor 
                    projectId="project-1"
                    documentId="doc-1"
                    documentName="Script Draft v2"
                    initialContent="FADE IN:\n\nEXT. CITY STREET - DAY\n\nJANE walks down the busy street, checking her phone. She stops at a coffee shop window, looking inside.\n\nJANE\n(to herself)\nI can't believe he's back...\n\nShe takes a deep breath and enters the coffee shop.\n\nCUT TO:"
                  />
                </div>
              </TabsContent>

              <TabsContent value="schedule" className="mt-0 space-y-6">
                <GanttChart 
                  tasks={ganttTasks}
                  onTaskCreate={() => console.log("Create task")}
                />
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <ResourceAllocation 
                    resources={resources}
                    onResourceCreate={() => console.log("Create resource")}
                    onResourceDelete={(id) => console.log("Delete resource", id)}
                  />
                  
                  <MilestoneTracker 
                    milestones={milestones}
                    onMilestoneCreate={() => console.log("Create milestone")}
                    onMilestoneDelete={(id) => console.log("Delete milestone", id)}
                  />
                </div>
              </TabsContent>

              <TabsContent value="management" className="mt-0 space-y-6">
                <RiskManagementDashboard 
                  risks={risks}
                  onRiskCreate={() => console.log("Create risk")}
                  onRiskDelete={(id) => console.log("Delete risk", id)}
                />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}