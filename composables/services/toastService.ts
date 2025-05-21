import { useToast } from '@/components/ui/toast'

export interface ToastOptions {
  title?: string
  description?: string
  variant?: 'default' | 'destructive' | null | undefined
  duration?: number
}

export function useAppToast() {
  const { toast } = useToast()

  const showToast = (options: ToastOptions) => {
    toast({
      title: options.title || 'Notification',
      description: options.description,
      variant: options.variant || 'default',
      duration: options.duration || 3000,
    })
  }

  const success = (description: string, title = 'Success') => {
    showToast({
      title,
      description,
      variant: 'default',
    })
  }

  const error = (description: string, title = 'Error') => {
    showToast({
      title,
      description,
      variant: 'destructive',
    })
  }

  const warning = (description: string, title = 'Warning') => {
    showToast({
      title,
      description,
      variant: 'destructive',
    })
  }

  const info = (description: string, title = 'Information') => {
    showToast({
      title,
      description,
      variant: 'default',
    })
  }

  return {
    showToast,
    success,
    error,
    warning,
    info,
  }
}