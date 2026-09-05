export interface SourceEvidence {
  document: string;
  chunk?: string;
  source_folder?: string;
  relative_path?: string;
  text?: string;
  evidence_score?: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  reasoning?: string;
  sources?: SourceEvidence[];
  timestamp: string;
  isError?: boolean;
}

export interface SampleQuestion {
  id: string;
  question: string;
  title: string;
  category: 'Entity Affiliation' | 'Conflict & Treaty' | 'Artifact Lore' | 'Secret Allegiance';
  hops: number;
}
