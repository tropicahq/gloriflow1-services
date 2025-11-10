import { Bell, UserIcon } from "lucide-react"
import { Button } from "~/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar"

const Header = () => {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-end px-4 md:px-6">
        <div className="flex items-center gap-5">
          {/* Notification Button */}
          <Button
            variant="ghost"
            size="icon"
            className="relative h-10 w-10 rounded-full hover:bg-secondary"
            aria-label="Notifications"
          >
            <Bell className="h-5 w-5 text-foreground" />
            <span className="absolute right-1.5 top-1.5 flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[oklch(0.45_0.15_220)] opacity-75"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-[oklch(0.45_0.15_220)]"></span>
            </span>
          </Button>

          {/* Profile Avatar */}
          <Button size={"icon"} className="border border-border/40 bg-muted text-foreground h-10 w-10 rounded-full hover:bg-secondary cursor-pointer"
            aria-label="Profile"
          >

            <UserIcon className="h-5 w-5" />
            {/* <AvatarImage src="/professional-business-person.png" alt="User profile" /> */}
            {/* <AvatarFallback className="bg-primary text-primary-foreground font-medium">U</AvatarFallback> */}
          </Button>
        </div>
      </div>
    </header>
  )
}

export default Header
