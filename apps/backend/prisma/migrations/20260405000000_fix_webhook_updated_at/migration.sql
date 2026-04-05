-- Fix missing updatedAt column on WebhookSubscription
ALTER TABLE "WebhookSubscription" ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
