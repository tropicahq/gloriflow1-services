import { data, Link, redirect } from "react-router"
import type { Route } from "./+types/payment-callback"
import { db } from "~/lib/db"
import { billTypeEnum, transactions } from "~/db/schema"
import { Check, X } from "lucide-react"
import { flw } from "~/lib/flutterwave"
import { authMiddleware } from "~/middleware/auth"
import { eq } from "drizzle-orm"

export const middleware: Route.MiddlewareFunction[] = [
    // @ts-ignore
    authMiddleware,
]

export const loader = async ({ request }: Route.LoaderArgs) => {
    const url = new URL(request.url)
    let param = url.searchParams
    let queryStatus = param.get('status')
    let queryTxRef = param.get('tx_ref')
    let queryTxId = param.get('transaction_id')
    if (!queryStatus && !queryTxRef && !queryTxId) {
        throw redirect('/')
    }

    let transaction = await db.query.transactions.findFirst({
        where: (tx, { eq }) => eq(tx.payment_ref, queryTxRef!),
        with: {
            user: true
        }

    })
    if (!transaction || transaction?.paymentStatus === "failed" || transaction?.paymentStatus === 'completed') {
        throw redirect('/')
    }
    const response = await flw.Transaction.verify({ id: queryTxId! });
    if (import.meta.env.DEV) {
        console.log("RESP: ", response.data)
    }
    // if (!response.data) {
    // }
    if (response.data) {
        if (queryStatus && queryStatus == 'completed') {
            console.log(response.data.status === "successful"
                && response.data.amount === Number(transaction?.amount)
                && response.data.currency === "NGN")
            if (
                response.data.status === "successful"
                && response.data.amount === Number(transaction?.amount)
                && response.data.currency === "NGN") {
                await db.update(transactions).set({
                    flwPaymentTrxId: queryTxId,
                    paymentCompletedAt: new Date(response.data.created_at),
                    paymentStatus: 'completed',
                    payment_flw_ref: response.data.flw_ref ?? null
                }).where(eq(transactions.payment_ref, queryTxRef!))
                // Success! Confirm the customer's payment
                return {
                    status: 'successful',
                    transactionId: queryTxRef,
                    email: transaction?.user.email,
                    amount: transaction?.amount,
                    date: transaction?.createdAt,
                    billType: transaction.billType
                }
            } else {
                await db.update(transactions).set({
                    flwPaymentTrxId: queryTxId,
                    paymentFailedAt: new Date(response.data.created_at),
                    paymentStatus: 'failed',
                    payment_flw_ref: response.data.flw_ref ?? null
                }).where(eq(transactions.payment_ref, queryTxRef!))
                // Inform the customer their payment was unsuccessful
                return {
                    status: 'failed',
                    transactionId: queryTxRef,
                    email: transaction?.user.email,
                    amount: transaction?.amount,
                    date: transaction?.createdAt,
                    billType: transaction.billType
                }
            }
        } else {
            if (queryStatus === "failed") {
                await db.update(transactions).set({
                    flwPaymentTrxId: queryTxId,
                    paymentFailedAt: new Date(response.data.created_at),
                    paymentStatus: 'failed',
                    payment_flw_ref: response.data.flw_ref ?? null
                }).where(eq(transactions.payment_ref, queryTxRef!))
            }
            return {
                status: 'failed',
                transactionId: queryTxRef,
                email: transaction?.user.email,
                amount: transaction?.amount,
                date: transaction?.createdAt,
                billType: transaction.billType
            }
        }
    } else {
        console.log("[Not Verified] ", response)
        throw redirect('/')
    }
    // if()
    // transaction[0]
    // throw redirect('/')
    // return data("", { status: 200 })
}

export default function ({ loaderData }: Route.ComponentProps) {
    const dateFormatter = new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
    })
    return (
        <main className="flex grow container mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="max-w-md mx-auto w-full">
                <HeadLine status={loaderData?.status!} />
                {/* <!-- Transaction Details --> */}
                <div className="w-full bg-white dark:bg-background-dark border border-slate-200  rounded-xl p-4 sm:p-6 mb-8">
                    <div className="flex justify-between gap-x-6 py-2.5 border-b border-slate-100 ">
                        <p className="text-slate-500  text-sm font-normal leading-normal">Amount</p>
                        <p className="text-slate-800 text-sm font-medium leading-normal text-right">NGN {loaderData?.amount}</p>
                    </div>
                    <div className="flex justify-between gap-x-6 py-2.5 border-b border-slate-100 ">
                        <p className="text-slate-500  text-sm font-normal leading-normal">Bill</p>
                        <p className="text-slate-800 text-sm font-medium leading-normal text-right">{loaderData?.billType}</p>
                    </div>
                    <div className="flex justify-between gap-x-6 py-2.5 border-b border-slate-100 ">
                        <p className="text-slate-500  text-sm font-normal leading-normal">Recipient</p>
                        <p className="text-slate-800 text-sm font-medium leading-normal text-right">{loaderData?.email}</p>
                    </div>
                    <div className="flex justify-between gap-x-6 py-2.5 border-b border-slate-100 ">
                        <p className="text-slate-500  text-sm font-normal leading-normal">Date</p>
                        <p className="text-slate-800 text-sm font-medium leading-normal text-right">{dateFormatter.format(loaderData?.date)}</p>
                    </div>
                    <div className="flex justify-between gap-x-6 py-2.5">
                        <p className="text-slate-500  text-sm font-normal leading-normal">Transaction ID</p>
                        <p className="text-slate-800 text-sm font-medium leading-normal text-right">{loaderData?.transactionId}</p>
                    </div>
                </div>
                {/* <!-- Footer Link --> */}
                <div className="mt-12 text-center">
                    <Link className="text-blue-400 text-sm font-medium hover:underline" to="/">Return to Dashboard</Link>
                </div>
            </div>
        </main>
    )
}

function HeadLine({ status }: { status: string }) {
    if (status === 'successful') {
        return (
            <>
                {/* <!-- Success Icon --> */}
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/50 mb-6">
                    {/* <span className="material-symbols-outlined text-5xl text-emerald-500 dark:text-emerald-400">check</span> */}
                    <Check className="text-5xl text-emerald-500" />
                </div>
                {/* // <!-- Headline Text --> */}
                <h1 className="text-slate-900 text-3xl font-bold leading-tight tracking-tight text-center pb-2">Payment Sent</h1>
                {/* // <!-- Body Text --> */}
                <p className="text-slate-600 text-base font-normal leading-normal pb-8 text-center">Your transaction has been completed successfully.</p>
            </>
        )
    } else {
        return (
            <>
                {/* <!-- Status Icon --> */}
                <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-6">
                    <div className="w-14 h-14 bg-red-200  rounded-full flex items-center justify-center">
                        {/* <span className="material-symbols-outlined text-red-500 dark:text-red-400 text-4xl">close</span> */}
                        <X className="text-red-500 text-4xl" />
                    </div>
                </div>
                {/* <!-- Headline Text --> */}
                <h1 className="text-red-600  tracking-tight text-3xl font-bold leading-tight text-center pb-2">Transaction Failed</h1>
                {/* <!-- Body Text --> */}
                <p className="text-slate-600  text-base font-normal leading-relaxed pb-8 px-4 text-center max-w-md">
                    There was an issue processing your transaction. Please try again.
                </p>
            </>
        )
    }
}