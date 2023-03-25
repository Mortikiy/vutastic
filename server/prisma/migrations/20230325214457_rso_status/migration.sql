/*
  Warnings:

  - You are about to alter the column `status` on the `RSO` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Enum(EnumId(1))`.
  - Added the required column `universityId` to the `Notification` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Notification` ADD COLUMN `universityId` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `RSO` MODIFY `status` ENUM('ACTIVE', 'INACTIVE', 'PENDING') NOT NULL DEFAULT 'PENDING';

-- AddForeignKey
ALTER TABLE `Notification` ADD CONSTRAINT `Notification_universityId_fkey` FOREIGN KEY (`universityId`) REFERENCES `University`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
