-- AlterTable
ALTER TABLE "ListingLead" ADD COLUMN "paymentProofUrl" TEXT,
ADD COLUMN "paymentProofKey" TEXT,
ADD COLUMN "paymentProofUploadedAt" TIMESTAMP(3);
