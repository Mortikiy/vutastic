/*
  Warnings:

  - Added the required column `universityId` to the `Event` table without a default value. This is not possible if the table is not empty.
  - Added the required column `status` to the `RSO` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Event` ADD COLUMN `universityId` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `RSO` ADD COLUMN `status` VARCHAR(191) NOT NULL;

-- CreateTable
CREATE TABLE `Notification` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `type` ENUM('RSO', 'EVENT') NOT NULL DEFAULT 'RSO',
    `rsoId` INTEGER NULL,
    `adminId` INTEGER NOT NULL,
    `eventId` INTEGER NULL,

    UNIQUE INDEX `Notification_rsoId_key`(`rsoId`),
    UNIQUE INDEX `Notification_eventId_key`(`eventId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Event` ADD CONSTRAINT `Event_universityId_fkey` FOREIGN KEY (`universityId`) REFERENCES `University`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Notification` ADD CONSTRAINT `Notification_rsoId_fkey` FOREIGN KEY (`rsoId`) REFERENCES `RSO`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Notification` ADD CONSTRAINT `Notification_adminId_fkey` FOREIGN KEY (`adminId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Notification` ADD CONSTRAINT `Notification_eventId_fkey` FOREIGN KEY (`eventId`) REFERENCES `Event`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
