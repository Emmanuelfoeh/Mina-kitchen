/*
  Warnings:

  - You are about to drop the `nutritional_info` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "nutritional_info" DROP CONSTRAINT "nutritional_info_menuItemId_fkey";

-- DropTable
DROP TABLE "nutritional_info";
