import { ReactNode } from 'react';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  rightActions?: ReactNode;
}

export default function PageHeader({ title, subtitle, rightActions }: PageHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">{title}</h1>
        {subtitle ? (
          <p className="text-muted-foreground">{subtitle}</p>
        ) : null}
      </div>
      {rightActions ? (
        <div className="flex items-center gap-2">{rightActions}</div>
      ) : null}
    </div>
  );
}


