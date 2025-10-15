import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ResponsiveTooltipProps {
  children: React.ReactNode;
  content: React.ReactNode;
  side?: "top" | "right" | "bottom" | "left";
  align?: "start" | "center" | "end";
  className?: string;
}

export default function ResponsiveTooltip({ 
  children,
  content,
  side = "top",
  align = "center",
  className = ""
}: ResponsiveTooltipProps) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          {children}
        </TooltipTrigger>
        <TooltipContent 
          side={side} 
          align={align}
          className={`text-xs sm:text-sm max-w-xs sm:max-w-sm ${className}`}
        >
          {content}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}