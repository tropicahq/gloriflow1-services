import { auth } from "~/lib/auth.server";
import { sessionContext } from "~/context";
import { redirect, type MiddlewareFunction } from "react-router";
import { APIError } from "better-auth";
export const authMiddleware: MiddlewareFunction = async ({ request, context }) => {

  try {
    const data = await auth.api.getSession({
      headers: request.headers,
      query: {
        disableCookieCache: false
      }
    })
    if (!data) {
      throw redirect("/login")
    }
    context.set(sessionContext, data)
  } catch (error) {
    console.log(error)
    if (error instanceof APIError && error.body?.code === "FAILED_TO_GET_SESSION") {
      throw redirect("/login")
    }
    throw redirect("/login")
  }

}; 