export type Project = {
  number: string;
  name: string;
  kind: string;
  description: string;
  stack: string;
  sequence: string;
  image: string;
  href?: string;
  story: string;
};

export const projects: Project[] = [
  {
    number: '01', name: 'AI-Powered Research Assistant', kind: 'Research agent',
    description: 'Agentic research that discovers sources, evaluates evidence, and produces cited summaries.',
    stack: 'Python · FastAPI · Ollama · Gemini', sequence: 'Source → Evaluate → Synthesize',
    image: '/projects/research-assistant.png', href: 'https://github.com/AmmarBinYasir489/ai-research-assistant',
    story: 'Designed around evidence rather than confident output: the agent finds, compares, and cites before it concludes.'
  },
  {
    number: '02', name: 'AI-Powered Nutrition Platform', kind: 'Multimodal product',
    description: 'A nutrition companion that understands meal images and turns them into reusable food templates.',
    stack: 'Next.js · Supabase · Gemini Vision', sequence: 'Vision → Analyze → Track',
    image: '/projects/nourish-ai.png', href: 'https://github.com/AmmarBinYasir489/calories-counter',
    story: 'A visual capture flow reduces the friction between seeing a meal and understanding its nutritional shape.'
  },
  {
    number: '03', name: 'AI-Powered Expense Platform', kind: 'Finance platform',
    description: 'Natural-language expense capture, financial analytics, and conversational insight in one product.',
    stack: 'Next.js · TypeScript · Supabase', sequence: 'Capture → Classify → Insight',
    image: '/projects/expense-ai.png', href: 'https://github.com/AmmarBinYasir489/expense-ai',
    story: 'The product turns casual financial language into structured records, then returns the data as useful decisions.'
  },
  {
    number: '04', name: 'Grounded Knowledge Workspace', kind: 'Knowledge system',
    description: 'A private document environment for source-aware answers across internal knowledge.',
    stack: 'TypeScript · RAG · AI Search', sequence: 'Ingest → Retrieve → Answer',
    image: '/projects/grounded-workspace.png', href: 'https://github.com/AmmarBinYasir489/grounded-knowledge-workspace',
    story: 'A retrieval-first architecture keeps answers connected to the documents people are actually working from.'
  },
  {
    number: '05', name: 'Recruitment Operations Portal', kind: 'Recruitment platform',
    description: 'A hiring workspace for openings, resume review, candidate comparison, and pipeline visibility.',
    stack: 'Full-stack · Role-based UI · Hiring analytics', sequence: 'Post → Review → Shortlist → Hire',
    image: '/projects/recruiter-portal.png',
    story: 'A dense operational workflow is reorganized into a clear path from role creation to confident shortlisting.'
  },
  {
    number: '06', name: 'Repository Intelligence Engine', kind: 'Developer intelligence',
    description: 'An evidence-backed memory engine that maps repositories and answers with file and line citations.',
    stack: 'Next.js · FastAPI · Python · SQLite · Gemini', sequence: 'Connect → Index → Remember → Answer',
    image: '/projects/code-recall.png', href: 'https://github.com/AmmarBinYasir489/coderecall',
    story: 'Repository context becomes searchable memory, helping developers recover intent without losing the evidence trail.'
  },
  {
    number: '07', name: 'AI-Powered Styling Platform', kind: 'Vision product',
    description: 'A private wardrobe workspace that classifies garments, scores outfits, and previews complete looks.',
    stack: 'React · TypeScript · Supabase · Vision AI', sequence: 'Capture → Classify → Combine → Style',
    image: '/projects/ai-stylist.png', href: 'https://github.com/AmmarBinYasir489/ai-stylist',
    story: 'Computer vision is shaped into a practical wardrobe tool, not a novelty filter—classification feeds an actual styling workflow.'
  },
  {
    number: '08', name: 'Conversion-Focused Agency Experience', kind: 'Web experience',
    description: 'A conversion-focused agency website with tactile interface design and intentional motion.',
    stack: 'Next.js · TypeScript · Tailwind · Framer Motion', sequence: 'Position → Engage → Convert',
    image: '/projects/hashim-tech-agency.png', href: 'https://github.com/AmmarBinYasir489/hashim-tech-agency',
    story: 'Brand, information hierarchy, and motion work together to make technical capability easier to understand and act on.'
  }
];
