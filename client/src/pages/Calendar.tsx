import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import Navigation from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, MapPin, Loader2 } from "lucide-react";
import PageHeader from "@/components/PageHeader";

const DEMO_EVENTS = [
  { id: "e1", title: "Audition: Lagos Blues 2", date: "2025-07-15", time: "10:00 AM", type: "audition", location: "Lagos" },
  { id: "e2", title: "Table Read: The Heist", date: "2025-07-18", time: "2:00 PM", type: "meeting", location: "Abuja" },
  { id: "e3", title: "Self-tape Deadline: Love in Lagos", date: "2025-07-20", time: "11:59 PM", type: "deadline", location: "" },
  { id: "e4", title: "Shoot Day 1: The Heist", date: "2025-07-22", time: "6:00 AM", type: "shoot", location: "Abuja" },
];

const TYPE_COLORS: Record<string, string> = {
  audition: "bg-blue-100 text-blue-800",
  meeting: "bg-purple-100 text-purple-800",
  deadline: "bg-red-100 text-red-800",
  shoot: "bg-green-100 text-green-800",
};

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

export default function CalendarPage() {
  const { profile, isAuthenticated } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadEvents(); }, []);

  async function loadEvents() {
    setLoading(true);
    // Calendar events are demo-based for now
    setEvents(DEMO_EVENTS);
    setLoading(false);
  }

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = new Date();

  const prevMonth = () => setCurrentDate(new Date(year, month - 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1));

  function getEventsForDay(day: number) {
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    return events.filter(e => e.date === dateStr);
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation isAuthenticated={isAuthenticated} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <PageHeader title="Calendar" description="Your schedule at a glance" />

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <Button variant="ghost" size="icon" onClick={prevMonth}><ChevronLeft className="w-5 h-5" /></Button>
              <CardTitle>{MONTHS[month]} {year}</CardTitle>
              <Button variant="ghost" size="icon" onClick={nextMonth}><ChevronRight className="w-5 h-5" /></Button>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
            ) : (
              <>
                <div className="grid grid-cols-7 gap-1">
                  {DAYS.map(d => <div key={d} className="text-center text-xs font-medium text-muted-foreground py-2">{d}</div>)}
                  {Array.from({ length: firstDay }).map((_, i) => <div key={`empty-${i}`} />)}
                  {Array.from({ length: daysInMonth }).map((_, i) => {
                    const day = i + 1;
                    const dayEvents = getEventsForDay(day);
                    const isToday = today.getFullYear() === year && today.getMonth() === month && today.getDate() === day;
                    return (
                      <div key={day} className={`min-h-[80px] p-1 border rounded-lg ${isToday ? "bg-primary/5 border-primary" : ""}`}>
                        <p className={`text-sm font-medium ${isToday ? "text-primary" : ""}`}>{day}</p>
                        {dayEvents.slice(0, 2).map((e: any) => (
                          <div key={e.id} className={`text-xs px-1 py-0.5 rounded mt-0.5 truncate ${TYPE_COLORS[e.type] || "bg-muted"}`}>
                            {e.title}
                          </div>
                        ))}
                        {dayEvents.length > 2 && <p className="text-xs text-muted-foreground">+{dayEvents.length - 2} more</p>}
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
