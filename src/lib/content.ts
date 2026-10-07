import { workshop } from "./workshop";

export const services = [
  {
    slug: "cadd-molecular-docking",
    title: "CADD & molecular docking",
    short: "Protein preparation, ligand docking, QSAR and PASS analysis.",
    description:
      "Explore structure-based and ligand-based drug design, receptor–ligand interactions, QSAR modeling and PASS biological activity predictions.",
    tags: ["Molecular docking", "QSAR", "PASS"],
    audience:
      "Students and researchers developing computational drug-discovery projects.",
    steps: [
      "Frame a clear research question and select relevant molecular data.",
      "Prepare structures and design a documented computational workflow.",
      "Interpret predictions alongside their assumptions and limitations.",
    ],
  },
  {
    slug: "admet-target-identification",
    title: "ADME/Tox & target identification",
    short: "Predict molecular properties and compare ADMET results.",
    description:
      "Investigate predicted pharmacokinetics, toxicity risks and candidate therapeutic targets to inform the next stage of your research.",
    tags: ["SwissADME", "ProTox", "Target profiling"],
    audience:
      "Researchers comparing candidate compounds and planning follow-up investigation.",
    steps: [
      "Define the compound set and research context.",
      "Evaluate predicted properties with appropriate tools.",
      "Compare evidence, flag uncertainty and identify next experiments.",
    ],
  },
  {
    slug: "molecular-design",
    title: "Network pharmacology & molecular design",
    short: "Explore compounds, target networks and biological pathways.",
    description:
      "Study compound–target relationships with STRING, Cytoscape and KEGG, then connect network analysis to a documented molecular-design or screening workflow.",
    tags: ["STRING / Cytoscape", "KEGG pathways"],
    audience:
      "Research groups developing reproducible screening and molecular-design approaches.",
    steps: [
      "Map the design problem and available inputs.",
      "Build a transparent compound-selection or screening workflow.",
      "Document the rationale and assess candidate limitations.",
    ],
  },
  {
    slug: "manuscripts-patents-grants",
    title: "Manuscripts, patents & grants",
    short: "Help with scientific writing, figures and research proposals.",
    description:
      "Scientific manuscript development, publication-quality graphics, patent prior-art research and grant proposal support.",
    tags: ["Scientific writing", "Research graphics", "Proposals"],
    audience:
      "Researchers communicating their own work to journals, funders and collaborators.",
    steps: [
      "Review your source research, intended audience and requirements.",
      "Strengthen structure, figures and the presentation of evidence.",
      "Refine clarity and attribution; authors retain responsibility for their work.",
    ],
  },
  {
    slug: "thesis-dissertation",
    title: "Thesis & dissertation guidance",
    short: "Guidance on research methods, analysis and thesis preparation.",
    description:
      "Structured academic mentoring from research-question formulation and methodology to interpretation and defense preparation.",
    tags: ["M.Pharm / Ph.D.", "Methodology"],
    audience:
      "Postgraduate and doctoral scholars seeking guidance on their own research.",
    steps: [
      "Refine scope and a feasible research question.",
      "Plan and review methods with your institutional requirements in mind.",
      "Discuss results, limitations and presentation of your independent work.",
    ],
  },
  {
    slug: "hands-on-workshops",
    title: "Hands-on scientific workshops",
    short: "Practical software training · structured hands-on modules.",
    description: "Chemizen Labs offers short Network Pharmacology & CADD workshops and a separate one-month Molecular Docking internship. Training covers molecular preparation, docking, visualisation and property prediction. Contact us for the next intake, syllabus and fees.",
    tags: ["Live learning", "Real datasets", "Practical tools"],
    audience:
      "Students, faculty and institutions seeking applied computational training.",
    steps: [
      "Discuss your current experience and learning objectives.",
      "Work through preparation, analysis and visualization exercises.",
      "Review practical questions and potential next projects.",
    ],
  },
  {
    slug: "scientific-mentoring",
    title: "Scientific mentoring & careers",
    short: "One-to-one advice on research skills and career options.",
    description:
      "One-to-one mentorship for learners exploring pharmaceutical R&D, computational chemistry and academic research pathways.",
    tags: ["1:1 mentoring", "Research careers"],
    audience:
      "Students and early-career scientists building a focused learning pathway.",
    steps: [
      "Explore your interests, experience and goals.",
      "Identify skills and projects relevant to your direction.",
      "Build a practical development plan and review your progress.",
    ],
  },
  {
    slug: "research-data-analysis",
    title: "Research data & interpretation",
    short: "Analyze results, compare compounds and prepare research figures.",
    description:
      "Support for statistical analysis, binding-energy interpretation, correlation matrices, phytochemical screening and clear scientific figures.",
    tags: ["Statistics", "Visual data", "Interpretation"],
    audience:
      "Researchers who need to turn computational outputs into carefully supported conclusions.",
    steps: [
      "Review the origin, quality and structure of your data.",
      "Select analyses matched to the question and underlying assumptions.",
      "Create transparent figures and discuss limitations.",
    ],
  },
];
export const serviceOptions = [
  ...services.map((s) => s.title),
  "Institutional collaboration",
  "Journal enquiry",
  "General enquiry",
];
