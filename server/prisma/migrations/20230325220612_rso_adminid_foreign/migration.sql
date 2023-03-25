/*
  Warnings:

  - You are about to drop the column `userId` on the `RSO` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `RSO` DROP FOREIGN KEY `RSO_userId_fkey`;

-- AlterTable
ALTER TABLE `RSO` DROP COLUMN `userId`;

-- AddForeignKey
ALTER TABLE `RSO` ADD CONSTRAINT `RSO_adminId_fkey` FOREIGN KEY (`adminId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
