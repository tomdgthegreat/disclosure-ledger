export type AiDeclaration = "yes" | "no" | "partial";

export type ProvenanceSummary = {
  found: boolean;
  method: string;
  details: string;
  signals: string[];
};

export type DisclosureRecord = {
  id: string;
  createdAt: string;
  contentHashSha256: string;
  fileName: string;
  fileSizeBytes: number;
  mimeType: string;
  aiDeclaration: AiDeclaration;
  notes: string;
  contactEmail: string | null;
  provenance: ProvenanceSummary;
};

export type CreateRecordInput = {
  contentHashSha256: string;
  fileName: string;
  fileSizeBytes: number;
  mimeType: string;
  aiDeclaration: AiDeclaration;
  notes?: string;
  contactEmail?: string | null;
  provenance: ProvenanceSummary;
};
