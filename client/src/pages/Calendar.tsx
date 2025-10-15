import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CalendarIcon, PlusIcon } from "lucide-react";
import { useAuth } from "@/lib/auth";
import PageHeader from "@/components/PageHeader";

interface CalendarEvent {
  id: string;
  title: string;
  date: Date;
  type: "shoot" | "meeting" | "audition" | "deadline";
  projectId?: string;
  description?: string;
}

export default function Calendar() {
  const { user } = useAuth();
  const [events, setEvents] = useState<CalendarEvent[]>([
    {
      id: "1",
      title: "Scene 12A Shoot",
      date: new Date(new Date().setDate(new Date().getDate() + 2)),
      type: "shoot",
      description: "Main location shoot with lead actors"
    },
    {
      id: "2",
      title: "Casting Call",
      date: new Date(new Date().setDate(new Date().getDate() + 5)),
      type: "audition",
      description: "Auditions for supporting roles"
    },
    {
      id: "3",
      title: "Budget Review",
      date: new Date(new Date().setDate(new Date().getDate() + 7)),
      type: "meeting",
      description: "Financial planning session with producers"
    }
  ]);

  const getEventColor = (type: string) => {
    switch (type) {
      case "shoot": return "bg-red-500";
      case "meeting": return "bg-blue-500";
      case "audition": return "bg-green-500";
      case "deadline": return "bg-yellow-500";
      default: return "bg-gray-500";
    }
  };

  return (
    <div className="container py-6">
      <PageHeader 
        title="Production Calendar" 
        description="Manage your film production schedule and important dates"
      >
        <Button>
          <PlusIcon className="w-4 h-4 mr-2" />
          Add Event
        </Button>
      </PageHeader>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar View */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <CalendarIcon className="w-5 h-5 mr-2" />
                October 2025
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-7 gap-1 mb-2">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <div key={day} className="text-center font-medium text-muted-foreground py-2">
                    {day}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-1">
                {/* Calendar days - simplified for demo */}
                {Array.from({ length: 31 }, (_, i) => i + 1).map(day => {
                  const hasEvents = events.some(event => event.date.getDate() === day);
                  return (
                    <div 
                      key={day} 
                      className={`min-h-24 p-1 border rounded ${hasEvents ? 'bg-muted' : ''}`}
                    >
                      <div className="font-medium">{day}</div>
                      {events
                        .filter(event => event.date.getDate() === day)
                        .slice(0, 2)
                        .map(event => (
                          <div 
                            key={event.id} 
                            className={`text-xs p-1 mb-1 rounded text-white ${getEventColor(event.type)}`}
                          >
                            {event.title}
                          </div>
                        ))}
                      {events.filter(event => event.date.getDate() === day).length > 2 && (
                        <div className="text-xs text-muted-foreground">
                          +{events.filter(event => event.date.getDate() === day).length - 2} more
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Upcoming Events */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Events</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {events
                .filter(event => event.date >= new Date())
                .sort((a, b) => a.date.getTime() - b.date.getTime())
                .slice(0, 5)
                .map(event => (
                  <div key={event.id} className="flex items-start space-x-3">
                    <div className={`w-3 h-3 rounded-full mt-2 ${getEventColor(event.type)}`}></div>
                    <div>
                      <h4 className="font-medium">{event.title}</h4>
                      <p className="text-sm text-muted-foreground">
                        {event.date.toLocaleDateString()} - {event.type}
                      </p>
                      {event.description && (
                        <p className="text-sm mt-1">{event.description}</p>
                      )}
                    </div>
                  </div>
                ))}
              
              {events.filter(event => event.date >= new Date()).length === 0 && (
                <p className="text-muted-foreground text-center py-4">
                  No upcoming events
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}