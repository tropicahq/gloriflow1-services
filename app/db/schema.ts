
import { user } from "auth-schema";
import { relations, sql } from "drizzle-orm";
import { pgTable, text, timestamp, boolean, pgEnum, jsonb, serial, uuid, integer } from "drizzle-orm/pg-core";

export const billTypeEnum = pgEnum("bill_type", [
  "electricity",
  "airtime",
  "data",
  "tv",
  "water",
  "internet",
]);
// export const transactionStatusEnum = pgEnum("trx_status", ["PENDING", "PROCESSING", "DELIVERED", "FAILED", "CANCELLED", "BOUNCED"] as const)
//
// export const transaction = pgTable("transaction", {
// id: text("id").primaryKey(),
//   transactionId: text("transaction_id").unique(),
//   amount: text("amount").notNull(),
//   provider: text("provider").notNull(),
//   status: transactionStatusEnum().default("PENDING"),
//   createdAt: timestamp("created_at")
//     .$defaultFn(() => new Date())
//     .notNull(),
//   updatedAt: timestamp("updated_at")
//     .$defaultFn(() => new Date())
//     .$onUpdate(() => new Date())
//     .notNull(),
// })
export const transactionBillStatusEnum = pgEnum("transaction_status", [
  "pending",
  // "paid",
  "success",
  "failed",
  // "failed_payment",
  "reversed",
]);
export const transactionPamentStatusEnum = pgEnum("paymentStatus", ["pending", "completed", "failed"] as const)
export const transactions = pgTable("transactions", {
  id: text("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  paymentStatus: transactionPamentStatusEnum().default("pending"),
  flwPaymentTrxId: text('flw_payment_transaction_id'),
  payment_ref: text('payment_tx_ref').notNull(),
  payment_flw_ref: text('payment_flw_ref'),
  amount: text('amount').notNull(),
  paymentCompletedAt: timestamp("payment_completed_at"),
  paymentFailedAt: timestamp("payment_failed_at"),
  // 
  billType: billTypeEnum(),
  customerId: text('customer_id'),
  billStatus: transactionBillStatusEnum().default('pending'),
  provider: text('provider'),
  bill_ref: text('bill_tx_ref'),
  bill_flw_ref: text('bill_flw_ref'),



  createdAt: timestamp("created_at")
    .$defaultFn(() => new Date())
    .notNull(),
  updatedAt: timestamp("updated_at")
    .$defaultFn(() => new Date())
    .$onUpdate(() => new Date())
    .notNull(),
})

export const webhookEvents = pgTable("webhook_events", {
  payload: jsonb(),
  paymentEventId: integer('payment_event_id'),
  createdAt: timestamp("created_at")
    .$defaultFn(() => new Date())
    .notNull(),
  updatedAt: timestamp("updated_at")
    .$defaultFn(() => new Date())
    .$onUpdate(() => new Date())
    .notNull(),
})


export const userRelations = relations(user, ({ many }) => ({
  transactions: many(transactions),

}))

export const paymentRelations = relations(transactions, ({ one }) => ({
  user: one(user, {
    fields: [transactions.userId],
    references: [user.id]
  }),

}))

export const meta = pgTable('meta_config', {
  key: text('key').notNull().unique(),
  data: jsonb('data'),
  createdAt: timestamp("created_at")
    .$defaultFn(() => new Date())
    .notNull(),
  updatedAt: timestamp("updated_at")
    .$defaultFn(() => new Date())
    .$onUpdate(() => new Date())
    .notNull(),

})
