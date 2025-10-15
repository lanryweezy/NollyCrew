import { Progress } from "@/components/ui/progress";
import ResponsiveTypography from "@/components/ResponsiveTypography";

interface ResponsiveProgressBarProps {
  value: number;
  max?: number;
  label?: string;
  showPercentage?: boolean;
  className?: string;
}

export default function ResponsiveProgressBar({ 
  value,
  max = 100,
  label,
  showPercentage = true,
  className = ""
}: ResponsiveProgressBarProps) {
  const percentage = Math.round((value / max) * 100);

  return (
    <div className={className}>
      {(label || showPercentage) && (
        <div className="flex justify-between items-center mb-2">
          {label && (
            <ResponsiveTypography variant="p" className="font-medium">
              {label}
            </ResponsiveTypography>
          )}
          {showPercentage && (
            <ResponsiveTypography variant="p" className="text-muted-foreground">
              {percentage}%
            </ResponsiveTypography>
          )}
        </div>
      )}
      <Progress value={percentage} className="h-2 sm:h-3" />
    </div>
  );
}import { Progress } from "@/components/ui/progress";
import ResponsiveTypography from "@/components/ResponsiveTypography";

interface ResponsiveProgressBarProps {
  value: number;
  max?: number;
  label?: string;
  showPercentage?: boolean;
  className?: string;
}

export default function ResponsiveProgressBar({ 
  value,
  max = 100,
  label,
  showPercentage = true,
  className = ""
}: ResponsiveProgressBarProps) {
  const percentage = Math.round((value / max) * 100);

  return (
    <div className={className}>
      {(label || showPercentage) && (
        <div className="flex justify-between items-center mb-2">
          {label && (
            <ResponsiveTypography variant="p" className="font-medium">
              {label}
            </ResponsiveTypography>
          )}
          {showPercentage && (
            <ResponsiveTypography variant="p" className="text-muted-foreground">
              {percentage}%
            </ResponsiveTypography>
          )}
        </div>
      )}
      <Progress value={percentage} className="h-2 sm:h-3" />
    </div>
  );
}