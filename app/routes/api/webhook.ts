import { data } from "react-router"
import type { Route } from "./+types/webhook"
import { createBillPayment, flw } from "~/lib/flutterwave"
import { transactions, webhookEvents } from "~/db/schema"
import { db } from "~/lib/db"
import { resend } from "~/lib/resend"
import { eq } from "drizzle-orm"

export const loader = async ({ request }: Route.LoaderArgs) => {
    console.log(request.url)
    return data("", { status: 200 })
}
export const action = async ({ request }: Route.ActionArgs) => {

    const payload = await request.json()
    console.log(payload)
    switch (payload.event) {
        case "charge.completed":
            const existingEvent = await db.query.webhookEvents.findFirst({
                where(webhook, { eq }) {
                    return eq(webhook.paymentEventId, payload.data.id)
                },
            })
            if (existingEvent?.payload && existingEvent?.payload.status === payload.data.status) {
                // The status hasn't changed,
                // so it's probably just a duplicate event
                // and we can discard it
            } else {
                await handleChargeComplete(payload)
                await db.insert(webhookEvents).values({ payload, paymentEventId: payload.data.id })
            }
            break;
        case "singlebillpayment.status":
            await handleSingleBillPayment(payload)
            break;
        default:
            break;
    }
    // console.log(request.url)
    // console.log('=== Webhook Start ===')
    // console.log(await request.json())

    // console.log('=== Webhook Edn ===')

    return data("", { status: 200 })
}

async function handleChargeComplete(payload: any) {
    // console.log(payload)
    // const response = await flw.Transaction.verify({ id: payload.data.id });
    // if (
    //     response.data &&
    //     response.data.status === "successful"
    //     && response.data.amount === payload.data.amount
    //     && response.data.currency === payload.data.currency
    //     && response.data.tx_ref === payload.data.tx_ref)
    if (payload.data.status === "successful") {
        // Success! Confirm the customer's payment
        const { billerCode, itemCode, callbackUrl, customerNumber, billTrxRef } = payload.meta_data
        await createBillPayment(billerCode, itemCode, {
            amount: payload.data.amount,
            callback_url: callbackUrl,
            customer_id: customerNumber,
            reference: billTrxRef
        })

    } else {
        // Inform the customer their payment was unsuccessful
        // throw data("", {status: 500})
    }

}

async function handleSingleBillPayment(payload: any) {
    let transaction = await db.query.transactions.findFirst({
        where: (tx, { eq }) => eq(tx.bill_ref, payload.data.tx_ref!),
        with: {
            user: true
        }

    })
    // console
    if (transaction && payload.data.status === 'success') {
        await db.update(transactions).set({
            billStatus: 'success',
        }).where(eq(transactions.bill_ref, payload.data.tx_ref))
        await resend.emails.send({
            from: 'onboarding@resend.dev',
            to: transaction.user.email,
            subject: 'Bill Payment Successful',
            html: `<p>Your ${transaction.billType} payment of NGN ${transaction.amount} with provider ${transaction.provider} was completed successfully</p>`
        })
    }
    if (transaction && payload.data.status !== 'success') {
        await db.update(transactions).set({
            billStatus: 'failed',
        }).where(eq(transactions.bill_ref, payload.data.tx_ref))
        await resend.emails.send({
            from: 'onboarding@resend.dev',
            to: transaction.user.email,
            subject: 'Bill Payment Failed',
            html: `<p>${payload.data.message}</p>`
        })
    }
}