/*
  Warnings:

  - You are about to drop the column `easeFactor` on the `Card` table. All the data in the column will be lost.
  - Added the required column `updatedAt` to the `Deck` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Card" DROP COLUMN "easeFactor",
ADD COLUMN     "easiness" DOUBLE PRECISION NOT NULL DEFAULT 2.5;

-- AlterTable
ALTER TABLE "Deck" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "description" TEXT,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "password" TEXT;
