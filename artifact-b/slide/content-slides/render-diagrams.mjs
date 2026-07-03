import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.join(__dirname, "diagrams");

let sharp;
try {
  sharp = (await import("sharp")).default;
} catch {
  sharp = (
    await import(
      "/Users/shukugup/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp/lib/index.js"
    )
  ).default;
}

const C = {
  paper: "#F7F3E8",
  ink: "#142033",
  blue: "#145FCC",
  blueSoft: "#DCE8F8",
  coral: "#D95D43",
  coralSoft: "#F8DDD6",
  green: "#247A5A",
  greenSoft: "#DDEFE6",
  white: "#FFFFFF",
  gray: "#667085",
  line: "#9DB4D6",
  pale: "#ECE7DC"
};

const esc = (value) =>
  String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");

function rect(x, y, w, h, options = {}) {
  const {
    fill = C.white,
    stroke = C.line,
    sw = 2,
    rx = 22,
    dash = "",
    opacity = 1
  } = options;
  return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" fill="${fill}" fill-opacity="${opacity}" stroke="${stroke}" stroke-width="${sw}"${dash ? ` stroke-dasharray="${dash}"` : ""}/>`;
}

function line(x1, y1, x2, y2, options = {}) {
  const { stroke = C.line, sw = 3, dash = "", arrow = false } = options;
  return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${stroke}" stroke-width="${sw}" stroke-linecap="round"${dash ? ` stroke-dasharray="${dash}"` : ""}${arrow ? ' marker-end="url(#arrow)"' : ""}/>`;
}

function polyline(points, options = {}) {
  const { stroke = C.line, sw = 3, dash = "", arrow = false } = options;
  return `<polyline points="${points}" fill="none" stroke="${stroke}" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round"${dash ? ` stroke-dasharray="${dash}"` : ""}${arrow ? ' marker-end="url(#arrow)"' : ""}/>`;
}

function circle(cx, cy, r, options = {}) {
  const { fill = C.white, stroke = C.line, sw = 2 } = options;
  return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}"/>`;
}

function textBlock(x, y, lines, options = {}) {
  const {
    size = 26,
    weight = 500,
    fill = C.ink,
    lineHeight = Math.round(size * 1.28),
    anchor = "start",
    family = "Inter, Arial, sans-serif",
    letterSpacing = 0
  } = options;
  const values = Array.isArray(lines) ? lines : [lines];
  const tspans = values
    .map((value, index) => `<tspan x="${x}" dy="${index === 0 ? 0 : lineHeight}">${esc(value)}</tspan>`)
    .join("");
  return `<text x="${x}" y="${y}" text-anchor="${anchor}" font-family="${family}" font-size="${size}" font-weight="${weight}" fill="${fill}" letter-spacing="${letterSpacing}">${tspans}</text>`;
}

function pill(x, y, w, label, options = {}) {
  const { fill = C.blueSoft, color = C.blue, stroke = fill } = options;
  return `${rect(x, y, w, 42, { fill, stroke, rx: 21, sw: 1 })}${textBlock(x + w / 2, y + 28, label, { size: 18, weight: 700, fill: color, anchor: "middle" })}`;
}

function base(title, subtitle, body, description) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="900" viewBox="0 0 1600 900" role="img" aria-labelledby="title desc">
  <title id="title">${esc(title)}</title>
  <desc id="desc">${esc(description)}</desc>
  <defs>
    <marker id="arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="8" markerHeight="8" orient="auto-start-reverse">
      <path d="M 0 0 L 10 5 L 0 10 z" fill="context-stroke"/>
    </marker>
    <pattern id="pending" width="16" height="16" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
      <rect width="16" height="16" fill="#FFFFFF"/>
      <rect width="4" height="16" fill="#DCE8F8"/>
    </pattern>
    <filter id="shadow" x="-10%" y="-10%" width="120%" height="130%">
      <feDropShadow dx="0" dy="6" stdDeviation="8" flood-color="#142033" flood-opacity="0.08"/>
    </filter>
  </defs>
  <rect width="1600" height="900" fill="${C.paper}"/>
  ${textBlock(60, 66, title, { size: 34, weight: 800 })}
  ${textBlock(60, 108, subtitle, { size: 21, weight: 500, fill: C.gray })}
  ${line(60, 132, 1540, 132, { stroke: C.line, sw: 2 })}
  ${body}
