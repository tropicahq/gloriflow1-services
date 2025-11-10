import { Form, redirect, useActionData, useFetcher, useRouteError } from "react-router";
import { Field, FieldDescription, FieldGroup, FieldLabel } from "~/components/ui/field";
import { AlertCircleIcon, CheckCircle2Icon, GalleryVerticalEnd } from "lucide-react"
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import type { Route } from "./+types/login";
import { Spinner } from "~/components/ui/spinner";
import { auth } from "~/lib/auth.server";
import { APIError } from "better-auth";
import { Alert, AlertTitle } from "~/components/ui/alert"
import { DrizzleError, DrizzleQueryError } from "drizzle-orm";
import z from "zod";
import { getValidatedFormData, RemixFormProvider, useRemixForm } from "remix-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { HttpStatusCode } from "axios";
import { useEffect } from "react";

export function meta({ }: Route.MetaArgs) {
  return [
    {
      title: "Gloriflow1 Services | Login"
    }
  ]
}

const schema = z.object({
  email: z.email()
})
type ActionErrorType = "default" | "zod" | "auth" | "none"
export async function action({ request }: Route.ActionArgs) {
  try {
    const { receivedValues, errors, data } = await getValidatedFormData(request, zodResolver(schema))

    if (errors) {
      return { errType: ("zod" as ActionErrorType), errors, defaultValue: receivedValues }
    }
    // const email = formData.get("email")! as string
    // if (!email) {
    //   throw new Error("Please provide your email address")
    // }
    const resp = await auth.api.signInMagicLink({
      body: {
        email: data.email,
        callbackURL: "/",
      },
      headers: request.headers
    })
    return { errType: ("none" as ActionErrorType), ...resp }
  } catch (error) {
    console.log(error)
    let err
    if (error instanceof DrizzleQueryError) {
      return { errType: ("default" as ActionErrorType), error: "Internal Server Error" }
    }
    if (error instanceof APIError) {
      return { errType: ("auth" as ActionErrorType), error: error.message }
    }
    if (error instanceof Error) {
      return { errType: ("default" as ActionErrorType), error: error.message }
    }
  }

}

export default function Auth({ actionData }: Route.ComponentProps) {
  let routeError = useRouteError() as Error
  const form = useRemixForm({
    resolver: zodResolver(schema),
    resetOptions: { keepValues: false }
    // actionData,
  })
  useEffect(() => {
    if (!actionData?.errType) {
      form.reset(undefined, {})
    }
  }, [actionData])
  console.log(actionData)
  return (
    <main className="flex flex-col md:flex-1 items-center py-16 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-sm space-y-7">

        <RemixFormProvider {...form}>

          <Form onSubmit={form.handleSubmit} method="post" action="/login" noValidate={true} >
            <FieldGroup>
              <div className="flex flex-col items-center gap-2 text-center">
                <a
                  href="#"
                  className="flex flex-col items-center gap-2 font-medium"
                >
                  <div className="flex size-8 items-center justify-center rounded-md">
                    <GalleryVerticalEnd className="size-6" />
                  </div>
                  <span className="sr-only">Gloriflow1 Services</span>
                </a>
                <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">Welcome to Gloriflow1</h1>
                <FieldDescription className="text-gray-500 text-base">
                  Sigin to access and pay bills
                </FieldDescription>
                {!form.formState.isSubmitting && actionData?.errType && actionData?.errType !== "none" && actionData?.errType !== "zod" && (
                  <Alert variant={"destructive"}>
                    <AlertCircleIcon />
                    <AlertTitle>{actionData.error}</AlertTitle>
                  </Alert>
                )}
                {!form.formState.isSubmitting && actionData?.errType == "none" && (
                  <Alert variant={"success"}>
                    <CheckCircle2Icon />
                    <AlertTitle>We have sent a verification link to your email</AlertTitle>
                  </Alert>
                )}
              </div>
              <Field>
                <FieldLabel htmlFor="email" className="text-gray-900">Email</FieldLabel>
                <Input id="email" type="email" {...form.register("email")} placeholder="me@example.com" className="h-10" />
                {form.formState.errors.email && <p className="text-xs text-red-500">{form.formState.errors.email.message}</p>}
              </Field>

              <Field>
                <Button className="bg-blue-500 hover:bg-blue-500/90" disabled={form.formState.disabled} size={"lg"}>
                  {form.formState.isSubmitting && (<Spinner />)}
                  Get magic link</Button>
              </Field>
            </FieldGroup>
          </Form >
        </RemixFormProvider>

        <FieldDescription className="px-6 text-center">
          By clicking continue, you agree to our <a href="#">Terms of Service</a>{" "}
          and <a href="#">Privacy Policy</a>.
        </FieldDescription>
      </div>
    </main>
  )
}
