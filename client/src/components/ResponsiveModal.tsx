import { ReactNode } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import ResponsiveButton from "@/components/ResponsiveButton";
import { X } from "lucide-react";

interface ResponsiveModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: ReactNode;
  className?: string;
  showCloseButton?: boolean;
}

export default function ResponsiveModal({ 
  isOpen,
  onClose,
  title,
  description,
  children,
  className = "",
  showCloseButton = true
}: ResponsiveModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={`max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl ${className}`}>
        <DialogHeader>
          {title && (
            <DialogTitle className="text-lg sm:text-xl md:text-2xl">
              {title}
            </DialogTitle>
          )}
          {description && (
            <DialogDescription className="text-sm sm:text-base">
              {description}
            </DialogDescription>
          )}
        </DialogHeader>
        {children}
        {showCloseButton && (
          <div className="absolute right-4 top-4">
            <ResponsiveButton
              variant="ghost"
              size="icon"
              onClick={onClose}
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </ResponsiveButton>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}