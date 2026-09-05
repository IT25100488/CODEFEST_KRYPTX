import { SampleQuestion, ChatMessage } from '../types/chat';

export const SAMPLE_QUESTIONS: SampleQuestion[] = [
  {
    id: 'q1',
    title: 'Ederon Fellgard Accord Victory',
    question: 'Which accord was ultimately won by the faction of which Ederon Fellgard is a member?',
    category: 'Conflict & Treaty',
    hops: 2
  },
  {
    id: 'q2',
    title: 'House Morvain High Spire Dispute',
    question: 'What event led to the political conflict between House Morvain and the Ashen Vanguard at Ironfell Citadel?',
    category: 'Entity Affiliation',
    hops: 2
  },
  {
    id: 'q3',
    title: 'Gareth Ironmere Concealed Devotion',
    question: 'What secret practice is Gareth Ironmere recorded to observe while commanding Marrowwell Abbey?',
    category: 'Secret Allegiance',
    hops: 1
  },
  {
    id: 'q4',
    title: 'The Cinder-Wrought Aegis',
    question: 'Which faction guarded the Cinder-Wrought Aegis prior to the Siege of Fenspire?',
    category: 'Artifact Lore',
    hops: 2
  }
];

export const MOCK_RESPONSES: Record<string, Partial<ChatMessage>> = {
  q1: {
    content: `**The Leaden Accord**

Based on verified multi-hop connections across the Ashen Era Archive:
1. **Membership Identification**: Official records in the Annals and character registries establish that **Ederon Fellgard** serves as a Sapper at Greyfell Citadel and holds canonical membership in **The Iron-Ring Cartel**.
2. **Conflict Resolution**: The treaty records confirm that **The Iron-Ring Cartel** was the declared and recognized victor of **The Leaden Accord**.

Therefore, the accord won by Ederon Fellgard's faction is unequivocally **The Leaden Accord**.`,
    reasoning: `Hop 1: Query matched character registry entry for 'Ederon Fellgard' in 'the_annals_of_the_ashen_era.pdf' & 'ederon_fellgard.md' → Extracted faction: 'The Iron-Ring Cartel'.
Hop 2: Query matched treaty records for 'The Leaden Accord' in 'the_leaden_accord.md' → Verified victor organization: 'The Iron-Ring Cartel'.
Hop 3: Synthesized relationship chain (Ederon Fellgard → The Iron-Ring Cartel → Victor of The Leaden Accord).`,
    sources: [
      {
        document: 'the_annals_of_the_ashen_era.pdf',
        chunk: 'DOC_000015_CHUNK_0008',
        source_folder: 'codex',
        relative_path: 'codex/the_annals_of_the_ashen_era.pdf',
        evidence_score: 138.61,
        text: 'Registry: Ederon Fellgard | Classification: Minor figure of the Ashen Era | Role: Sapper | Born: 338 AS | Affiliation: Member of The Iron-Ring Cartel | Service Posting: Greyfell Citadel.'
      },
      {
        document: 'the_annals_of_the_ashen_era.docx',
        chunk: 'DOC_000014_CHUNK_0007',
        source_folder: 'codex',
        relative_path: 'codex/the_annals_of_the_ashen_era.docx',
        evidence_score: 137.18,
        text: 'The registry identifies Ederon Fellgard as a Sapper and records service at Greyfell Citadel. The same record places Ederon Fellgard among the members of The Iron-Ring Cartel.'
      },
      {
        document: 'ederon_fellgard.md',
        chunk: 'DOC_000179_CHUNK_0001',
        source_folder: 'wiki',
        relative_path: 'wiki/ederon_fellgard.md',
        evidence_score: 92.36,
        text: 'The principal established affiliation of Ederon Fellgard is membership in The Iron-Ring Cartel. This affiliation is explicit and canonical.'
      },
      {
        document: 'the_leaden_accord.md',
        chunk: 'DOC_000204_CHUNK_0003',
        source_folder: 'wiki',
        relative_path: 'wiki/the_leaden_accord.md',
        evidence_score: 88.54,
        text: 'Outcome of The Leaden Accord: Following the ratification of 342 AS, The Iron-Ring Cartel secured undisputed victory and trade jurisdiction over the Ashen frontiers.'
      }
    ]
  },
  q3: {
    content: `**Proscribed Blood-Rites**

Archival records in the Annals registry indicate that **Gareth Ironmere**, who has commanded Marrowwell Abbey since 322 AS and belongs to **The Bleeding Crown**, secretly practices **proscribed blood-rites**.

This devotional offense is maintained as a concealed classification distinct from his sanctioned duties as Executioner.`,
    reasoning: `Hop 1: Queried registry for 'Gareth Ironmere' command and clandestine activities in 'the_annals_of_the_ashen_era.pdf' → Found classified notation 'secretly practices proscribed blood-rites' at Marrowwell Abbey.`,
    sources: [
      {
        document: 'the_annals_of_the_ashen_era.pdf',
        chunk: 'DOC_000015_CHUNK_0009',
        source_folder: 'codex',
        relative_path: 'codex/the_annals_of_the_ashen_era.pdf',
        evidence_score: 112.42,
        text: 'Gareth Ironmere: Executioner, Born 300 AS. Affiliation: The Bleeding Crown. Command: Marrowwell Abbey, since 322 AS. Concealed practice: secretly practices proscribed blood-rites.'
      }
    ]
  }
};
