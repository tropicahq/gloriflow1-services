import { meta } from "~/db/schema"
import { db } from "./db"
import { eq } from "drizzle-orm"
import { axios } from "./axios"
import Flutterwave from "flutterwave-node-v3"

export const flwClientId = process.env.FLW_CLIENT_ID!
export const flwSecretKey = process.env.FLW_CLIENT_SECRET!

export const flw = new Flutterwave(flwClientId, flwSecretKey)


export const FLW_API_META_KEY = 'flw_meta_key'

export const flwAccessToken = async () => {
  try {
    let res = await fetch("https://idp.flutterwave.com/realms/flutterwave/protocol/openid-connect/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        client_id: process.env.FLW_CLIENT_ID!,
        client_secret: process.env.FLW_CLIENT_SECRET!,
        grant_type: 'client_credentials',
      })
    })

    if (res.ok) {
      let data = await res.json()
      return data
    }
    return null

  } catch (error) {
    // TODO: Handle error properly
    console.log(error)
    return null

  }
}

export const getOrSetFLWAccessToken = async ({ revalidate }: { revalidate?: boolean } = {}) => {
  try {

    if (revalidate) {
      const tokenData = await flwAccessToken()
      await db.update(meta).set({ data: tokenData }).where(eq(meta.key, FLW_API_META_KEY))
      return tokenData
    }
    const accessToken = await db.select().from(meta).where(eq(meta.key, FLW_API_META_KEY))

    if (accessToken.length > 0) {
      return accessToken[0].data
    } else {

      const tokenData = await flwAccessToken()
      await db.insert(meta).values({ key: FLW_API_META_KEY, data: tokenData })
      return tokenData
    }
  } catch (error) {
    // TODO: Handle error properly
    console.log(error)
    throw error
  }
}

export async function validateCustomerBillDetails(itemCode: string, customer: string) {
  return await axios.get(`https://api.flutterwave.com/v3/bill-items/${itemCode}/validate?customer=${customer}`, {
    cache: false,
    headers: {
      accept: 'application/json',
      authorization: 'Bearer ' + flwSecretKey,
      'content-type': 'application/json'
    }
  })
}

export async function getBillerInformation(billerCode: string) {
  return await axios.get(`https://api.flutterwave.com/v3/billers/${billerCode}/items`, {
    // cache: false,
    id: "billers-" + billerCode,
    headers: {
      accept: 'application/json',
      authorization: 'Bearer ' + flwSecretKey,
      'content-type': 'application/json'
    },
  })
}

export async function getBillInformation(category: string) {
  return axios.get(`https://api.flutterwave.com/v3/bills/${category}/billers?country=NG`, {
    id: 'airtime-biller-info',
    headers: {
      accept: 'application/json',
      authorization: 'Bearer ' + flwSecretKey,
      'content-type': 'application/json'
    }
  })
}


export async function createBillPayment(billerCode: string, itemCode: string, { ...props }: { customer_id: string, reference: string, callback_url: string, amount: number }) {
  return await axios.request({
    method: "POST",
    url: `https://api.flutterwave.com/v3/billers/${billerCode}/items/${itemCode}/payment`,
    headers: {
      accept: 'application/json',
      authorization: 'Bearer ' + flwSecretKey,
      'content-type': 'application/json'
    },
    data: {
      country: 'NG',
      ...props
    }
  })
}
export async function generatePaymentLink({ ...props }: {
  amount: number,
  tx_ref: string,
  redirect_url: string,
  customer: {
    email: string,
    phone_number: string,
    name: string,
  },
  meta?: Record<any, any>
}) {
  return await axios.request({
    method: "POST",
    url: `https://api.flutterwave.com/v3/payments`,
    headers: {
      accept: 'application/json',
      authorization: 'Bearer ' + flwSecretKey,
      'content-type': 'application/json'
    },
    data: {
      currency: 'NGN',
      customizations: {
        title: 'Gloriflow1 Services',
        // logo: 'http://www.piedpiper.com/app/themes/joystick-v27/images/logo.png'
      },
      ...props,

    }
  })
}


export function generateTxRef(prefix = "TXN") {
  const timestamp = Date.now(); // milliseconds since epoch
  const random = Math.floor(Math.random() * 1e6).toString().padStart(6, "0");
  return `${prefix}-${timestamp}-${random}`;
}



// const doWork = async (treshold: number = 0) => {
//       let accessTokenMeta = await getOrSetFLWAccessToken({ revalidate: !!treshold })
//       if (accessTokenMeta) {
//         let res = await fetch("https://api.flutterwave.cloud/developersandbox/top-bill-categories?country=NG", {
//           method: "GET",
//           headers: {
//             'Content-Type': 'application/json',
//             "Authorization": "Bearer " + accessTokenMeta['access_token'],
//
//             accept: 'application/json'
//           },
//         })
//         if (res.ok) {
//           let data = await res.json()
//           return data
//         }
//
//         if (res.statusText == 'Unauthorized' && treshold <= 0) {
//           console.log("Was Unauthorized here!")
//           return await doWork(treshold + 1)
//         } else {
//           return null
//         }
//       }
//
//     }
//     let data = await doWork()

