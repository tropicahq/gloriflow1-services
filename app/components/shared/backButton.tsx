import { useNavigate } from "react-router"
import { Button } from "../ui/button"
import { ChevronLeft } from "lucide-react"

const BackButton = ({ to }: { to: string }) => {
  const navigate = useNavigate()
  return (

    <Button onClick={() => navigate("/", {
      replace: true
    })} variant={"outline"} className="gap-2 text-sm font-medium text-text-secondary-light hover:text-primary">
      <ChevronLeft />
      Back to Home
    </Button>

  )
}

export default BackButton
