// Everything the pictures say. Facts come from the portfolio (sathishlella.online)
// and the profile README that was here before; edit here and run build.mjs.
// No em or en dashes anywhere (plain hyphens only).

export const PERSON = {
  name: 'Sathish Lella',
  title: 'AI Engineer',
  location: 'Selangor, Malaysia',
  site: 'https://www.sathishlella.online',
  email: 'sathishlellaa@gmail.com',
  linkedin: 'https://linkedin.com/in/sathishlella',
  scholar: 'https://scholar.google.com/citations?user=4xwc2BgAAAAJ&hl=en',
  cv: 'https://www.sathishlella.online/cv/Sathish_Lella_CV.docx',
  github: 'https://github.com/sathishlella',
};

export const TYPED = ['LLM applications', 'RAG and GraphRAG retrieval', 'Agents that plan and act', 'Secure multi-tenant SaaS'];

export const ABOUT = {
  eyebrow: '01 / SUMMARY',
  title: 'Who I am',
  lead: 'AI Engineer with Python and software engineering experience developing LLM applications, retrieval-augmented generation (RAG), AI agents, document intelligence, and secure SaaS workflows.',
  bullets: [
    'Delivered end-to-end AI and data products spanning requirements, retrieval and API integration, evaluation, deployment, and monitoring.',
    'Built and operate a multi-tenant legal practice platform with permission-aware document analysis.',
    'Based in Selangor, Malaysia.',
  ],
};

export const JOBS = [
  {
    org: "Taylor's University",
    role: 'AI Research Engineer',
    when: 'Jul 2026 - Present',
    where: 'Selangor, Malaysia',
    points: ['Enterprise RAG on OpenSearch and Nomic embeddings', 'Fine-tuned Qwen, Mistral, Phi-4, DeepSeek R1', '98.4% verified identifier accuracy on 9,058 certificate layouts'],
  },
  {
    org: 'AI Engineering Consultant',
    role: 'Independent / Freelance',
    when: 'May 2024 - Jun 2026',
    where: 'Remote',
    points: ['Resume ranking for 200+ CVs a day, about 78% less manual screening time', 'GPT interview agent rated 4.7 / 5 by 50+ users', 'Recruiting CRM and automated Power BI reporting'],
  },
  {
    org: 'Lewis University',
    role: 'Academic Graduate Assistant',
    when: 'Jan 2024 - May 2024',
    where: 'Illinois, USA',
    points: ['Taught Data Analytics and Big Data programming', 'Graded undergraduate coursework with feedback', 'Research: LLMs, image and 3D segmentation'],
  },
  {
    org: 'Mphasis',
    role: 'Associate Software Engineer, client Charles Schwab',
    when: 'Aug 2021 - Dec 2022',
    where: 'Bangalore, India',
    points: ['Client accounts, API keys and access authorization', 'Postman validation before production release', 'Java backend, SQL and NoSQL, full stack when needed'],
  },
];

export const SKILLS = [
  {
    name: 'LLM, RAG and agents',
    items: ['Python', 'LLM APIs', 'Open-source LLMs', 'LangChain', 'LangGraph', 'LlamaIndex', 'MCP', 'Tool / function calling', 'Agent orchestration', 'Prompt and context engineering', 'Human-in-the-loop workflows'],
  },
  {
    name: 'Retrieval and evaluation',
    items: ['RAG', 'GraphRAG', 'Hybrid and semantic search', 'Embeddings', 'Vector retrieval', 'Reranking', 'OpenSearch', 'Nomic embeddings', 'Document ingestion', 'Hallucination mitigation', 'Retrieval and response evaluation'],
  },
  {
    name: 'Engineering and security',
    items: ['FastAPI', 'REST APIs', 'PostgreSQL', 'Supabase', 'SQL / NoSQL', 'Docker', 'Git / GitHub', 'CI/CD', 'API testing', 'Logging and monitoring', 'RBAC / RLS', 'Tenant isolation', 'MFA', 'Audit trails', 'React', 'TypeScript', 'Node.js'],
  },
];

export const EDU = [
  { title: 'DBA', meta: "Taylor's University  |  2026 - 2029  |  part-time" },
  { title: 'MS Data Science', meta: 'Lewis University, USA  |  2024  |  GPA 3.5 / 4.0' },
  { title: 'B.Tech Electronics and Communication Engineering', meta: 'Aditya University, India  |  2021' },
  { title: 'Certifications', meta: 'Cloud Computing Hands-on Training (The Cloud Bootcamp); IBM Watson, Power BI, GAN, Data Science, Machine Learning and Python' },
];

