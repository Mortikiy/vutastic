/*
  Warnings:

  - You are about to drop the column `date` on the `Event` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[time,locationId]` on the table `Event` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `Event` DROP COLUMN `date`;

-- CreateIndex
CREATE UNIQUE INDEX `Event_time_locationId_key` ON `Event`(`time`, `locationId`);
