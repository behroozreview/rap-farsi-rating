CREATE TYPE "public"."user_role" AS ENUM('admin', 'viewer');--> statement-breakpoint
CREATE TABLE "import_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"file_name" varchar(255) NOT NULL,
	"imported_count" integer DEFAULT 0 NOT NULL,
	"failed_count" integer DEFAULT 0 NOT NULL,
	"errors" jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "songs" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar(200) NOT NULL,
	"artist" varchar(120) DEFAULT '' NOT NULL,
	"url" text NOT NULL,
	"rating" integer NOT NULL,
	"persian_year" integer NOT NULL,
	"notes" text,
	"imported_from" varchar(120),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "songs_title_artist_year_unique" UNIQUE("title","artist","persian_year"),
	CONSTRAINT "rating_range" CHECK ("songs"."rating" >= 1 AND "songs"."rating" <= 9),
	CONSTRAINT "persian_year_range" CHECK ("songs"."persian_year" >= 1350 AND "songs"."persian_year" <= 1499)
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" varchar(255) NOT NULL,
	"role" "user_role" DEFAULT 'viewer' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
