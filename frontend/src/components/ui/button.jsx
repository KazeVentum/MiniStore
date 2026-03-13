import * as React from 'react';
import { cva } from 'class-variance-authority';
import { cn } from '../../lib/utils';

// ─────────────────────────────────────────────────────────────────────────────
// buttonVariants
//
// React concept: cva (class-variance-authority) is a helper that generates
// Tailwind class strings based on a "variant" prop. This keeps all style
// logic in one place instead of scattered across if/else blocks.
// ─────────────────────────────────────────────────────────────────────────────
const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-xl text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-default focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-95',
  {
    variants: {
      variant: {
        default:     'bg-brand-default hover:bg-brand-hover text-white shadow-sm',
        destructive: 'bg-danger hover:bg-red-600 text-white shadow-sm',
        outline:     'border-2 border-surface-border dark:border-dark-border bg-transparent hover:bg-surface-muted dark:hover:bg-white/5 text-text-primary dark:text-slate-200',
        secondary:   'bg-surface-muted dark:bg-dark-surface text-text-primary dark:text-slate-200 hover:bg-surface-border dark:hover:bg-dark-border',
        ghost:       'bg-transparent hover:bg-surface-muted dark:hover:bg-white/10 text-text-secondary dark:text-slate-300',
        link:        'text-brand-default underline-offset-4 hover:underline bg-transparent p-0',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm:      'h-8 rounded-lg px-3 text-xs',
        lg:      'h-12 rounded-xl px-6',
        icon:    'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size:    'default',
    },
  }
);

// React concept: React.forwardRef allows parent components to pass a ref
// directly into the underlying <button> DOM element.
const Button = React.forwardRef(({ className, variant, size, ...props }, ref) => {
  return (
    <button
      className={cn(buttonVariants({ variant, size, className }))}
      ref={ref}
      {...props}
    />
  );
});

Button.displayName = 'Button';

export { Button, buttonVariants };
