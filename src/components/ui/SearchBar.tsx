import * as React from "react";
import { Search, X } from "lucide-react";

export interface SearchBarProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  onClear?: () => void;
}

const SearchBar = React.forwardRef<HTMLInputElement, SearchBarProps>(
  ({ className = "", value, onChange, onClear, placeholder = "Cari...", ...props }, ref) => {
    const hasValue = !!value;

    return (
      <div className="relative flex items-center w-full max-w-md">
        <div className="absolute left-3.5 text-slate-400 pointer-events-none flex items-center justify-center">
          <Search size={18} />
        </div>
        <input
          type="text"
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={`
            w-full h-10 pl-10 pr-10 py-2 text-sm text-slate-800 dark:text-slate-100 bg-slate-50 dark:bg-[#0b192e] border border-slate-200/80 dark:border-slate-700/80 rounded-full outline-none
            transition-all duration-200 placeholder:text-slate-400 dark:placeholder:text-slate-500
            focus:bg-white dark:focus:bg-[#0d1d36] focus:border-blue-600 dark:focus:border-blue-500 focus:ring-1 focus:ring-blue-600/35 focus:shadow-sm
            ${className}
          `}
          ref={ref}
          {...props}
        />
        {hasValue && onClear && (
          <button
            type="button"
            onClick={onClear}
            className="absolute right-3.5 p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-700/50 transition-colors flex items-center justify-center"
          >
            <X size={14} />
          </button>
        )}
      </div>
    );
  }
);
SearchBar.displayName = "SearchBar";

export default SearchBar;
export { SearchBar };
