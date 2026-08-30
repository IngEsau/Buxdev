'use client'

import { useToast } from '@/hooks/use-toast'
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from '@/components/ui/toast'
import { useLanguage } from '@/hooks/use-language'

export function Toaster() {
  const { toasts } = useToast()
  const { t } = useLanguage()

  return (
    <ToastProvider label={t.common.notificationLabel}>
      {toasts.map(function ({ id, title, description, action, ...props }) {
        return (
          <Toast key={id} {...props}>
            <div className="grid gap-1">
              {title && <ToastTitle>{title}</ToastTitle>}
              {description && (
                <ToastDescription>{description}</ToastDescription>
              )}
            </div>
            {action}
            <ToastClose aria-label={t.common.closeNotification} />
          </Toast>
        )
      })}
      <ToastViewport />
    </ToastProvider>
  )
}