export const PROJECTS = [
  {
    id: 'legal',
    title: 'Legal Practice Platform',
    meta: 'Multi-tenant law-firm SaaS',
    points: ['Intake, matters, documents, invoicing, payroll', 'Firm isolation, RBAC/RLS, ethical walls, MFA', 'Permission-aware AI document analysis'],
    tech: 'Next.js, TypeScript, Supabase, PostgreSQL',
    href: 'https://legal-practice-platform-seven.vercel.app/',
    cta: 'Visit the platform',
  },
  {
    id: 'watermelon',
    title: 'Watermelon AI',
    meta: 'Software engineering agent',
    points: ['Plans, executes and validates GitHub workflows', 'Plan replay cuts repeated LLM calls', 'Python, Groq, GitHub API'],
    tech: 'Python, Groq, GitHub API',
    href: 'https://github.com/sathishlella/Autonomous-Platform-Intelligence-Agent',
    cta: 'View the source',
  },
  {
    id: 'geni',
    title: 'Geni',
    meta: 'Agentic operations',
    points: ['Natural-language analytics and forecasting', 'Alerts with signed human approval', 'Python, Groq, Prophet, FastAPI'],
    tech: 'Python, Groq, Prophet, FastAPI',
    href: 'https://www.sathishlella.online',
    cta: 'Start the walk',
  },
  {
    id: 'contractscan',
    title: 'ContractScan AI',
    meta: 'Document intelligence',
    points: ['60+ clause types, 80+ red-flag patterns', 'Explainable 0-100 risk scores', 'Structured guidance for human review'],
    tech: 'Contract risk analysis',
    href: 'https://contract-scan-gilt.vercel.app',
    cta: 'Open the live demo',
  },
  {
    id: 'mexa',
    title: 'MEXA',
    meta: 'Autonomous digital self research',
    points: ['Randomized conditions, server-side logic', 'LLM orchestration with safety constraints', 'Built for a planned 300+ participant study'],
    tech: 'Next.js/React, Supabase/PostgreSQL',
    href: 'https://www.sathishlella.online',
    cta: 'Start the walk',
  },
  {
    id: 'selfheal',
    title: 'SelfHeal AI',
    meta: 'Software reliability',
    points: ['120+ error patterns across 8 languages', '200+ rule knowledge base', 'Deterministic, explainable analysis'],
    tech: 'Deterministic analysis engine',
    href: 'https://github.com/sathishlella/selfheal',
    cta: 'View the source',
  },
  {
    id: 'more',
    title: 'More work',
    meta: 'Products and sites I have built',
    points: ['ATS AI, Dr. Arun AI dashboard, Velden Vault', 'Velden Health, YewYew Coffee, F1 website and CRM', 'Local image and video generation dashboard'],
    tech: 'Web products and client sites',
    href: 'https://www.sathishlella.online',
    cta: 'Start the walk',
  },
  {
    id: 'walk',
    title: 'Take the whole walk',
    meta: 'The interactive portfolio',
    points: ['A guide, a canoe and a waterfall', 'Twenty stops, each one narrated', 'sathishlella.online'],
    tech: '',
    href: 'https://www.sathishlella.online',
    cta: 'Start walking',
    special: true,
  },
];

export const MORE_REPOS = [
  { label: 'GitPulse AI', href: 'https://github.com/sathishlella/gitpulse-ai' },
  { label: 'ScenarioMind', href: 'https://github.com/sathishlella/ScenarioMind' },
  { label: 'SkillMap AI', href: 'https://github.com/sathishlella/SkillMap-AI' },
  { label: 'ATS AI', href: 'https://github.com/sathishlella/ats-ai-resume-builder' },
  { label: 'YewYew Coffee', href: 'https://github.com/sathishlella/yewyew-coffee-website' },
  { label: '100 Days, 100 AI Agents', href: 'https://github.com/sathishlella/100-days-100-ai-agents' },
];

export const PUBS = [
  {
    venue: 'Wiley book chapter',
    title: 'Real-Time Monitoring and Predictive Maintenance',
    id: 'DOI 10.1002/9781394303601.ch14',
    href: 'https://doi.org/10.1002/9781394303601.ch14',
  },
  {
    venue: 'Springer',
    title: 'Analysis of Received Signal Strength Based on User Position Locating by Using ML Methods',
    id: 'Machine learning for locating user position',
    href: 'https://link.springer.com/chapter/10.1007/978-981-15-7511-2_22',
  },
  {
    venue: 'Zenodo preprint',
    title: 'Standardizing Denial Management in Behavioral Health: A Quantitative Audit Protocol for Practice Revenue-Cycle Maturity',
    id: 'DOI 10.5281/zenodo.18453640',
    href: 'https://doi.org/10.5281/zenodo.18453640',
  },
];

export const CONTACT = {
  title: "Let's build something",
  thanks: 'Thank you for walking with me.',
  line: 'Available for select AI engineering engagements: multi-agent systems, RAG pipelines and production AI infrastructure.',
};
