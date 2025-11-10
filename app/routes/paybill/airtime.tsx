import { ChevronLeft } from "lucide-react";
import type { Route } from "./+types/airtime";
import { Button } from "~/components/ui/button";
import { Await, data, Form, redirect, redirectDocument, useFetcher, useNavigate } from "react-router";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";

import { Field, FieldGroup, FieldLabel } from "~/components/ui/field";
import { Spinner } from "~/components/ui/spinner";
import { Input } from "~/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import React, { useState } from "react";
import { authMiddleware } from "~/middleware/auth";
import { generatePaymentLink, generateTxRef, getBillerInformation, getBillInformation } from "~/lib/flutterwave";
import { z } from "zod"
import { getValidatedFormData, RemixFormProvider, useRemixForm, validateFormData } from "remix-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { FetchErrorFallBack } from "~/components/shared/fetchErrorFallBack";
import BackButton from "~/components/shared/backButton";
import { AxiosError } from "axios";
import { sessionContext } from "~/context";
import { db } from "~/lib/db";
import { transactions } from "~/db/schema";
import type { CacheAxiosResponse } from "axios-cache-interceptor";

export const middleware: Route.MiddlewareFunction[] = [
  // @ts-ignore
  authMiddleware,
]
export function meta({ }: Route.MetaArgs) {
  return [
    { title: "Gloriflow1 Services | Bill Payment Airtime" },
  ];
}


export async function loader() {
  let airtimeBillerInfo = getBillInformation('AIRTIME')
  return { airtimeBillerInfo }
}
const schema = z.object({
  biller_code: z.string().nonempty("Please select a network provider"),
  amount: z.coerce.number().positive().min(100).max(50_000) as unknown as z.ZodNumber,
  phoneNumber: z.string().trim().min(11, "Phone number must be at least 11 characters").max(15, "Phone number must be at most 15 characters")
})

type FormData = z.infer<typeof schema>;

export async function action({ request, context }: Route.ActionArgs) {

  // await new Promise((res) => setTimeout(res, 3000));
  const { errors, data: receivedData, receivedValues: defaultValues } =
    await getValidatedFormData<FormData>(request, zodResolver(schema), true);

  if (errors) {
    // The keys "errors" and "defaultValues" are picked up automatically by useRemixForm
    return { errors, defaultValues };
  }
  const session = context.get(sessionContext)

  const billerCode = JSON.parse(receivedData.biller_code)
  // try {
  let itemCode

  try {
    let billerInfo = await getBillerInformation(billerCode)
    itemCode = billerInfo.data && billerInfo.data.data[0]['item_code']

    if (billerInfo.status != 200) {
      throw data("Internal Server Error", { status: 500 })
    }
  } catch (error) {
    console.log((error as AxiosError).response)
  }
  const amount = receivedData.amount + 7
  const customerNumber = (JSON.parse(receivedData.phoneNumber) as string).replace(/\s/g, '')
  let validatedCustomer: CacheAxiosResponse<any, any> | undefined
  try {
    // validatedCustomer = await validateCustomerBillDetails(itemCode, customerNumber)
  } catch (error) {
    console.log(error)
    let error_ = error as AxiosError
    let response = error_.response
    if (response?.data && !response.data.data && response.data.status === 'error') {
      throw data("Unable to validate customer Id", { status: response.status })
    } else {
      throw data("Internal Server Error")
    }
  }
  if (validatedCustomer?.data && validatedCustomer.data.status && validatedCustomer.data.status === 'success' || true) {
    const billTrxRef = generateTxRef()
    const paymentTrxRef = generateTxRef()
    const url = new URL(request.url)
    const baseUrl = `${url.protocol}//${url.host}`
    const callbackUrl = `${baseUrl}/api/webhook?res='airtime'`
    let paymentLinkRes
    try {
      paymentLinkRes = await generatePaymentLink({
        amount: amount,
        customer: {
          phone_number: customerNumber,
          email: session?.user.email!,
          name: ''
        },
        redirect_url: `${baseUrl}/payment-callback`,
        tx_ref: paymentTrxRef,
        meta: { billType: 'airtime', billerCode, itemCode, callbackUrl, customerNumber, billTrxRef }
      })
      await db.insert(transactions).values({
        userId: session?.user.id!,
        payment_ref: paymentTrxRef,
        amount: String(amount),
        billType: "airtime",
        provider: billerCode,
        customerId: customerNumber,
        bill_ref: billTrxRef
      })
    } catch (error) {
      console.log(error)
      throw data("Unable to process transaction at the moment")
    }
    throw redirect(paymentLinkRes.data.data.link)
  } else {
    throw data("Internal Server Error", { status: 500 })
  }


  // } catch (error) {
  //   console.log(error)
  //   if (error instanceof AxiosError) {
  //     throw data(error.message, { status: error.status })
  //   } else {
  //     throw data("Internal Server Error", { status: 500 })
  //   }
  // }
  // Do something with the data
  // return data;
}

