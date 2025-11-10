import { auth } from '~/lib/auth.server' // Adjust the path as necessary

import type { Route } from "./+types/auth"

export const loader = async ({ request }: Route.LoaderArgs) => {
  return auth.handler(request)
}
export const action = async ({ request }: Route.ActionArgs) => {
  return auth.handler(request)
}

