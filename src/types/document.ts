
export interface Document {
  id: string;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
}

export interface DocumentVersion {
  id: string;
  document_id: string;
  content: string;
  title: string;
  version_number: number;
  change_summary: string | null;
  created_at: string;
}
