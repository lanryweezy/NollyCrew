import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Upload, Loader2, X, File, Image } from "lucide-react";

interface FileUploadProps {
  accept?: string;
  onUpload: (file: { id: string; url: string; filename: string }) => void;
  maxSize?: number; // in MB
  label?: string;
}

export default function FileUpload({ accept = "*/*", onUpload, maxSize = 10, label = "Upload file" }: FileUploadProps) {
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > maxSize * 1024 * 1024) {
      toast({ title: "File too large", description: `Max size is ${maxSize}MB`, variant: "destructive" });
      return;
    }

    setSelectedFile(file);
  }

  async function handleUpload() {
    if (!selectedFile) return;
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);

      const res = await fetch("/api/upload", {
        method: "POST",
        headers: { Authorization: `Bearer ${localStorage.getItem("nollycrew_token") || ""}` },
        body: formData,
      });

      if (!res.ok) throw new Error("Upload failed");
      const data = await res.json();

      toast({ title: "File uploaded!" });
      onUpload(data);
      setSelectedFile(null);
      if (fileRef.current) fileRef.current.value = "";
    } catch {
      toast({ title: "Upload failed", variant: "destructive" });
    }
    setUploading(false);
  }

  const isImage = selectedFile?.type.startsWith("image/");

  return (
    <div className="space-y-3">
      <input
        ref={fileRef}
        type="file"
        accept={accept}
        onChange={handleFileSelect}
        className="hidden"
      />

      {selectedFile ? (
        <div className="flex items-center gap-3 p-3 border rounded-lg bg-muted/50">
          {isImage ? (
            <Image className="w-8 h-8 text-muted-foreground" />
          ) : (
            <File className="w-8 h-8 text-muted-foreground" />
          )}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{selectedFile.name}</p>
            <p className="text-xs text-muted-foreground">{(selectedFile.size / 1024).toFixed(1)} KB</p>
          </div>
          <Button variant="ghost" size="sm" onClick={() => { setSelectedFile(null); if (fileRef.current) fileRef.current.value = ""; }}>
            <X className="w-4 h-4" />
          </Button>
        </div>
      ) : (
        <Button variant="outline" className="w-full" onClick={() => fileRef.current?.click()}>
          <Upload className="w-4 h-4 mr-2" /> {label}
        </Button>
      )}

      {selectedFile && (
        <Button onClick={handleUpload} className="w-full" disabled={uploading}>
          {uploading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Upload className="w-4 h-4 mr-2" />}
          Upload {selectedFile.name}
        </Button>
      )}
    </div>
  );
}

interface AvatarUploadProps {
  currentAvatar?: string | null;
  onUpload: (url: string) => void;
}

export function AvatarUpload({ currentAvatar, onUpload }: AvatarUploadProps) {
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast({ title: "Image too large", description: "Max size is 5MB", variant: "destructive" });
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("avatar", file);

      const res = await fetch("/api/profile/avatar", {
        method: "PUT",
        headers: { Authorization: `Bearer ${localStorage.getItem("nollycrew_token") || ""}` },
        body: formData,
      });

      if (!res.ok) throw new Error("Upload failed");
      const data = await res.json();

      toast({ title: "Avatar updated!" });
      onUpload(data.avatarUrl);
    } catch {
      toast({ title: "Upload failed", variant: "destructive" });
    }
    setUploading(false);
  }

  return (
    <div className="relative group">
      <input ref={fileRef} type="file" accept="image/*" onChange={handleUpload} className="hidden" />
      <div
        className="w-24 h-24 rounded-full bg-muted flex items-center justify-center cursor-pointer overflow-hidden"
        onClick={() => fileRef.current?.click()}
      >
        {currentAvatar ? (
          <img src={currentAvatar} alt="Avatar" className="w-full h-full object-cover" />
        ) : (
          <Upload className="w-8 h-8 text-muted-foreground" />
        )}
      </div>
      <div className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer" onClick={() => fileRef.current?.click()}>
        {uploading ? (
          <Loader2 className="w-6 h-6 text-white animate-spin" />
        ) : (
          <Upload className="w-6 h-6 text-white" />
        )}
      </div>
    </div>
  );
}
