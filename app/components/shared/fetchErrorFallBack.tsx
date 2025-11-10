import { useAsyncError, useRevalidator } from "react-router"
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "../ui/empty"
import { AlertCircleIcon, RefreshCcwIcon } from "lucide-react"
import { Button } from "../ui/button"


export function FetchErrorFallBack() {
  let error = useAsyncError() as Error
  let revalidator = useRevalidator()
  return (
    <Empty className="md:p-6 px-0.5">
      <EmptyHeader>
        <EmptyMedia variant={"icon"}>
          <AlertCircleIcon />
        </EmptyMedia>
        <EmptyTitle>{error.message}</EmptyTitle>
        <EmptyDescription>
          <p>
            The page you are looking at has encountered error.
          </p>
          <p>
            Try refreshing in few minutes time.
          </p>
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button disabled={revalidator.state != "idle"} variant="outline" size="lg" onClick={() => revalidator.revalidate()}>
          <RefreshCcwIcon className={`${revalidator.state == 'idle' ? '' : 'animate-spin'}`} />
          Refresh
        </Button>
      </EmptyContent>
    </Empty>
  )
}
