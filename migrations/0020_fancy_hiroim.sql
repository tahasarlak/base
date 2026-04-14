DROP INDEX "account_provider_idx";--> statement-breakpoint
CREATE UNIQUE INDEX "account_provider_unique" ON "account" USING btree ("provider_id","provider_account_id");