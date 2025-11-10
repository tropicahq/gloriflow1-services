import { drizzle } from "drizzle-orm/neon-http"
import { neon } from "@neondatabase/serverless"
import * as schema from '~/db/schema'
import * as betterAuthSchema from "../../auth-schema"

export const sql = neon(process.env.DATABASE_URL!)
export const db = drizzle({ client: sql, schema: { ...schema, ...betterAuthSchema } })
