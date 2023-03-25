/*
  Warnings:

  - You are about to drop the column `adminId` on the `University` table. All the data in the column will be lost.
  - You are about to drop the column `eventId` on the `User` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[name]` on the table `University` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[superadminId]` on the table `University` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `superadminId` to the `University` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `University` DROP COLUMN `adminId`,
    ADD COLUMN `superadminId` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `User` DROP COLUMN `eventId`;

-- CreateIndex
CREATE UNIQUE INDEX `University_name_key` ON `University`(`name`);

-- CreateIndex
CREATE UNIQUE INDEX `University_superadminId_key` ON `University`(`superadminId`);

-- AddForeignKey
ALTER TABLE `University` ADD CONSTRAINT `University_superadminId_fkey` FOREIGN KEY (`superadminId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
