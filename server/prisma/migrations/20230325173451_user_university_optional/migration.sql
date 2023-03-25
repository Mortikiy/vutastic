-- DropForeignKey
ALTER TABLE `User` DROP FOREIGN KEY `User_universityId_fkey`;

-- AlterTable
ALTER TABLE `User` MODIFY `universityId` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `User` ADD CONSTRAINT `User_universityId_fkey` FOREIGN KEY (`universityId`) REFERENCES `University`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
