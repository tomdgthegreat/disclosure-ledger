-- CreateTable
CREATE TABLE "magic_link_tokens" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "token_hash" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "used_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "magic_link_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "magic_link_tokens_token_hash_key" ON "magic_link_tokens"("token_hash");

-- CreateIndex
CREATE INDEX "magic_link_tokens_email_idx" ON "magic_link_tokens"("email");

-- CreateIndex
CREATE INDEX "magic_link_tokens_expires_at_idx" ON "magic_link_tokens"("expires_at");
