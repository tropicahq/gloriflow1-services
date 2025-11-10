CREATE TABLE "webhook_events" (
	"payload" jsonb,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
ALTER TABLE "transactions" ADD COLUMN "payment_flw_ref" text;--> statement-breakpoint
ALTER TABLE "transactions" ADD COLUMN "bill_tx_ref" text;--> statement-breakpoint
ALTER TABLE "transactions" ADD COLUMN "bill_flw_ref" text;