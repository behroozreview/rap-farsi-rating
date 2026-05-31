ALTER TABLE "songs" DROP CONSTRAINT "rating_range";
--> statement-breakpoint
ALTER TABLE "songs" ADD CONSTRAINT "rating_range" CHECK ("songs"."rating" >= 0 AND "songs"."rating" <= 9);
