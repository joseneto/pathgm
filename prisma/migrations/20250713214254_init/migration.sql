-- CreateEnum
CREATE TYPE "UserType" AS ENUM ('PRIVATE', 'GROUP');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "telegram_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "UserType" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "players" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "pathbuilder_id" TEXT,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "name" TEXT NOT NULL,
    "alias" TEXT NOT NULL,
    "class_name" TEXT NOT NULL,
    "level" INTEGER NOT NULL,
    "perception" INTEGER NOT NULL,
    "fortitude" INTEGER NOT NULL,
    "reflex" INTEGER NOT NULL,
    "will" INTEGER NOT NULL,
    "skills" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "players_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_telegram_id_key" ON "users"("telegram_id");

-- CreateIndex
CREATE INDEX "players_user_id_idx" ON "players"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "players_user_id_pathbuilder_id_key" ON "players"("user_id", "pathbuilder_id");

-- AddForeignKey
ALTER TABLE "players" ADD CONSTRAINT "players_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
