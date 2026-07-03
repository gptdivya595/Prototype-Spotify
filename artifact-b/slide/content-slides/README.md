# Artifact B — 10-slide content package

This folder is the source package for a decision-oriented 10-slide deck. It deliberately contains **content and visual assets only**: no PDF, PPTX, or fabricated survey result has been created. The validation survey is published at [forms.gle/hydSSnu9THPnjnsd9](https://forms.gle/hydSSnu9THPnjnsd9).

## Narrative

The deck moves from evidence to decision:

1. Define the discovery problem and the decision requested.
2. Show the current competitive pattern using first-party product sources.
3. Quantify the complaint-enriched Artifact A evidence.
4. Explain qualitative behavior, including counterevidence.
5. Select the active discovery-seeker segment and its JTBD.
6. Frame the broken journey and precise intervention point.
7. Compare three solutions using directional ICE scoring.
8. Explain the selected Discovery Compass interaction and edge cases.
9. Pre-register survey and paired-prototype validation gates.
10. Define the KPI tree, risks, distribution sequence, and scale decision.

Every title is written as a takeaway rather than a generic section label. The deck manifest fixes the count at ten slides and defines an accessible, colour-blind-safe visual system with direct data labels.

## Files

- `deck-manifest.json` — deck-level story, slide order, design system, and decision.
- `slide-01.json` through `slide-10.json` — detailed copy, layout, visuals, notes, and sources for each slide.
- `chart-data.json` — observed Artifact A values and empty survey-result contracts.
- `survey-questionnaire.json` — 22-question, branch-ready Google Forms instrument and decision thresholds.
- `source-index.json` — claim-to-source traceability and evidence-handling rules.
- `coverage-matrix.json` — every requested deliverable mapped to a slide without exceeding ten slides.
- `validation-report.json` — machine-checked slide count, references, assets, dimensions, and empty survey placeholders.
- `diagrams/*.mmd` — editable Mermaid specifications for flows and trees.
- `diagrams/*.svg` — slide-ready accessible vector assets.
- `diagrams/*.png` — rendered 1600×900 assets for tools that do not preserve SVG.
- `render-diagrams.mjs` — deterministic SVG-to-PNG renderer.

## Evidence rules

- The Artifact A corpus contains 1,850 records; 266 are tagged as discovery-related.
- Theme tags can overlap, so their percentages do not add to 100%.
- The corpus is complaint-enriched and is not a representative survey of Spotify users.
- ICE scores, validation thresholds, and future KPIs are explicitly marked as PM judgments or hypotheses.
- Survey chart arrays stay empty until real Google Form responses are exported and cleaned.

## Planned survey charts on slide 9

The slide intentionally reserves space for three charts mapped to the questionnaire:

- Q14: willingness to spend about 20 seconds giving intent — donut.
- Q15: most valuable control — donut.
- Q08: recalled discovery failure mode — horizontal bar.

Populate the matching arrays in `chart-data.json` after fielding. Always show `n`, display every option, and avoid claims of statistical significance for the initial convenience sample.

## Regenerate images

Run the renderer only after editing an SVG:

```bash
node render-diagrams.mjs
```

The workspace renderer uses `sharp`; the current script can also locate the Codex-bundled dependency when it is not installed in Artifact B.

Run the structural validator after editing JSON or visuals:

```bash
node validate-content.mjs
```

## Next production steps

1. Field and clean the published Google Form; populate only the three waiting chart datasets.
2. Report the qualified response count and segment cuts before interpreting aggregate results.
3. Run the paired baseline-versus-Compass prototype study.
4. Revise claims using observed results, then compose the 10 slides and export the PDF.
