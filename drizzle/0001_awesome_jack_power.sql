CREATE TABLE "meta_config" (
	"key" text NOT NULL,
	"data" jsonb,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	CONSTRAINT "meta_config_key_unique" UNIQUE("key")
);
