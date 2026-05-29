/*
  Warnings:

  - A unique constraint covering the columns `[userId,subscriptionId]` on the table `subscription_access` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "subscription_access_userId_subscriptionId_key" ON "subscription_access"("userId", "subscriptionId");
