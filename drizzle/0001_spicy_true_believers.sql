ALTER TABLE "documents" ADD COLUMN "public_share_token" text;--> statement-breakpoint
ALTER TABLE "documents" ADD CONSTRAINT "documents_public_share_token_unique" UNIQUE("public_share_token");