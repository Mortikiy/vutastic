/*
  Warnings:

  - A unique constraint covering the columns `[longitude,latitude]` on the table `Location` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `Location_longitude_latitude_key` ON `Location`(`longitude`, `latitude`);
