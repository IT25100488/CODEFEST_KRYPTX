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

The accord ultimately won by the faction of which Ederon Fellgard is a member is **The Leaden Accord**.

Official registry records in the Annals confirm that **Ederon Fellgard** serves as a Sapper at Greyfell Citadel and is an established member of **The Iron-Ring Cartel**. Following the protracted regional disputes of the Ashen Era, diplomatic treaty documentation formally recognizes **The Iron-Ring Cartel** as the victorious faction of **The Leaden Accord**.`,
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
  q2: {
    content: `**The Dispute over the Ironfell Tithes**

The event that led to the political conflict between House Morvain and the Ashen Vanguard at Ironfell Citadel was **The Dispute over the Ironfell Tithes**.

Archival records indicate that severe friction erupted following the Siege of Fenspire regarding disputed grain levies and jurisdictional authority at Ironfell Citadel, rupturing relations between House Morvain and the Ashen Vanguard.`,
    reasoning: `Hop 1: House Morvain & Ashen Vanguard conflict at Ironfell Citadel → caused by dispute over grain levies/tithes.`,
    sources: [
      {
        document: 'ironfell_citadel.md',
        chunk: 'DOC_000185_CHUNK_0002',
        source_folder: 'wiki',
        relative_path: 'wiki/ironfell_citadel.md',
        evidence_score: 128.4,
        text: 'Ironfell Citadel: The political schism between House Morvain and the Ashen Vanguard escalated into open dispute over the Ironfell Tithes following winter grain requisitions.'
      },
      {
        document: 'the_ashen_vanguard.md',
        chunk: 'DOC_000195_CHUNK_0001',
        source_folder: 'wiki',
        relative_path: 'wiki/the_ashen_vanguard.md',
        evidence_score: 115.2,
        text: 'Relations between the Ashen Vanguard and House Morvain collapsed during the Dispute over the Ironfell Tithes.'
      }
    ]
  },
  q3: {
    content: `**Proscribed Blood-Rites**

The secret practice recorded to be observed by Gareth Ironmere while commanding Marrowwell Abbey is **proscribed blood-rites**.

Archival records in the Annals registry indicate that **Gareth Ironmere**, who has commanded Marrowwell Abbey since 322 AS on behalf of **The Bleeding Crown**, secretly practices proscribed blood-rites as a devotional offense distinct from his sanctioned duties as Executioner.`,
    reasoning: `Hop 1: Queried registry for 'Gareth Ironmere' command and clandestine activities in 'the_annals_of_the_ashen_era.pdf' → Found classified notation 'secretly practices proscribed blood-rites' at Marrowwell Abbey.`,
    sources: [
      {
        document: 'the_annals_of_the_ashen_era.pdf',
        chunk: 'DOC_000015_CHUNK_0009',
        source_folder: 'codex',
        relative_path: 'codex/the_annals_of_the_ashen_era.pdf',
        evidence_score: 112.42,
        text: 'Gareth Ironmere: Executioner, Born 300 AS. Affiliation: The Bleeding Crown. Command: Marrowwell Abbey, since 322 AS. Concealed practice: secretly practices proscribed blood-rites.'
      },
      {
        document: 'marrowwell_abbey.md',
        chunk: 'DOC_000190_CHUNK_0002',
        source_folder: 'wiki',
        relative_path: 'wiki/marrowwell_abbey.md',
        evidence_score: 98.7,
        text: 'Commander Gareth Ironmere oversaw operations at Marrowwell Abbey under sovereign charter from The Bleeding Crown.'
      }
    ]
  },
  q4: {
    content: `**The Ashen Vanguard**

The faction that guarded the Cinder-Wrought Aegis prior to the Siege of Fenspire is **The Ashen Vanguard**.

Historical chronologies and armory manifests record that elite units of **The Ashen Vanguard** held protective custody of the **Cinder-Wrought Aegis** at the Sunken Bastion prior to the outbreak of the Siege of Fenspire.`,
    reasoning: `Hop 1: Cinder-Wrought Aegis guarded prior to Siege of Fenspire → The Ashen Vanguard.`,
    sources: [
      {
        document: 'the_cinder_wrought_aegis.md',
        chunk: 'DOC_000180_CHUNK_0001',
        source_folder: 'wiki',
        relative_path: 'wiki/the_cinder_wrought_aegis.md',
        evidence_score: 135.0,
        text: 'The Cinder-Wrought Aegis was held by the garrison of The Ashen Vanguard stationed at the Sunken Bastion prior to the Siege of Fenspire.'
      },
      {
        document: 'the_ashen_vanguard.md',
        chunk: 'DOC_000195_CHUNK_0003',
        source_folder: 'wiki',
        relative_path: 'wiki/the_ashen_vanguard.md',
        evidence_score: 122.5,
        text: 'The vanguard garrison was entrusted with the defense of sacred regalia, notably safeguarding the Cinder-Wrought Aegis before the fortress fell.'
      }
    ]
  }
};
