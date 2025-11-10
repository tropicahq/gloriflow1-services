import { Outlet } from "react-router";
import type { Route } from "./+types/_layout";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "~/components/ui/empty"
import { AlertCircleIcon } from "lucide-react";
import BackButton from "~/components/shared/backButton";

export function ErrorBoundary({
  error,
}: Route.ErrorBoundaryProps) {
  console.log(error)
  return (
    <main className="flex grow container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="max-w-md mx-auto w-full">
        {/**/}
        <div className="mb-4">
          <BackButton to="/" />
        </div>
        {/**/}
        <Empty className="md:p-6 px-0.5">
          <EmptyHeader>
            <EmptyMedia variant={"icon"}>
              <AlertCircleIcon />
            </EmptyMedia>
            <EmptyTitle>{error.status} - Error</EmptyTitle>
            <EmptyDescription>
              <p>
                {error.data}
              </p>
              {/* <p>
                Try refreshing in few minutes time.
              </p> */}
            </EmptyDescription>
          </EmptyHeader>
          {/* <EmptyContent>
            <Button disabled={revalidator.state != "idle"} variant="outline" size="lg" onClick={() => revalidator.revalidate()}>
              <RefreshCcwIcon className={`${revalidator.state == 'idle' ? '' : 'animate-spin'}`} />
              Refresh
            </Button>
          </EmptyContent> */}
        </Empty>
      </div>
    </main>
  )
}

export default function Layout() {
  return (
    <>
      <Outlet />
    </>
  )
}
