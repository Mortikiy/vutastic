-- AlterTable
ALTER TABLE `Event` MODIFY `type` ENUM('PUBLIC', 'PRIVATE', 'RSO', 'PENDING') NOT NULL DEFAULT 'RSO';