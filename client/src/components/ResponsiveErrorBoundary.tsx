import { ReactNode, Component } from "react";
import ResponsiveButton from "@/components/ResponsiveButton";
import ResponsiveTypography from "@/components/ResponsiveTypography";
import { AlertTriangle } from "lucide-react";

interface ResponsiveErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ResponsiveErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

export default class ResponsiveErrorBoundary extends Component<
  ResponsiveErrorBoundaryProps,
  ResponsiveErrorBoundaryState
> {
  constructor(props: ResponsiveErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ResponsiveErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("ResponsiveErrorBoundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex flex-col items-center justify-center py-12 sm:py-16 px-4">
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-destructive/10 rounded-full flex items-center justify-center mb-6">
            <AlertTriangle className="w-8 h-8 sm:w-10 sm:h-10 text-destructive" />
          </div>
          
          <ResponsiveTypography variant="h3" align="center" className="mb-3">
            Something went wrong
          </ResponsiveTypography>
          
          <ResponsiveTypography 
            variant="p" 
            className="text-muted-foreground max-w-md mb-8 text-center"
          >
            We're sorry, but something went wrong. Please try again later.
          </ResponsiveTypography>
          
          <ResponsiveButton 
            onClick={() => {
              this.setState({ hasError: false });
              window.location.reload();
            }}
          >
            Reload Page
          </ResponsiveButton>
        </div>
      );
    }

    return this.props.children;
  }
}