import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { PlusIcon, PlayIcon, ImageIcon } from "lucide-react";

interface PortfolioItem {
  id: string;
  type: "image" | "video";
  title: string;
  url: string;
  thumbnail?: string;
  description?: string;
}

interface PortfolioGalleryProps {
  items?: PortfolioItem[];
}

export default function PortfolioGallery({ items }: PortfolioGalleryProps) {
  // Default items if none provided
  const defaultItems: PortfolioItem[] = [
    {
      id: "1",
      type: "image",
      title: "Film Scene",
      url: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=800",
      description: "Dramatic scene from independent film"
    },
    {
      id: "2",
      type: "video",
      title: "Behind the Scenes",
      url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
      thumbnail: "https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?w=800",
      description: "Making of documentary"
    },
    {
      id: "3",
      type: "image",
      title: "Character Study",
      url: "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=800",
      description: "Portrait photography"
    }
  ];

  const [selectedItem, setSelectedItem] = useState<PortfolioItem | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const galleryItems = items || defaultItems;

  const openItem = (item: PortfolioItem) => {
    setSelectedItem(item);
    setIsDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Portfolio Gallery</h3>
        <Button variant="outline" size="sm">
          <PlusIcon className="w-4 h-4 mr-2" />
          Add Media
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {galleryItems.map((item) => (
          <Card 
            key={item.id} 
            className="overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => openItem(item)}
          >
            <div className="relative aspect-video bg-muted">
              {item.type === "image" ? (
                <img 
                  src={item.url} 
                  alt={item.title} 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-black/10">
                  <img 
                    src={item.thumbnail} 
                    alt={item.title} 
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-12 h-12 bg-primary/80 rounded-full flex items-center justify-center">
                      <PlayIcon className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </div>
              )}
            </div>
            <CardContent className="p-3">
              <h4 className="font-medium text-sm truncate">{item.title}</h4>
              {item.description && (
                <p className="text-xs text-muted-foreground mt-1 truncate">
                  {item.description}
                </p>
              )}
              <div className="flex items-center mt-2">
                {item.type === "image" ? (
                  <ImageIcon className="w-3 h-3 text-muted-foreground mr-1" />
                ) : (
                  <PlayIcon className="w-3 h-3 text-muted-foreground mr-1" />
                )}
                <span className="text-xs text-muted-foreground capitalize">
                  {item.type}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>
              {selectedItem?.title}
            </DialogTitle>
          </DialogHeader>
          <div className="mt-4">
            {selectedItem?.type === "image" ? (
              <img 
                src={selectedItem.url} 
                alt={selectedItem.title} 
                className="w-full h-auto rounded-lg"
              />
            ) : (
              <div className="relative aspect-video">
                <video 
                  src={selectedItem?.url} 
                  controls 
                  className="w-full h-full rounded-lg"
                  autoPlay
                />
              </div>
            )}
            {selectedItem?.description && (
              <p className="mt-3 text-muted-foreground">
                {selectedItem.description}
              </p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}