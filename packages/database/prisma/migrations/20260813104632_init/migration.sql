-- CreateTable
CREATE TABLE "games" (
    "appid" BIGINT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT,
    "release_date" DATE,
    "release_year" INTEGER,
    "release_month" INTEGER,
    "coming_soon" BOOLEAN DEFAULT false,
    "steam_url" TEXT,
    "header_image" TEXT,
    "last_modified" BIGINT,
    "raw_json" JSONB,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "games_pkey" PRIMARY KEY ("appid")
);

-- CreateTable
CREATE TABLE "genres" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "genres_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "game_genres" (
    "appid" BIGINT NOT NULL,
    "genre_id" TEXT NOT NULL,

    CONSTRAINT "game_genres_pkey" PRIMARY KEY ("appid","genre_id")
);

-- CreateTable
CREATE TABLE "sync_runs" (
    "id" BIGSERIAL NOT NULL,
    "started_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "finished_at" TIMESTAMPTZ,
    "status" TEXT NOT NULL,
    "fetched_count" INTEGER NOT NULL DEFAULT 0,
    "inserted_count" INTEGER NOT NULL DEFAULT 0,
    "updated_count" INTEGER NOT NULL DEFAULT 0,
    "failed_count" INTEGER NOT NULL DEFAULT 0,
    "error_message" TEXT,

    CONSTRAINT "sync_runs_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "game_genres" ADD CONSTRAINT "game_genres_appid_fkey" FOREIGN KEY ("appid") REFERENCES "games"("appid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "game_genres" ADD CONSTRAINT "game_genres_genre_id_fkey" FOREIGN KEY ("genre_id") REFERENCES "genres"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
