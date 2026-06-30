import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/lib/auth-context";
import { profiles } from "@/lib/api";
import Navigation from "@/components/Navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Search, MapPin, Star, Users, Loader2 } from "lucide-react";
import PageHeader from "@/components/PageHeader";

const DEMO_TALENT = [
  { id: "t1", first_name: "Adaeze", last_name: "Obi", location: "Lagos", avatar: null, user_roles: [{ role: "actor", skills: ["Drama", "Comedy"] }] },
  { id: "t2", first_name: "Chidi", last_name: "Okoro", location: "Abuja", avatar: null, user_roles: [{ role: "crew", skills: ["Cinematography"] }] },
  { id: "t3", first_name: "Funke", last_name: "Adeyemi", location: "Lagos", avatar: null, user_roles: [{ role: "actor", skills: ["Action", "Stunts"] }] },
  { id: "t4", first_name: "Emeka", last_name: "Nwosu", location: "Port Harcourt", avatar: null, user_roles: [{ role: "crew", skills: ["Sound Engineering"] }] },
  { id: "t5", first_name: "Ngozi", last_name: "Eze", location: "Lagos", avatar: null, user_roles: [{ role: "producer", skills: ["Project Management"] }] },
];

export default function TalentSearch() {
  const [, setLocation] = useLocation();
  const { isAuthenticated } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState("all");
  const [selectedAvailability, setSelectedAvailability] = useState("all");
  const [loading, setLoading] = useState(true);
  const [talentList, setTalentList] = useState<any[]>([]);

  useEffect(() => {
    searchTalent();
  }, [selectedRole]);

  async function searchTalent() {
    setLoading(true);
    try {
      const data = await profiles.search(searchTerm, selectedRole !== "all" ? selectedRole : undefined);
      setTalentList(data.length > 0 ? data : DEMO_TALENT);
    } catch {
      setTalentList(DEMO_TALENT);
    }
    setLoading(false);
  }

  const filteredTalent = talentList.filter(t => {
    if (searchTerm) {
      const name = `${t.first_name} ${t.last_name}`.toLowerCase();
      if (!name.includes(searchTerm.toLowerCase())) return false;
    }
    if (selectedAvailability !== "all") {
      const avail = t.user_roles?.[0]?.availability || t.availability;
      if (avail !== selectedAvailability) return false;
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-background">
      <Navigation isAuthenticated={isAuthenticated} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <PageHeader
          title="Find Talent"
          description="Discover actors, crew, and producers"
        />

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search by name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && searchTalent()}
              className="pl-10"
            />
          </div>
          <Select value={selectedRole} onValueChange={setSelectedRole}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              <SelectItem value="actor">Actors</SelectItem>
              <SelectItem value="crew">Crew</SelectItem>
              <SelectItem value="producer">Producers</SelectItem>
            </SelectContent>
          </Select>
          <Select value={selectedAvailability} onValueChange={setSelectedAvailability}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Availability" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Any Availability</SelectItem>
              <SelectItem value="available">Available</SelectItem>
              <SelectItem value="busy">Busy</SelectItem>
              <SelectItem value="unavailable">Unavailable</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={searchTalent}>Search</Button>
        </div>

        {/* Results */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : filteredTalent.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold">No talent found</h3>
              <p className="text-muted-foreground mt-1">Try adjusting your search</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredTalent.map((person) => (
              <Card
                key={person.id}
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => setLocation(`/talent/${person.id}`)}
              >
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      {person.avatar ? (
                        <img src={person.avatar} alt="" className="w-12 h-12 rounded-full object-cover" />
                      ) : (
                        <span className="text-lg font-semibold text-primary">
                          {person.first_name?.[0]}{person.last_name?.[0]}
                        </span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold truncate">{person.first_name} {person.last_name}</h3>
                      {person.location && (
                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                          <MapPin className="w-3 h-3" /> {person.location}
                        </p>
                      )}
                      <div className="flex flex-wrap gap-1 mt-2">
                        {person.user_roles?.map((r: any, i: number) => (
                          <Badge key={i} variant="secondary" className="text-xs">
                            {r.role}
                          </Badge>
                        ))}
                      </div>
                      {person.user_roles?.[0]?.skills && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {person.user_roles[0].skills.slice(0, 3).map((s: string, i: number) => (
                            <Badge key={i} variant="outline" className="text-xs">
                              {s}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
