import * as React from 'react';
import { cn } from '../../lib/utils';

// ─────────────────────────────────────────────────────────────────────────────
// Card primitives
//
// React concept: React.forwardRef lets parent components attach a ref to the
// underlying DOM element (e.g. to measure its size or call focus()).
// These are "primitive" UI components — they are purely structural and accept
// any className overrides via the `cn()` helper.
// ─────────────────────────────────────────────────────────────────────────────

const Card = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'bg-surface-card dark:bg-dark-surface border border-surface-border dark:border-dark-border rounded-2xl shadow-sm text-text-primary dark:text-slate-100',
      className
    )}
    {...props}
  />
));
Card.displayName = 'Card';

const CardHeader = React.forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('flex flex-col space-y-1.5 p-6', className)} {...props} />
));
CardHeader.displayName = 'CardHeader';

const CardTitle = React.forwardRef(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn('text-lg font-semibold leading-tight text-text-primary dark:text-white', className)}
    {...props}
  />
));
CardTitle.displayName = 'CardTitle';

const CardContent = React.forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('p-6 pt-0', className)} {...props} />
));
CardContent.displayName = 'CardContent';

export { Card, CardHeader, CardTitle, CardContent };
