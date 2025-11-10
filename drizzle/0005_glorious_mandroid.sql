CREATE TYPE "public"."bill_type" AS ENUM('electricity', 'airtime', 'data', 'tv', 'water', 'internet');--> statement-breakpoint
CREATE TYPE "public"."transaction_status" AS ENUM('pending', 'success', 'failed', 'reversed');--> statement-breakpoint
ALTER TABLE "transactions" ADD COLUMN "billType" "bill_type";--> statement-breakpoint
ALTER TABLE "transactions" ADD COLUMN "customer_id" text;--> statement-breakpoint
ALTER TABLE "transactions" ADD COLUMN "billStatus" "transaction_status" DEFAULT 'pending';--> statement-breakpoint
ALTER TABLE "transactions" ADD COLUMN "provider" text;