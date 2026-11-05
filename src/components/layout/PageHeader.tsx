/**
 * Standardized page header component for vault views.
 * Ensures consistent typography, spacing, accents, and margins across all pages,
 * whether in loading or showing states.
 *
 * Supports rendering controls (e.g. TabbedDashboard tabs and sort dropdown)
 * on the right side of the header on large screens and below the title on small screens.
 *
 * @packageDocumentation
 */

export interface PageHeaderProps {
  title: string
  accent?: string
  description?: string
  children?: React.ReactNode
  action?: React.ReactNode
  className?: string
}

export function PageHeader({
  title,
  accent,
  description,
  children,
  action,
  className = "",
}: PageHeaderProps) {
  const rightContent = children || action

  return (
    <div className={`border-border mb-6 border-b pb-4 ${className}`.trim()}>
      <div className="flex min-w-0 flex-col justify-between gap-4 lg:flex-row lg:items-end">
        <div className="min-w-0 space-y-1">
          <div className="flex items-baseline gap-2.5">
            <h1 className="font-display text-gradient-violet pt-1 text-3xl font-bold tracking-tight sm:text-4xl">
              {title}
            </h1>
            {accent && (
              <span className="font-handwriting text-accent -rotate-1 text-lg select-none">
                {accent}
              </span>
            )}
          </div>
          {description && <p className="text-muted text-xs">{description}</p>}
        </div>

        {rightContent && (
          <div className="flex w-full max-w-full min-w-0 items-center lg:w-auto">
            {rightContent}
          </div>
        )}
      </div>
    </div>
  )
}
