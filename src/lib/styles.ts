/**
 * Shared style constants and utilities
 * Centralizes repeated Tailwind patterns for consistency
 */

// Border radius scale - maps to Tailwind rounded classes
export const borderRadius = {
    none: "rounded-none",
    sm: "rounded-sm", 
    md: "rounded-md",
    lg: "rounded-lg",
    xl: "rounded-xl",
    "2xl": "rounded-2xl",
    "3xl": "rounded-3xl",
    full: "rounded-full",
} as const;

// Shadow scale - maps to Tailwind shadow classes
export const boxShadow = {
    none: "shadow-none",
    sm: "shadow-sm",
    md: "shadow-md", 
    lg: "shadow-lg",
    xl: "shadow-xl",
    "2xl": "shadow-2xl",
} as const;

// Default fallback values
export const defaults = {
    rounded: "rounded-xl",
    shadow: "shadow-md",
} as const;

// Common transition durations
export const transition = {
    default: "transition-all duration-300",
    fast: "transition-all duration-200",
    slow: "transition-all duration-500",
} as const;

// Brand color utilities
export const brand = {
    text: "text-brand",
    bg: "bg-brand",
    border: "border-brand",
    hover: "hover:text-brand",
} as const;

// Spacing scale (rem-based for consistency)
export const spacing = {
    xs: "0.5rem",
    sm: "0.75rem", 
    md: "1rem",
    lg: "1.5rem",
    xl: "2rem",
} as const;

// Typography scale
export const typography = {
    xs: "text-xs",
    sm: "text-sm",
    base: "text-base",
    lg: "text-lg",
    xl: "text-xl",
    "2xl": "text-2xl",
    "3xl": "text-3xl",
    "4xl": "text-4xl",
    "5xl": "text-5xl",
} as const;