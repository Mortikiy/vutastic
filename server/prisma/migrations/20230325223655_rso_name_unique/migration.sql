/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `RSO` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `RSO_name_key` ON `RSO`(`name`);
