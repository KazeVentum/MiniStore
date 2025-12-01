import * as React from "react"
import { cn } from "../../lib/utils"

const Select = React.forwardRef(({ className, children, ...props }, ref) => {
    return (
        <select
            className={cn(
                "flex h-10 w-full rounded-xl border-2 border-white/40 dark:border-white/20 bg-white/70 dark:bg-gray-900/70 backdrop-blur-md px-3 py-2 text-sm text-gray-900 dark:text-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rosa-primario focus-visible:ring-offset-0 focus-visible:border-rosa-secundario disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200 cursor-pointer",
                className
            )}
            ref={ref}
            {...props}
        >
            {children}
        </select>
    )
})
Select.displayName = "Select"

export { Select }
