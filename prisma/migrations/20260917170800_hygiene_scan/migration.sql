-- CreateTable
CREATE TABLE "scans" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "contact_email" TEXT NOT NULL,
    "target_url" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'completed',
    "pages_crawled" INTEGER NOT NULL DEFAULT 0,
    "images_checked" INTEGER NOT NULL DEFAULT 0,
    "summary" JSONB NOT NULL,
    "entitlement_id" TEXT,

    CONSTRAINT "scans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "scan_findings" (
    "id" TEXT NOT NULL,
    "scan_id" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "severity" TEXT NOT NULL DEFAULT 'review',
    "page_url" TEXT,
    "asset_url" TEXT,
    "message" TEXT NOT NULL,
    "evidence" JSONB,

    CONSTRAINT "scan_findings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "scans_contact_email_idx" ON "scans"("contact_email");

-- CreateIndex
CREATE INDEX "scans_created_at_idx" ON "scans"("created_at");

-- CreateIndex
CREATE INDEX "scans_entitlement_id_idx" ON "scans"("entitlement_id");

-- CreateIndex
CREATE INDEX "scan_findings_scan_id_idx" ON "scan_findings"("scan_id");

-- CreateIndex
CREATE INDEX "scan_findings_kind_idx" ON "scan_findings"("kind");

-- AddForeignKey
ALTER TABLE "scans" ADD CONSTRAINT "scans_entitlement_id_fkey" FOREIGN KEY ("entitlement_id") REFERENCES "entitlements"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "scan_findings" ADD CONSTRAINT "scan_findings_scan_id_fkey" FOREIGN KEY ("scan_id") REFERENCES "scans"("id") ON DELETE CASCADE ON UPDATE CASCADE;
