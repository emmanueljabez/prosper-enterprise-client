import { cva, type VariantProps } from 'class-variance-authority'

export { default as Badge } from './Badge.vue'

export const badgeVariants = cva(
  'inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  {
    variants: {
      variant: {
        // Existing variants
        default:
          'border-blue-200 bg-blue-100 text-blue-800',
        secondary:
          'border-purple-200 bg-purple-100 text-purple-800',
        destructive:
          'border-red-200 bg-red-100 text-red-800',
        outline: 
          'border-gray-200 text-gray-800',
        success: 
          'border-green-200 bg-green-100 text-green-800',
        warning:
          'border-amber-200 bg-amber-100 text-amber-800',
          
        // New variants
        info:
          'border-cyan-200 bg-cyan-100 text-cyan-800',
        teal:
          'border-teal-200 bg-teal-100 text-teal-800',
        indigo:
          'border-indigo-200 bg-indigo-100 text-indigo-800',
        pink:
          'border-pink-200 bg-pink-100 text-pink-800',
        orange:
          'border-orange-200 bg-orange-100 text-orange-800',
        lime:
          'border-lime-200 bg-lime-100 text-lime-800',
        dark:
          'border-gray-500 bg-gray-700 text-gray-100',
        light:
          'border-gray-100 bg-gray-50 text-gray-600',
        brown:
          'border-yellow-700 bg-yellow-50 text-yellow-800',
        navy:
          'border-blue-900 bg-blue-50 text-blue-900',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
)

export type BadgeVariants = VariantProps<typeof badgeVariants>