</svg>`;
}

function evidenceToDecision() {
  const stats = [
    ["1,850", "public records", "App Store · Play · Reddit"],
    ["266", "discovery-related", "14.4% of collected corpus"],
    ["72 / 70", "top tagged mechanisms", "taste mismatch / repetition"]
  ];
  let body = pill(60, 160, 190, "OBSERVED EVIDENCE");
  stats.forEach((s, i) => {
    const x = 60 + i * 385;
    body += rect(x, 220, 345, 180, { fill: C.white, stroke: C.blue, sw: 2 });
    body += textBlock(x + 24, 278, s[0], { size: 45, weight: 800, fill: C.blue });
    body += textBlock(x + 24, 319, s[1], { size: 24, weight: 700 });
    body += textBlock(x + 24, 359, s[2], { size: 18, weight: 500, fill: C.gray });
    if (i < 2) body += line(x + 345, 310, x + 380, 310, { stroke: C.blue, arrow: true });
  });
  body += rect(1215, 220, 325, 180, { fill: C.coralSoft, stroke: C.coral, sw: 3 });
  body += textBlock(1239, 266, "PROBLEM", { size: 18, weight: 800, fill: C.coral });
  body += textBlock(1239, 310, ["Past taste does not", "express current intent"], { size: 27, weight: 800, lineHeight: 34 });
  body += line(1378, 400, 1378, 466, { stroke: C.coral, arrow: true });
  body += rect(175, 485, 780, 165, { fill: C.greenSoft, stroke: C.green, sw: 3 });
  body += pill(205, 510, 245, "CHOSEN HYPOTHESIS", { fill: C.green, color: C.white, stroke: C.green });
  body += textBlock(205, 585, "Discovery Compass", { size: 37, weight: 800, fill: C.green });
  body += textBlock(205, 625, "Anchors + approved intent + novelty control + visible feedback", { size: 22, fill: C.ink });
  body += line(955, 568, 1030, 568, { stroke: C.green, arrow: true });
  body += rect(1050, 485, 490, 165, { fill: C.white, stroke: C.ink, sw: 3 });
  body += textBlock(1080, 530, "DECISION GATE", { size: 18, weight: 800, fill: C.gray });
  body += textBlock(1080, 575, ["Does guided intent improve", "accepted novelty vs. baseline?"], { size: 29, weight: 800, lineHeight: 36 });
  body += rect(175, 700, 1365, 96, { fill: C.white, stroke: C.line, sw: 2, rx: 18 });
  body += textBlock(205, 742, "Interpretation boundary", { size: 18, weight: 800, fill: C.coral });
  body += textBlock(205, 778, "The corpus identifies mechanisms and language; it does not estimate prevalence among all Spotify users.", { size: 23, weight: 600 });
  return base("Evidence → product hypothesis → testable decision", "One line of sight from Artifact A to the Artifact B gate", body, "A flow from 1,850 records to 266 discovery records, top mechanisms, the Discovery Compass hypothesis, and a paired validation gate.");
}

function competitiveLandscape() {
  const competitors = [
    { name: "Spotify", feature: ["DJ requests", "Prompted Playlist beta", "DW genre controls"], strength: "Multiple guided surfaces", gap: "Control is split across surfaces" },
    { name: "Apple Music", feature: ["Discovery Station", "Home suggestions", "New exploration"], strength: "Low-friction continuous play", gap: "Limited visible intent editing" },
    { name: "YouTube", feature: ["Samples feed", "Short-form preview", "Save / deepen actions"], strength: "Fast audition loop", gap: "Weak session constraint model" },
    { name: "TIDAL", feature: ["Daily Discovery", "10 tracks daily", "Listening-led profile"], strength: "Bounded daily set", gap: "History remains primary input" }
  ];
  let body = textBlock(60, 175, "CURRENT PRODUCT PATTERN", { size: 18, weight: 800, fill: C.blue });
  competitors.forEach((c, i) => {
    const x = 45 + i * 390;
    body += rect(x, 205, 360, 510, { fill: C.white, stroke: i === 0 ? C.blue : C.line, sw: i === 0 ? 3 : 2 });
    body += textBlock(x + 25, 258, c.name, { size: 33, weight: 800, fill: i === 0 ? C.blue : C.ink });
    body += line(x + 25, 280, x + 335, 280, { stroke: C.pale, sw: 2 });
    body += textBlock(x + 25, 319, "WHAT EXISTS", { size: 16, weight: 800, fill: C.gray });
    body += textBlock(x + 25, 358, c.feature, { size: 22, weight: 650, lineHeight: 35 });
    body += textBlock(x + 25, 500, "STRENGTH", { size: 16, weight: 800, fill: C.green });
    body += textBlock(x + 25, 540, c.strength, { size: 21, weight: 650 });
    body += textBlock(x + 25, 610, "OPEN GAP", { size: 16, weight: 800, fill: C.coral });
    body += textBlock(x + 25, 650, c.gap, { size: 20, weight: 650 });
  });
  body += rect(45, 745, 1530, 105, { fill: C.greenSoft, stroke: C.green, sw: 3, rx: 18 });
  body += textBlock(75, 789, "WHITE SPACE", { size: 18, weight: 800, fill: C.green });
  body += textBlock(255, 780, ["One session-scoped loop with explicit intent, editable constraints and novelty control—", "plus a visible response to feedback."], { size: 21, weight: 700, lineHeight: 31 });
  return base("Competitors guide discovery, but editable intent is still fragmented", "First-party product capability comparison — not a performance benchmark", body, "Four competitor cards compare Spotify, Apple Music, YouTube, and TIDAL, ending in a white-space statement for session-scoped editable intent.");
}

function researchEvidence() {
  const bars = [
    ["Taste mismatch", 72, 27.1],
    ["Repetition", 70, 26.3],
    ["Too similar", 50, 18.8],
    ["Popular dominates", 49, 18.4],
    ["Stale Discover Weekly", 48, 18.0],
    ["Insufficient control", 46, 17.3]
  ];
  let body = rect(50, 170, 430, 650, { fill: C.white, stroke: C.line, sw: 2 });
  body += textBlock(80, 220, "CORPUS", { size: 18, weight: 800, fill: C.blue });
  body += textBlock(80, 292, "266", { size: 70, weight: 850, fill: C.blue });
  body += textBlock(80, 334, "discovery-related records", { size: 24, weight: 700 });
  body += textBlock(80, 374, "14.4% of 1,850 collected records", { size: 19, fill: C.gray });
  body += textBlock(80, 446, "SOURCE MIX", { size: 18, weight: 800, fill: C.gray });
  const totalW = 350;
  body += rect(80, 475, totalW, 48, { fill: C.pale, stroke: C.pale, rx: 8 });
  body += `<rect x="80" y="475" width="227" height="48" rx="8" fill="${C.blue}"/>`;
  body += `<rect x="307" y="475" width="104" height="48" fill="${C.green}"/>`;
  body += `<rect x="411" y="475" width="19" height="48" rx="8" fill="${C.coral}"/>`;
  body += textBlock(80, 565, ["Google Play  1,200  (64.9%)", "Reddit  550  (29.7%)", "App Store  100  (5.4%)"], { size: 20, weight: 650, lineHeight: 38 });
  body += rect(80, 700, 350, 80, { fill: C.coralSoft, stroke: C.coral, sw: 2, rx: 14 });
  body += textBlock(100, 733, "Complaint-enriched", { size: 20, weight: 800, fill: C.coral });
  body += textBlock(100, 762, "Not population prevalence", { size: 18, weight: 650 });
  body += textBlock(535, 188, "TOP DISCOVERY THEMES", { size: 18, weight: 800, fill: C.blue });
  body += textBlock(1480, 188, "% of 266", { size: 16, weight: 700, fill: C.gray, anchor: "end" });
  bars.forEach((b, i) => {
    const y = 235 + i * 87;
    const w = b[1] * 10.5;
    body += textBlock(535, y + 27, b[0], { size: 22, weight: 700 });
    body += rect(800, y, 665, 40, { fill: C.pale, stroke: C.pale, rx: 8 });
    body += `<rect x="800" y="${y}" width="${w}" height="40" rx="8" fill="${i < 2 ? C.blue : C.line}"/>`;
    body += textBlock(1480, y + 28, `${b[1]}  ·  ${b[2]}%`, { size: 19, weight: 800, anchor: "end" });
  });
  body += textBlock(535, 804, "Multi-label coding: one record can contribute to more than one bar.", { size: 19, weight: 650, fill: C.gray });
  return base("Taste mismatch and repetition lead the complaint hierarchy", "Observed Artifact A counts; direct labels preserve meaning without colour", body, "A source mix summary and horizontal bar chart show 266 discovery records, led by taste mismatch and repetition.");
}

function behaviorLoop() {
  const nodes = [
    ["1", "Past behavior", "Persistent profile"],
    ["2", "Intent missing", "Moment stays implicit"],
    ["3", "Familiar cluster", "Repeatedly ranked"],
    ["4", "Recovery work", "Skip · search · leave"],
    ["5", "Noisy feedback", "Loop learns little"]
  ];
  let body = textBlock(60, 175, "EVIDENCE-BACKED BEHAVIOR LOOP", { size: 18, weight: 800, fill: C.blue });
  nodes.forEach((n, i) => {
    const x = 55 + i * 305;
    body += circle(x + 42, 267, 35, { fill: C.blue, stroke: C.blue, sw: 2 });
    body += textBlock(x + 42, 277, n[0], { size: 25, weight: 850, fill: C.white, anchor: "middle" });
    body += rect(x, 325, 270, 150, { fill: C.white, stroke: C.blue, sw: 2 });
    body += textBlock(x + 20, 375, n[1], { size: 24, weight: 800 });
    body += textBlock(x + 20, 418, n[2], { size: 20, weight: 600, fill: C.gray });
    if (i < 4) body += line(x + 270, 400, x + 295, 400, { stroke: C.blue, arrow: true });
  });
  body += polyline("1455,475 1455,525 95,525 95,485", { stroke: C.blue, sw: 3, arrow: true });
  body += rect(55, 585, 720, 195, { fill: C.coralSoft, stroke: C.coral, sw: 2 });
  body += textBlock(85, 627, "COUNTEREVIDENCE LIMITS THE CLAIM", { size: 18, weight: 800, fill: C.coral });
  body += textBlock(85, 674, ["Some listeners value familiarity; some surfaces", "work well. The problem is not universal failure."], { size: 25, weight: 700, lineHeight: 36 });
  body += rect(825, 585, 720, 195, { fill: C.greenSoft, stroke: C.green, sw: 3 });
  body += textBlock(855, 627, "DESIGN IMPLICATION", { size: 18, weight: 800, fill: C.green });
  body += textBlock(855, 674, ["Make current intent explicit and novelty optional,", "session-scoped, editable, and reversible."], { size: 25, weight: 750, lineHeight: 36 });
  return base("Discovery failures can reinforce the same recommendation loop", "Reported behavior explains a mechanism; counterevidence prevents an absolute claim", body, "A five-step loop connects past behavior, missing current intent, familiar ranking, recovery work, and noisy feedback, with counterevidence and a design implication.");
}

function personaJtbd() {
  let body = pill(55, 165, 205, "PRIMARY SEGMENT");
  body += rect(55, 225, 400, 585, { fill: C.white, stroke: C.blue, sw: 3 });
  body += circle(130, 310, 48, { fill: C.blueSoft, stroke: C.blue, sw: 3 });
  body += textBlock(130, 321, "AS", { size: 28, weight: 850, fill: C.blue, anchor: "middle" });
  body += textBlock(200, 298, "Asha", { size: 36, weight: 850 });
  body += textBlock(200, 337, "Active discovery seeker", { size: 22, weight: 700, fill: C.blue });
  body += line(85, 385, 425, 385, { stroke: C.pale, sw: 2 });
  body += textBlock(85, 430, "CONTEXT", { size: 17, weight: 800, fill: C.gray });
  body += textBlock(85, 469, ["Large listening history", "Explores at least monthly", "Mood and activity shift intent"], { size: 22, weight: 650, lineHeight: 38 });
  body += textBlock(85, 610, "OBSERVED WORKAROUNDS", { size: 17, weight: 800, fill: C.gray });
  body += textBlock(85, 650, ["Manual playlists", "Private sessions", "External discovery sources"], { size: 22, weight: 650, lineHeight: 38 });
  body += rect(500, 225, 645, 585, { fill: C.greenSoft, stroke: C.green, sw: 3 });
  body += textBlock(535, 275, "JOB TO BE DONE", { size: 18, weight: 800, fill: C.green });
  body += textBlock(535, 340, ["When I intentionally explore,", "help me find music that is", "unfamiliar enough to discover", "but recognisable enough to fit", "my current mood or activity—", "without reshaping my profile."], { size: 32, weight: 800, lineHeight: 48 });
  body += textBlock(535, 690, "Desired progress", { size: 18, weight: 800, fill: C.green });
  body += textBlock(535, 730, "Relevant novelty with confidence and control", { size: 25, weight: 750 });
  body += rect(1190, 225, 355, 270, { fill: C.white, stroke: C.coral, sw: 2 });
  body += textBlock(1220, 270, "PAINS", { size: 17, weight: 800, fill: C.coral });
  body += textBlock(1220, 315, ["Taste mismatch", "Repeated artists", "Too-similar results", "Feedback feels ignored"], { size: 22, weight: 700, lineHeight: 39 });
  body += rect(1190, 530, 355, 280, { fill: C.white, stroke: C.green, sw: 2 });
  body += textBlock(1220, 575, "SUCCESS", { size: 17, weight: 800, fill: C.green });
  body += textBlock(1220, 620, ["Saves a new artist", "Understands the fit", "Can steer the next set", "Keeps familiar listening safe"], { size: 22, weight: 700, lineHeight: 39 });
  return base("The priority user seeks relevant novelty, not maximum novelty", "Proto-persona grounded in Artifact A behavior tags; validate identity details in interviews", body, "A persona card for Asha, a central jobs-to-be-done statement, pains, and success outcomes.");
}

function userJourney() {
  const stages = [
    ["1", "Trigger", "Need music for", "this moment", "High intent"],
    ["2", "Express", "Choose surface", "or type a search", "Intent becomes lossy"],
    ["3", "Evaluate", "Scan familiar or", "repeated results", "Trust falls"],
    ["4", "Recover", "Skip · refine ·", "build · leave", "Effort rises"],
    ["5", "Outcome", "Save a discovery", "or abandon", "Progress varies"]
  ];
  let body = textBlock(60, 175, "CURRENT JOURNEY", { size: 18, weight: 800, fill: C.blue });
  stages.forEach((s, i) => {
    const x = 55 + i * 305;
    body += circle(x + 42, 235, 32, { fill: i === 1 ? C.coral : C.blue, stroke: i === 1 ? C.coral : C.blue });
    body += textBlock(x + 42, 244, s[0], { size: 22, weight: 850, fill: C.white, anchor: "middle" });
    body += rect(x, 295, 270, 300, { fill: C.white, stroke: i === 1 ? C.coral : C.line, sw: i === 1 ? 3 : 2 });
    body += textBlock(x + 20, 342, s[1], { size: 27, weight: 850, fill: i === 1 ? C.coral : C.ink });
    body += textBlock(x + 20, 395, [s[2], s[3]], { size: 23, weight: 650, lineHeight: 35 });
    body += line(x + 20, 490, x + 250, 490, { stroke: C.pale, sw: 2 });
    body += textBlock(x + 20, 540, s[4], { size: 19, weight: 800, fill: i === 1 ? C.coral : C.gray });
    if (i < 4) body += line(x + 270, 445, x + 295, 445, { stroke: C.line, arrow: true });
  });
  body += rect(360, 635, 1190, 170, { fill: C.greenSoft, stroke: C.green, sw: 3 });
  body += textBlock(395, 680, "INTERVENE AT STAGE 2", { size: 18, weight: 800, fill: C.green });
  body += textBlock(395, 730, "Capture and confirm current intent before ranking—then keep every change visible and reversible.", { size: 28, weight: 800 });
  body += textBlock(395, 775, "Out of scope now: replacing playback, claiming perfect personalization, or repairing Spotify's global profile.", { size: 19, weight: 600, fill: C.gray });
  body += line(495, 595, 495, 635, { stroke: C.green, arrow: true });
  return base("The journey breaks when current intent is compressed into weak signals", "The intervention belongs before ranking, not after another disappointing queue", body, "Five stages show the discovery journey from trigger to outcome, with the break at expressing intent and an intervention before ranking.");
}

function icePrioritization() {
  const rows = [
    ["1", "Discovery Compass", 9, 7, 6, 10.5, C.green, C.greenSoft],
    ["2", "Transparent Discovery Feed", 6, 5, 4, 7.5, C.blue, C.blueSoft],
    ["3", "Taste Profile Repair", 8, 6, 8, 6.0, C.coral, C.coralSoft]
  ];
  let body = pill(55, 165, 260, "DIRECTIONAL PM SCORE");
  body += textBlock(1540, 193, "ICE = Impact × Confidence ÷ Effort", { size: 20, weight: 750, fill: C.gray, anchor: "end" });
  body += textBlock(75, 250, "Rank", { size: 18, weight: 800, fill: C.gray });
  body += textBlock(170, 250, "Solution", { size: 18, weight: 800, fill: C.gray });
  body += textBlock(780, 250, "I", { size: 18, weight: 800, fill: C.gray, anchor: "middle" });
  body += textBlock(900, 250, "C", { size: 18, weight: 800, fill: C.gray, anchor: "middle" });
  body += textBlock(1020, 250, "E", { size: 18, weight: 800, fill: C.gray, anchor: "middle" });
  body += textBlock(1190, 250, "Relative score", { size: 18, weight: 800, fill: C.gray });
  rows.forEach((r, i) => {
    const y = 285 + i * 145;
    body += rect(55, y, 1490, 115, { fill: r[7], stroke: r[6], sw: i === 0 ? 4 : 2 });
    body += circle(100, y + 58, 28, { fill: r[6], stroke: r[6] });
    body += textBlock(100, y + 67, r[0], { size: 22, weight: 850, fill: C.white, anchor: "middle" });
    body += textBlock(170, y + 66, r[1], { size: 28, weight: 800 });
    body += textBlock(780, y + 67, r[2], { size: 26, weight: 850, anchor: "middle" });
    body += textBlock(900, y + 67, r[3], { size: 26, weight: 850, anchor: "middle" });
    body += textBlock(1020, y + 67, r[4], { size: 26, weight: 850, anchor: "middle" });
    body += rect(1160, y + 37, 280, 40, { fill: C.white, stroke: C.white, rx: 8 });
    body += `<rect x="1160" y="${y + 37}" width="${r[5] * 22}" height="40" rx="8" fill="${r[6]}"/>`;
    body += textBlock(1480, y + 67, r[5].toFixed(1), { size: 24, weight: 850, fill: r[6], anchor: "end" });
  });
  body += rect(55, 745, 1490, 92, { fill: C.white, stroke: C.line, sw: 2, rx: 18 });
  body += textBlock(85, 783, "WHY #1", { size: 18, weight: 800, fill: C.green });
  body += textBlock(225, 790, "It tests the missing-intent mechanism directly, contains integration effort, and preserves a stop decision.", { size: 24, weight: 750 });
  body += textBlock(85, 824, "Sensitivity: re-score after survey and paired test; these numbers are judgment, not observed impact.", { size: 17, weight: 600, fill: C.gray });
  return base("Discovery Compass leads the three options on directional ICE", "The score prioritises learning value—not certainty or long-term roadmap commitment", body, "A three-row ICE table ranks Discovery Compass, Transparent Discovery Feed, and Taste Profile Repair, with explicit impact, confidence, effort, and scores.");
}

function interactionFlow() {
  const steps = [
    ["1", "Anchor", "Choose 3–5", "representative tracks"],
    ["2", "Express", "Describe what", "fits right now"],
    ["3", "Approve", "Edit intent +", "set novelty"],
    ["4", "Explore", "Review 8–12", "grounded results"],
    ["5", "Steer", "Save · reject ·", "refine · rerank"]
  ];
  let body = textBlock(60, 175, "LISTENER LOOP", { size: 18, weight: 800, fill: C.green });
  steps.forEach((s, i) => {
    const x = 50 + i * 308;
    const chosen = i === 2 || i === 4;
    body += rect(x, 225, 278, 235, { fill: chosen ? C.greenSoft : C.white, stroke: chosen ? C.green : C.blue, sw: 3 });
    body += circle(x + 44, 270, 28, { fill: chosen ? C.green : C.blue, stroke: chosen ? C.green : C.blue });
    body += textBlock(x + 44, 279, s[0], { size: 21, weight: 850, fill: C.white, anchor: "middle" });
    body += textBlock(x + 82, 279, s[1], { size: 27, weight: 850 });
    body += textBlock(x + 24, 350, [s[2], s[3]], { size: 24, weight: 650, lineHeight: 36 });
    if (i < 4) body += line(x + 278, 342, x + 300, 342, { stroke: C.blue, arrow: true });
  });
  body += polyline("1435,460 1435,505 126,505 126,472", { stroke: C.green, sw: 3, arrow: true });
  body += rect(50, 565, 475, 225, { fill: C.blueSoft, stroke: C.blue, sw: 2 });
  body += textBlock(80, 612, "AI: LANGUAGE BOUNDARY", { size: 18, weight: 850, fill: C.blue });
  body += textBlock(80, 657, ["Parse flexible intent", "Interpret refinements", "Draft grounded fit reasons"], { size: 24, weight: 700, lineHeight: 40 });
  body += rect(563, 565, 635, 225, { fill: C.white, stroke: C.ink, sw: 2 });
  body += textBlock(593, 612, "DETERMINISTIC PRODUCT LOGIC", { size: 18, weight: 850, fill: C.ink });
  body += textBlock(593, 657, ["Hard exclusions · eligibility · repeat penalties", "Novelty · diversity · artist caps · ranking", "Assignment, event logging, and experiment metrics"], { size: 23, weight: 700, lineHeight: 40 });
  body += rect(1235, 565, 315, 225, { fill: C.coralSoft, stroke: C.coral, sw: 2 });
  body += textBlock(1265, 612, "SAFE FALLBACK", { size: 18, weight: 850, fill: C.coral });
  body += textBlock(1265, 657, ["Direct controls", "Template reasons", "Never relax exclusions", "silently"], { size: 22, weight: 700, lineHeight: 36 });
  return base("Discovery Compass turns intent into a visible, steerable loop", "AI interprets language; deterministic logic owns constraints, ranking, and measurement", body, "A five-step listener loop from anchors to steering, followed by AI, deterministic logic, and fallback responsibility cards.");
}

function validationPlan() {
  let body = pill(55, 160, 245, "PAIRED PROTOTYPE TEST");
  body += rect(55, 220, 360, 180, { fill: C.white, stroke: C.blue, sw: 2 });
  body += textBlock(85, 265, "Qualified participant", { size: 25, weight: 850 });
  body += textBlock(85, 307, ["Monthly-or-more discovery", "Same prompt + candidate pool"], { size: 20, weight: 650, fill: C.gray, lineHeight: 34 });
  body += line(415, 310, 490, 310, { stroke: C.blue, arrow: true });
  body += rect(510, 185, 350, 125, { fill: C.blueSoft, stroke: C.blue, sw: 2 });
  body += textBlock(540, 230, "A · Unguided baseline", { size: 25, weight: 850 });
  body += textBlock(540, 271, "Current discovery controls", { size: 20, weight: 650, fill: C.gray });
  body += rect(510, 330, 350, 125, { fill: C.greenSoft, stroke: C.green, sw: 3 });
  body += textBlock(540, 375, "B · Discovery Compass", { size: 25, weight: 850, fill: C.green });
  body += textBlock(540, 416, "Intent + novelty + feedback", { size: 20, weight: 650 });
  body += line(860, 248, 930, 310, { stroke: C.blue, arrow: true });
  body += line(860, 392, 930, 330, { stroke: C.green, arrow: true });
  body += rect(950, 220, 595, 180, { fill: C.white, stroke: C.ink, sw: 2 });
  body += textBlock(980, 265, "PRE-REGISTERED COMPARISON", { size: 18, weight: 850, fill: C.gray });
  body += textBlock(980, 310, ["Accepted novel artists · time to first save", "Relevance confidence · setup effort · guardrails"], { size: 24, weight: 750, lineHeight: 38 });
  body += textBlock(55, 515, "SURVEY SPACE — POPULATE ONLY AFTER REAL RESPONSES", { size: 18, weight: 850, fill: C.coral });
  const boxes = [
    ["Q14", "Intent-step willingness", "Donut · Yes / depends / no"],
    ["Q15", "Most valued control", "Donut · six direct options"],
    ["Q08", "Recalled failure mode", "Horizontal bar · one main problem"]
  ];
  boxes.forEach((b, i) => {
    const x = 55 + i * 505;
    body += rect(x, 550, 470, 205, { fill: "url(#pending)", stroke: C.blue, sw: 2, dash: "10 8" });
    body += pill(x + 25, 575, 75, b[0], { fill: C.blue, color: C.white, stroke: C.blue });
    body += textBlock(x + 25, 655, b[1], { size: 25, weight: 850 });
    body += textBlock(x + 25, 697, b[2], { size: 20, weight: 650, fill: C.gray });
    body += textBlock(x + 445, 728, "AWAITING n", { size: 16, weight: 850, fill: C.coral, anchor: "end" });
  });
  body += rect(55, 790, 1490, 60, { fill: C.greenSoft, stroke: C.green, sw: 2, rx: 14 });
  body += textBlock(85, 829, "Gate: continue only if value improves without unacceptable relevance, effort, latency, or safety loss.", { size: 22, weight: 800 });
  return base("Validate willingness and incremental value before integration", "Survey describes demand; the paired prototype tests whether the mechanism causes better outcomes", body, "A paired baseline and Discovery Compass validation plan plus three empty survey chart placeholders for intent willingness, valued control, and recalled failure modes.");
}

function kpiTree() {
  let body = rect(465, 165, 670, 120, { fill: C.greenSoft, stroke: C.green, sw: 4 });
  body += textBlock(800, 207, "NORTH STAR", { size: 17, weight: 850, fill: C.green, anchor: "middle" });
  body += textBlock(800, 252, "Accepted novel artist rate / qualified session", { size: 29, weight: 850, anchor: "middle" });
  const drivers = [
    ["Relevant", "Fit rating ↑", "Early rejects ↓"],
    ["Novel", "New-to-profile share ↑", "Artist concentration ↓"],
    ["Accepted", "Save / positive action", "Time to first save ↓"],
    ["Qualified", "Intent approved", "≥ 8 eligible tracks"]
  ];
  drivers.forEach((d, i) => {
    const x = 45 + i * 390;
    body += line(800, 285, x + 175, 350, { stroke: C.green, sw: 3 });
    body += rect(x, 350, 350, 200, { fill: C.white, stroke: C.blue, sw: 2 });
    body += textBlock(x + 25, 398, d[0], { size: 28, weight: 850, fill: C.blue });
    body += textBlock(x + 25, 447, d[1], { size: 21, weight: 700 });
    body += textBlock(x + 25, 490, d[2], { size: 21, weight: 700 });
  });
  body += rect(45, 600, 710, 175, { fill: C.blueSoft, stroke: C.blue, sw: 2 });
  body += textBlock(75, 646, "LEADING → LAGGING", { size: 18, weight: 850, fill: C.blue });
  body += textBlock(75, 692, ["Intent completion · first-set acceptance · time to first save", "→ 7-day replay of accepted discoveries"], { size: 23, weight: 750, lineHeight: 38 });
  body += rect(805, 600, 750, 175, { fill: C.coralSoft, stroke: C.coral, sw: 2 });
  body += textBlock(835, 646, "GUARDRAILS", { size: 18, weight: 850, fill: C.coral });
  body += textBlock(835, 692, ["Known-music satisfaction · setup effort · latency", "Invalid output · catalog coverage · privacy incidents"], { size: 23, weight: 750, lineHeight: 38 });
  body += rect(45, 810, 1510, 48, { fill: C.white, stroke: C.ink, sw: 2, rx: 14 });
  body += textBlock(800, 842, "Scale only when the North Star improves and every guardrail remains inside its pre-registered limit.", { size: 21, weight: 850, anchor: "middle" });
  return base("The North Star rewards accepted novelty without sacrificing relevance", "A metric tree connects session behavior to durable value while guardrails control downside", body, "A KPI tree breaks accepted novel artist rate into relevance, novelty, acceptance, and qualified-session drivers, with leading, lagging, and guardrail metrics.");
}

const assets = {
  "evidence-to-decision": evidenceToDecision(),
  "competitive-landscape": competitiveLandscape(),
  "research-evidence": researchEvidence(),
  "behavior-loop": behaviorLoop(),
  "persona-jtbd": personaJtbd(),
  "user-journey": userJourney(),
  "ice-prioritization": icePrioritization(),
  "interaction-flow": interactionFlow(),
  "validation-plan": validationPlan(),
  "kpi-tree": kpiTree()
};

await fs.mkdir(outDir, { recursive: true });

for (const [name, source] of Object.entries(assets)) {
  const svgPath = path.join(outDir, `${name}.svg`);
  const pngPath = path.join(outDir, `${name}.png`);
  await fs.writeFile(svgPath, source, "utf8");
  await sharp(Buffer.from(source)).png().toFile(pngPath);
}

console.log(`Rendered ${Object.keys(assets).length} SVG and PNG diagram pairs in ${outDir}`);
