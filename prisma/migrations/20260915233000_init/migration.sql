-- CreateTable
CREATE TABLE "entitlements" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "stripe_customer_id" TEXT,
    "stripe_subscription_id" TEXT,
    "subscription_status" TEXT NOT NULL DEFAULT 'none',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "entitlements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "disclosure_records" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "content_hash_sha256" TEXT NOT NULL,
    "file_name" TEXT NOT NULL,
    "file_size_bytes" INTEGER NOT NULL,
    "mime_type" TEXT NOT NULL,
    "ai_declaration" TEXT NOT NULL,
    "notes" TEXT NOT NULL DEFAULT '',
    "contact_email" TEXT,
    "provenance" JSONB NOT NULL,
    "entitlement_id" TEXT,

    CONSTRAINT "disclosure_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "privacy_requests" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "email" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "note" TEXT,

    CONSTRAINT "privacy_requests_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "entitlements_email_key" ON "entitlements"("email");

-- CreateIndex
CREATE UNIQUE INDEX "entitlements_stripe_customer_id_key" ON "entitlements"("stripe_customer_id");

-- CreateIndex
CREATE INDEX "disclosure_records_entitlement_id_idx" ON "disclosure_records"("entitlement_id");

-- CreateIndex
CREATE INDEX "disclosure_records_contact_email_idx" ON "disclosure_records"("contact_email");

-- CreateIndex
CREATE INDEX "disclosure_records_created_at_idx" ON "disclosure_records"("created_at");

-- CreateIndex
CREATE INDEX "privacy_requests_email_idx" ON "privacy_requests"("email");

-- CreateIndex
CREATE INDEX "privacy_requests_created_at_idx" ON "privacy_requests"("created_at");

-- AddForeignKey
ALTER TABLE "disclosure_records" ADD CONSTRAINT "disclosure_records_entitlement_id_fkey" FOREIGN KEY ("entitlement_id") REFERENCES "entitlements"("id") ON DELETE SET NULL ON UPDATE CASCADE;
