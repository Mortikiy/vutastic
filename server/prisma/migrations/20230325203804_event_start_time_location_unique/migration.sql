/*
  Warnings:

  - You are about to drop the column `time` on the `Event` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[startTime,locationId]` on the table `Event` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `endTime` to the `Event` table without a default value. This is not possible if the table is not empty.
  - Added the required column `startTime` to the `Event` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX `Event_time_locationId_key` ON `Event`;

-- AlterTable
ALTER TABLE `Event` DROP COLUMN `time`,
    ADD COLUMN `endTime` DATETIME(3) NOT NULL,
    ADD COLUMN `startTime` DATETIME(3) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `Event_startTime_locationId_key` ON `Event`(`startTime`, `locationId`);
