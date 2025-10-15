import { Toast, ToastClose, ToastDescription, ToastProvider, ToastTitle, ToastViewport } from "@/components/ui/toast";
import { useToast } from "@/hooks/use-toast";

export function ResponsiveToastProvider() {
  const { toasts } = useToast();

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, ...props }: any) {
        return (
          <Toast key={id} {...props} className="max-w-xs sm:max-w-sm md:max-w-md">
            <div className="grid gap-1">
              {title && <ToastTitle className="text-sm sm:text-base">{title}</ToastTitle>}
              {description && (
                <ToastDescription className="text-xs sm:text-sm">
                  {description}
                </ToastDescription>
              )}
            </div>
            {action}
            <ToastClose />
          </Toast>
        );
      })}
      <ToastViewport className="fixed top-0 right-0 z-[100] flex max-h-screen w-full flex-col p-4 sm:p-6" />
    </ToastProvider>
  );
}