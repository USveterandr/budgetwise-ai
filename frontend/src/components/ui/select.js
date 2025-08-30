import * as React from "react"
import { ChevronDown } from "lucide-react"

const Select = React.forwardRef(({ className, children, ...props }, ref) => {
  return (
    <div className="relative">
      <select
        className={`flex h-10 w-full items-center justify-between rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
        ref={ref}
        {...props}
      >
        {children}
      </select>
      <ChevronDown className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400 pointer-events-none" />
    </div>
  )
})
Select.displayName = "Select"

const SelectContent = ({ children, ...props }) => (
  <div {...props}>{children}</div>
)

const SelectItem = ({ children, value, ...props }) => (
  <option value={value} {...props}>
    {children}
  </option>
)

const SelectTrigger = Select
const SelectValue = ({ placeholder, ...props }) => (
  <option value="" disabled selected hidden {...props}>
    {placeholder}
  </option>
)

export { Select, SelectContent, SelectItem, SelectTrigger, SelectValue }