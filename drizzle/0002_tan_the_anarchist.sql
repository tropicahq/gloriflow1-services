CREATE TYPE "public"."paymentStatus" AS ENUM('pending', 'completed', 'failed');--> statement-breakpoint
CREATE TABLE "transactions" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"paymentStatus" "paymentStatus" DEFAULT 'pending',
	"flw_payment_transaction_id" text NOT NULL,
	"payment_tx_ref" text NOT NULL,
	"amount" text NOT NULL,
	"payment_completed_at" timestamp,
	"payment_failed_at" timestamp,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;