export default function ({ loaderData }: Route.ComponentProps) {

  let fetcher = useFetcher()
  const form = useRemixForm({
    resolver: zodResolver(schema),
    fetcher,
    reValidateMode: "onBlur"
  })
  let { airtimeBillerInfo } = loaderData

  return (
    <main className="flex grow container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="max-w-md mx-auto w-full">
        {/**/}
        <div className="mb-4">
          <BackButton to="/" />
        </div>
        {/**/}
        <React.Suspense fallback={<h1>Loading...</h1>}>

          <Await errorElement={<FetchErrorFallBack />} resolve={airtimeBillerInfo}>
            {(value) => (
              <>
                <Card className="rounded-xl">
                  <CardHeader>
                    <CardTitle className="text-xl font-bold tracking-tight text-gray-900 sm:text-2xl">Buy Airtime</CardTitle>
                    <CardDescription className="text-sm text-gray-500">Purchase airtime for any network quickly and easy</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <RemixFormProvider {...form}>

                      <Form onSubmit={form.handleSubmit} method="post">
                        <FieldGroup>
                          <Input readOnly hidden {...form.register("biller_code")} />
                          <Field>
                            <FieldLabel htmlFor="provider">Network Provider</FieldLabel>
                            <Select onValueChange={(value) =>
                              form.setValue("biller_code", value)}>
                              <SelectTrigger className="h-10">
                                <SelectValue placeholder="Select a network" />
                              </SelectTrigger>
                              <SelectContent>
                                {value.data && (value.data.data as any[]).map(({ short_name, biller_code }, i) => {
                                  let provider = (short_name as string).split(' ')[0]
                                  return (
                                    <SelectItem value={biller_code} key={i}>{provider}</SelectItem>
                                  )
                                })}
                              </SelectContent>
                            </Select>
                            {form.formState.errors.biller_code && <p className="text-xs text-red-500">{form.formState.errors.biller_code.message}</p>}
                          </Field>
                          <Field>
                            <FieldLabel htmlFor="phoneNumber">
                              Phone Number
                            </FieldLabel>
                            <Input placeholder="e.g., 08012345678" {...form.register("phoneNumber")} type="text" className="h-10" />
                            {form.formState.errors.phoneNumber && <p className="text-xs text-red-500">{form.formState.errors.phoneNumber.message}</p>}
                          </Field>
                          <Field>
                            <FieldLabel htmlFor="amount">
                              Amount
                            </FieldLabel>
                            <div className="relative">
                              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                <span className="text-muted-foreground">₦</span>
                              </div>
                              <Input placeholder="100 - 50,000" {...form.register("amount", {
                                onChange(event) {
                                  form.setValue("amount", Number(event.target.value.replace(/\D/g, '')))
                                },
                              })

                              } id="amount" type="text" className="h-10 pl-8" />
                            </div>
                            {form.formState.errors.amount && <p className="text-xs text-red-500">{form.formState.errors.amount.message}</p>}
                          </Field>
                          <Field>
                            <Button type="submit" className="bg-blue-500 hover:bg-blue-500/90 disabled:cursor-not-allowed" disabled={form.formState.disabled} size={"lg"}>
                              {form.formState.isSubmitting && (<Spinner />)}
                              Purchase
                            </Button>
                          </Field>
                        </FieldGroup>
                      </Form>
                    </RemixFormProvider>
                  </CardContent>
                </Card>

              </>
            )}
          </Await>
        </React.Suspense>
      </div>
    </main>
  )
}




