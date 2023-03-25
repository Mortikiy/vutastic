/*
  Warnings:

  - You are about to drop the column `eventId` on the `Location` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[locationId]` on the table `University` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE `Location` DROP FOREIGN KEY `Location_eventId_fkey`;

-- AlterTable
ALTER TABLE `Location` DROP COLUMN `eventId`;

-- CreateIndex
CREATE UNIQUE INDEX `University_locationId_key` ON `University`(`locationId`);

-- AddForeignKey
ALTER TABLE `Event` ADD CONSTRAINT `Event_locationId_fkey` FOREIGN KEY (`locationId`) REFERENCES `Location`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
