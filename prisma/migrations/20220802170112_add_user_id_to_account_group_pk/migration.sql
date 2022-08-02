/*
  Warnings:

  - The primary key for the `AccountGroup` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- DropForeignKey
ALTER TABLE "Account" DROP CONSTRAINT "Account_groupId_fkey";

-- AlterTable
ALTER TABLE "AccountGroup" DROP CONSTRAINT "AccountGroup_pkey",
ADD CONSTRAINT "AccountGroup_pkey" PRIMARY KEY ("id", "userId");

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_groupId_userId_fkey" FOREIGN KEY ("groupId", "userId") REFERENCES "AccountGroup"("id", "userId") ON DELETE RESTRICT ON UPDATE CASCADE;
