import { useTheme } from "@/components/ui/theme-provider"
import { Toaster as Sonner } from "sonner"

type ToasterProps = React.ComponentProps<typeof Sonner>

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-popover group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:rounded-none group-[.toaster]:font-mono group-[.toaster]:text-xs group-[.toaster]:shadow-[0_4px_16px_rgba(0,0,0,0.12)]",
          description: "group-[.toast]:text-muted-foreground",
          actionButton:
            "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground group-[.toast]:rounded-none",
          cancelButton:
            "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground group-[.toast]:rounded-none",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
