import { ReactNode } from 'react';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  description?: string;
  actions?: ReactNode;
  rightActions?: ReactNode;
  children?: ReactNode;
}

export default function PageHeader({ title, subtitle, description, actions, rightActions, children }: PageHeaderProps) {
  const displaySubtitle = subtitle || description;
  const actionContent = actions || rightActions || children;

  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">{title}</h1>
        {displaySubtitle ? (
          <p className="text-muted-foreground">{displaySubtitle}</p>
        ) : null}
      </div>
      {actionContent ? (
        <div className="flex items-center gap-2">{actionContent}</div>
      ) : null}
    </div>
  );
}
