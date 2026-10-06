export const articles = [
  {
    slug: "molecular-docking-from-preparation-to-pose",
    category: "MOLECULAR DOCKING",
    minutes: 4,
    title: "Your first docking result: what should you look at?",
    subtitle:
      "The calculation has finished. Before you copy the best score into your report, spend a little time with the structure behind it.",
    image: "/editorial/docking-laboratory.jpg",
    imageAlt: "A scientist working on a laptop at a laboratory bench",
    photographer: "ThisisEngineering",
    photoUrl: "https://unsplash.com/photos/8yS04veb1TQ",
    photoContext: "Laboratory computing; illustrative stock photograph.",
    service: "cadd-molecular-docking",
    sections: [
      {
        title: "Start with a question you can answer",
        text: "A docking run gives you something satisfyingly concrete: a set of poses and a table of scores. It is tempting to begin your report with the top row. First, go back to the question that led you to run the calculation. Were you exploring where a ligand might sit, comparing a small group of compounds, or learning to reproduce an existing workflow? Write that question above your results. It will help you decide which observations belong in the discussion and which need more work.",
      },
      {
        title: "Prepare the receptor and ligand",
        text: "Before interpreting the output, check what actually went into the run. The Vina tutorial treats receptor preparation, ligand preparation and search-space definition as separate steps. Keep the original structures alongside the prepared files, and note the choices you made. A filename such as receptor_final gives your future self very little help. A short preparation note is much more useful: where the structure came from, which tool you used, and what you changed. If an unexpected result appears, you have somewhere sensible to start looking.",
        source: 0,
      },
      {
        title: "Look at the pose, not only the ranking",
        text: "Open the docked structure in your molecular viewer and turn it around. Check where the ligand sits and whether the interactions you describe are visible in the pose. Save a view that helps a reader follow your explanation. Vina scores are outputs of a scoring function; its documentation warns against comparing scores across different force fields directly. A favorable score alone does not establish binding in an experiment. Keep the numerical result and the structural interpretation together when you write.",
        source: 0,
      },
      {
        title: "Write down what you still need to check",
        text: "Try a simple four-column note: what I saw, what I think it means, what I am unsure about, and what to check next. A similar orientation across several poses belongs in the first column. Your explanation for that pattern belongs in the second. This small distinction makes a report easier to defend. You can describe a useful result without claiming that it proves biological activity. Finish with the next check your question needs, rather than ending the discussion at the lowest score.",
      },
    ],
    takeaway:
      "Treat docking as a structured way to generate and examine hypotheses, not as a standalone verdict.",
    references: [
      {
        label: "AutoDock Vina documentation — Basic docking",
        url: "https://autodock-vina.readthedocs.io/en/latest/docking_basic.html",
      },
      {
        label: "Eberhardt et al. (2021) — AutoDock Vina 1.2.0",
        url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC10683950/",
      },
    ],
  },
  {
    slug: "reading-admet-predictions",
    category: "RESEARCH PERSPECTIVES",
    minutes: 4,
    title: "An ADMET report is a starting point, not a verdict",
    subtitle:
      "A page full of predictions can look reassuringly definite. Here is how to read it without losing sight of what was actually calculated.",
    image: "/editorial/laboratory-pipette.jpg",
    imageAlt: "Gloved hands using a pipette to transfer a sample into a vial",
    photographer: "CDC",
    photoUrl: "https://unsplash.com/photos/wDxFn_dBEC0",
    photoContext:
      "Molecular testing at the CDC; illustrative laboratory photograph, not an ADMET experiment.",
    service: "admet-target-identification",
    sections: [
      {
        title: "Read the property names before the colours",
        text: "When a report arrives as a long table, it is easy to scan for reassuring labels and skip the headings. Slow down at the first column. SwissADME includes physicochemical descriptors, pharmacokinetic predictions, drug-likeness measures and medicinal-chemistry filters. They answer different questions. Pick one row and explain, in ordinary language, what it describes. If you cannot do that yet, read the tool documentation before giving the result a place in your conclusion. No single favourable entry sums up the entire compound.",
        source: 0,
      },
      {
        title: "Save the compound and tool details",
        text: "Save the exact molecular representation you submitted, not just the compound name. Keep it with the tool name, access date and downloaded output. Imagine comparing two reports a month later and finding different results. Without the submitted inputs, you may not know whether you are even comparing the same calculation. A small worksheet is enough: one compound identifier, one input, and a link to the saved report. Make this part of the routine while the browser tab is still open.",
      },
      {
        title: "Compare the compound profiles",
        text: "Before ranking compounds, decide what the comparison is for. A shortlist for further study needs an explanation of the properties you considered, not just a winner highlighted in green. The figure below uses invented values as a reading exercise; it is not a predictive model or an experimental dataset. Follow one compound across the figure rather than reading each column in isolation. Then ask what information you would still need before choosing a next step. State the reason for your comparison alongside the table.",
      },
      {
        title: "Explain the limits of the predictions",
        text: "In a draft report, look for sentences that begin with “the compound is safe” or “the compound has good activity.” Does the output actually support that statement? The SwissADME paper describes computational models and their evaluation; a prediction is not a measurement in your laboratory. Name the tool and the particular property it predicted. Be specific about the uncertainty and the experimental work still needed. Careful wording does not weaken your discussion. It tells readers exactly what evidence you have.",
        source: 0,
      },
    ],
    takeaway:
      "Use predictions to organize the next questions. Preserve the distinction between modeled properties and measured behavior.",
    references: [
      {
        label: "Daina, Michielin & Zoete (2017) — SwissADME",
        url: "https://www.nature.com/articles/srep42717",
      },
      {
        label: "SwissADME — About the tool",
        url: "https://www.swissadme.ch/about.php",
      },
    ],
  },
  {
    slug: "a-reproducible-cadd-workflow",
    category: "BETTER RESEARCH HABITS",
    minutes: 4,
    title: "Make your CADD project easier to pick up again",
    subtitle:
      "A few notes saved today can spare you an afternoon of guessing which file produced the figure in your report.",
    image: "/editorial/research-notebook.jpg",
    imageAlt: "An open notebook beside a laptop on a white desk",
    photographer: "JESHOOTS.COM",
    photoUrl: "https://unsplash.com/photos/pUAM5hPaCRI",
    photoContext: "A study workspace; illustrative stock photograph.",
    service: "molecular-design",
    sections: [
      {
        title: "Leave a note for the person returning to the project",
        text: "That person might be you, two weeks from now. You open a folder and find three versions of the same figure, several prepared structures and a file called final_new. Which one belongs in the report? Start a plain-text README before the project grows. Write down the question, where the inputs came from, and the order of the steps. Sandve and colleagues recommend preserving the information needed to trace and repeat a computational analysis. You do not need an elaborate system to begin following that advice.",
        source: 0,
      },
      {
        title: "Separate inputs, methods and outputs",
        text: "Try keeping source structures, prepared files, run settings, raw outputs and report figures in separate folders. This is a working suggestion, not a rule about how every laboratory should operate. The important part is that an original download cannot be mistaken for a structure you have edited. Give each run a short identifier and use it in the output folder and your notes. When you compare two runs, write one sentence explaining what changed. The folder names should help you find that sentence again.",
      },
      {
        title: "Save the software settings",
        text: "A screenshot of a settings window is better than relying on memory, but a saved configuration or command is easier to reuse. Record the software version and the settings relevant to the calculation, including any random seed. If you adjust a file by hand, leave a note about what you changed and why. Sandve and colleagues specifically discuss random seeds and undocumented manual edits as reproducibility concerns. Make a habit of saving these details when you run the analysis, while they are still easy to retrieve.",
        source: 0,
      },
      {
        title: "Check that someone else can repeat the steps",
        text: "Before handing over the project, pick one figure and work backwards. Can you find the output behind it, the settings that produced that output, and the original input? Ask a classmate to try using only your README. Anywhere they have to ask you for directions is a useful place to add a note. This exercise checks whether the work can be followed; it does not prove that the scientific conclusion is correct. It does make the next review, correction or follow-up much easier.",
      },
    ],
    takeaway:
      "A useful research handover explains not only what you found, but how another person can examine the path you took.",
    references: [
      {
        label:
          "Sandve et al. (2013) — Ten Simple Rules for Reproducible Computational Research",
        url: "https://journals.plos.org/ploscompbiol/article?id=10.1371/journal.pcbi.1003285",
      },
    ],
  },
];
