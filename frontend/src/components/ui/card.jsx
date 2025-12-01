import * as React from "react"
import { cn } from "../../lib/utils"

const Card = React.forwardRef(({ className, ...props }, ref) => (
    <div
        ref={ref}
        className={cn(
            "rounded-2xl backdrop-blur-xl bg-white/90 dark:bg-white/10 border border-white/50 dark:border-white/20 shadow-xl dark:shadow-2xl dark:shadow-pink-500/10 text-gray-900 dark:text-gray-100 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 hover:bg-white/95 dark:hover:bg-white/15 dark:hover:border-pink-400/30 dark:hover:shadow-pink-500/20",
            className
        )}
        {...props}
    />
))
Card.displayName = "Card"

const CardHeader = React.forwardRef(({ className, ...props }, ref) => (
    <div
        ref={ref}
        className={cn("flex flex-col space-y-1.5 p-6", className)}
        {...props}
    />
))
CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef(({ className, ...props }, ref) => (
    <h3
        ref={ref}
        className={cn(
            "text-2xl font-semibold leading-none tracking-tight text-rosa-oscuro dark:text-rosa-primario",
            className
        )}
        {...props}
    />
))
CardTitle.displayName = "CardTitle"

const CardContent = React.forwardRef(({ className, ...props }, ref) => (
    <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
))
CardContent.displayName = "CardContent"

export { Card, CardHeader, CardTitle, CardContent }
