import * as React from "react"
import { cva } from "class-variance-authority"
import { cn } from "../../lib/utils"

const buttonVariants = cva(
    "inline-flex items-center justify-center rounded-xl text-sm font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rosa-primario focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-95",
    {
        variants: {
            variant: {
                default: "bg-gradient-to-r from-rosa-secundario to-rosa-oscuro text-white shadow-lg hover:shadow-xl hover:from-rosa-oscuro hover:to-rosa-profundo backdrop-blur-sm",
                destructive: "bg-red-500 text-white hover:bg-red-600 shadow-lg hover:shadow-xl",
                outline: "border-2 border-rosa-primario/50 bg-white/60 dark:bg-gray-900/60 backdrop-blur-md hover:bg-rosa-primario/10 dark:hover:bg-rosa-primario/20 text-rosa-oscuro dark:text-rosa-primario hover:border-rosa-secundario",
                secondary: "bg-white/70 dark:bg-gray-800/70 backdrop-blur-md text-gray-900 dark:text-gray-100 hover:bg-white/90 dark:hover:bg-gray-800/90 shadow-md hover:shadow-lg",
                ghost: "hover:bg-white/40 dark:hover:bg-gray-800/40 backdrop-blur-sm text-gray-700 dark:text-gray-300 hover:text-rosa-oscuro dark:hover:text-rosa-primario",
                link: "text-rosa-oscuro dark:text-rosa-primario underline-offset-4 hover:underline",
            },
            size: {
                default: "h-10 px-4 py-2",
                sm: "h-9 rounded-lg px-3",
                lg: "h-11 rounded-xl px-8",
                icon: "h-10 w-10",
            },
        },
        defaultVariants: {
            variant: "default",
            size: "default",
        },
    }
)

const Button = React.forwardRef(({ className, variant, size, ...props }, ref) => {
    return (
        <button
            className={cn(buttonVariants({ variant, size, className }))}
            ref={ref}
            {...props}
        />
    )
})
Button.displayName = "Button"

export { Button, buttonVariants }
