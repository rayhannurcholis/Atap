/*
  Warnings:

  - The `rules` column on the `KostListing` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - A unique constraint covering the columns `[key]` on the table `RoomPhoto` will be added. If there are existing duplicate values, this will fail.
  - Changed the type of `latitude` on the `KostListing` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `longitude` on the `KostListing` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `genderType` on the `KostListing` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Added the required column `updatedAt` to the `RoomPhoto` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "GenderType" AS ENUM ('PUTRA', 'PUTRI', 'CAMPUR');

-- DropForeignKey
ALTER TABLE "KostListing" DROP CONSTRAINT "KostListing_ownerId_fkey";

-- DropForeignKey
ALTER TABLE "RoomPhoto" DROP CONSTRAINT "RoomPhoto_roomTypeId_fkey";

-- DropForeignKey
ALTER TABLE "RoomType" DROP CONSTRAINT "RoomType_listingId_fkey";

-- AlterTable
ALTER TABLE "KostListing" ADD COLUMN     "rejectionReason" TEXT,
DROP COLUMN "latitude",
ADD COLUMN     "latitude" DECIMAL(10,7) NOT NULL,
DROP COLUMN "longitude",
ADD COLUMN     "longitude" DECIMAL(10,7) NOT NULL,
DROP COLUMN "genderType",
ADD COLUMN     "genderType" "GenderType" NOT NULL,
DROP COLUMN "rules",
ADD COLUMN     "rules" TEXT[];

-- AlterTable
ALTER TABLE "RoomPhoto" ADD COLUMN     "mimeType" TEXT,
ADD COLUMN     "sizeBytes" INTEGER,
ADD COLUMN     "sortOrder" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- CreateIndex
CREATE INDEX "KostListing_ownerId_idx" ON "KostListing"("ownerId");

-- CreateIndex
CREATE INDEX "KostListing_status_idx" ON "KostListing"("status");

-- CreateIndex
CREATE INDEX "KostListing_isPremium_idx" ON "KostListing"("isPremium");

-- CreateIndex
CREATE INDEX "KostListing_createdAt_idx" ON "KostListing"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "RoomPhoto_key_key" ON "RoomPhoto"("key");

-- CreateIndex
CREATE INDEX "RoomType_listingId_idx" ON "RoomType"("listingId");

-- AddForeignKey
ALTER TABLE "KostListing" ADD CONSTRAINT "KostListing_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoomType" ADD CONSTRAINT "RoomType_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "KostListing"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoomPhoto" ADD CONSTRAINT "RoomPhoto_roomTypeId_fkey" FOREIGN KEY ("roomTypeId") REFERENCES "RoomType"("id") ON DELETE CASCADE ON UPDATE CASCADE;
