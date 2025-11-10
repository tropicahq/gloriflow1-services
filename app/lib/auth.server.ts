import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { betterAuth } from "better-auth"
import { db } from "~/lib/db"
import { magicLink } from "better-auth/plugins"
import { account, session, user, verification } from "auth-schema";
import { resend } from "./resend";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: { user, verification, session, account }
  }),
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 60 // Cache duration in seconds
    }
  },
  plugins: [
    magicLink({
      sendMagicLink: async ({ email, token, url }, request) => {
        // send email to user
        // console.log("The magicLink for email " + email + " is " + url + " with token " + token)
        try {
          const res = await resend.emails.send({
            from: 'onboard@gloriflow1-services.space',
            to: email,
            subject: 'Confirm your Gloriflow1 Service account',
            html: `<p>Welcome back, to access your account please click the link to <a href="${url}">verify your account</a></p>`
          })
          if (import.meta.env.DEV) {
            console.log(url)
            console.log(res)
          }

        } catch (error) {
          throw error
        }
      }
    })
  ]
})
