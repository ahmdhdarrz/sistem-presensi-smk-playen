import React from "react";

export function PageHeader({ title, description, actions }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 pb-3 sm:pb-6 border-b border-border/60 mb-4 sm:mb-6">
      <div className="space-y-1 text-left min-w-0">
        <h1 className="text-lg sm:text-2xl font-bold tracking-tight text-foreground my-0 break-words">
          {title}
        </h1>
        {description && (
          <p className="text-xs sm:text-sm text-muted-foreground leading-snug">
            {description}
          </p>
        )}
      </div>
      {actions && (
        <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
          {actions}
        </div>
      )}
    </div>
  );
}

export default PageHeader;
