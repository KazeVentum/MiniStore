import * as React from "react"
import { cn } from "../../lib/utils"

const Input = React.forwardRef(({ className, type, ...props }, ref) => {
    return (
        <input
            type={type}
            className={cn(
                "flex h-10 w-full rounded-xl border-2 border-white/40 dark:border-white/20 bg-white/70 dark:bg-gray-900/70 backdrop-blur-md px-3 py-2 text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rosa-primario focus-visible:ring-offset-0 focus-visible:border-rosa-secundario disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200",
                className
            )}
            ref={ref}
            {...props}
        />
    )
})
Input.displayName = "Input"

export { Input }
