import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const manifest = JSON.parse(await fs.readFile(path.join(__dirname, "deck-manifest.json"), "utf8"));
const chartData = JSON.parse(await fs.readFile(path.join(__dirname, "chart-data.json"), "utf8"));
const survey = JSON.parse(await fs.readFile(path.join(__dirname, "survey-questionnaire.json"), "utf8"));

const checks = [];
const failures = [];

function check(name, condition, detail) {
  const result = { name, status: condition ? "pass" : "fail", detail };
  checks.push(result);
  if (!condition) failures.push(result);
}

check("exactly_ten_slides", manifest.slide_count === 10 && manifest.slides.length === 10, `${manifest.slides.length} slide files listed`);
check("slide_limit_respected", manifest.slide_count <= manifest.slide_limit, `${manifest.slide_count}/${manifest.slide_limit}`);
check("pdf_not_created", manifest.pdf_status === "not_requested_yet", manifest.pdf_status);

const slides = [];
for (const [index, filename] of manifest.slides.entries()) {
  const fullPath = path.join(__dirname, filename);
  const raw = await fs.readFile(fullPath, "utf8");
  const slide = JSON.parse(raw);
  slides.push(slide);
  check(`slide_${index + 1}_number`, slide.slide_number === index + 1, `${filename}: ${slide.slide_number}`);
  check(`slide_${index + 1}_message_title`, typeof slide.title === "string" && slide.title.split(/\s+/).length >= 7, slide.title);
  check(`slide_${index + 1}_objective`, typeof slide.objective === "string" && slide.objective.length >= 40, `${slide.objective?.length ?? 0} characters`);
  check(`slide_${index + 1}_speaker_notes`, Array.isArray(slide.speaker_notes) && slide.speaker_notes.length > 0, `${slide.speaker_notes?.length ?? 0} notes`);
  check(`slide_${index + 1}_sources`, Array.isArray(slide.sources) && slide.sources.length > 0, `${slide.sources?.length ?? 0} sources`);
  check(`slide_${index + 1}_visuals`, Array.isArray(slide.visuals) && slide.visuals.length > 0, `${slide.visuals?.length ?? 0} visual specifications`);

  for (const visual of slide.visuals ?? []) {
    if (visual.asset) {
      const assetPath = path.join(__dirname, visual.asset);
      let exists = true;
      try {
        await fs.access(assetPath);
      } catch {
        exists = false;
      }
      check(`${filename}_${path.basename(visual.asset)}_exists`, exists, visual.asset);
    }
    if (visual.source) {
      const sourcePath = path.join(__dirname, visual.source);
      let exists = true;
      try {
        await fs.access(sourcePath);
      } catch {
        exists = false;
      }
      check(`${filename}_${path.basename(visual.source)}_exists`, exists, visual.source);
    }
    check(`${filename}_visual_alt_text`, typeof visual.alt === "string" && visual.alt.length >= 25, visual.alt ?? "missing");
  }

  for (const source of slide.sources ?? []) {
    if (!source.path) continue;
    const sourcePath = path.resolve(__dirname, source.path);
    let exists = true;
    try {
      await fs.access(sourcePath);
    } catch {
      exists = false;
    }
    check(`${filename}_source_${path.basename(source.path)}_exists`, exists, source.path);
  }
}

const questionCount = survey.sections.reduce((sum, section) => sum + section.questions.length, 0);
check("survey_question_count", questionCount === 22, `${questionCount} questions`);
check("survey_published", survey.google_form_url === "https://forms.gle/hydSSnu9THPnjnsd9" && survey.status === "published_collecting_responses", survey.status);
check("survey_has_branching", survey.sections.some((section) => section.questions.some((question) => question.branching)), "branch logic present");
check("survey_has_decision_thresholds", Object.keys(survey.decision_thresholds).length === 3, Object.keys(survey.decision_thresholds).join(", "));

const pendingSurveyCharts = Object.entries(chartData.charts).filter(([, chart]) => chart.status === "awaiting_google_form_responses");
check("three_survey_chart_placeholders", pendingSurveyCharts.length === 3, `${pendingSurveyCharts.length} placeholders`);
check("survey_chart_arrays_empty", pendingSurveyCharts.every(([, chart]) => chart.n === null && Array.isArray(chart.data) && chart.data.length === 0), "no synthetic survey values");

const diagramDir = path.join(__dirname, "diagrams");
const diagramFiles = await fs.readdir(diagramDir);
check("ten_svg_assets", diagramFiles.filter((file) => file.endsWith(".svg")).length === 10, `${diagramFiles.filter((file) => file.endsWith(".svg")).length} SVGs`);
check("ten_png_assets", diagramFiles.filter((file) => file.endsWith(".png")).length === 10, `${diagramFiles.filter((file) => file.endsWith(".png")).length} PNGs`);
check("six_mermaid_sources", diagramFiles.filter((file) => file.endsWith(".mmd")).length === 6, `${diagramFiles.filter((file) => file.endsWith(".mmd")).length} Mermaid files`);

for (const file of diagramFiles.filter((entry) => entry.endsWith(".png"))) {
  const buffer = await fs.readFile(path.join(diagramDir, file));
  const pngSignature = buffer.subarray(1, 4).toString("ascii") === "PNG";
  const width = pngSignature ? buffer.readUInt32BE(16) : null;
  const height = pngSignature ? buffer.readUInt32BE(20) : null;
  check(`${file}_dimensions`, width === 1600 && height === 900, `${width}×${height}`);
}

const siblingFiles = await fs.readdir(__dirname);
check("no_pdf_or_pptx", !siblingFiles.some((file) => /\.(pdf|pptx)$/i.test(file)), "content package only");

const report = {
  generated_on: new Date().toISOString(),
  status: failures.length === 0 ? "pass" : "fail",
  summary: {
    checks: checks.length,
    passed: checks.length - failures.length,
    failed: failures.length,
    slides: slides.length,
    survey_questions: questionCount,
    svg_assets: diagramFiles.filter((file) => file.endsWith(".svg")).length,
    png_assets: diagramFiles.filter((file) => file.endsWith(".png")).length,
    mermaid_sources: diagramFiles.filter((file) => file.endsWith(".mmd")).length
  },
  failures,
  checks
};

await fs.writeFile(path.join(__dirname, "validation-report.json"), `${JSON.stringify(report, null, 2)}\n`, "utf8");
console.log(JSON.stringify(report.summary, null, 2));

if (failures.length > 0) process.exitCode = 1;
