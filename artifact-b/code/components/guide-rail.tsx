"use client";

import { useEffect, useState, type RefObject } from "react";

type Step = { key: string; tag: string; title: string; says: string; action: string };

// Ordered flow. `key` matches the data-guide markers rendered inside the phone screen.
const STEPS: Step[] = [
  {
    key: "welcome",
    tag: "Start",
    title: "Discovery Compass",
    says: "An intent-guided way to find music that fits the moment — not just what your history predicts.",
    action: "Tap Open app to begin."
  },
  {
    key: "home",
    tag: "Overview",
    title: "Find your next sound",
    says: "Your history knows your taste. Compass adds what you want right now.",
    action: "Scroll down to “Build your mix”."
  },
  {
    key: "anchors",
    tag: "Step 01 · Your taste",
    title: "Set a taste anchor",
    says: "Pick a few tracks that feel like you. They anchor the ranking and define what counts as fresh.",
    action: "Search, then tap + on 3–5 tracks."
  },
  {
    key: "intent",
    tag: "Step 02 · Set the vibe",
    title: "Say what fits now",
    says: "Describe the moment in plain words. AI turns it into editable fields; freshness sets how far past your taste to venture.",
    action: "Type intent → Interpret → check fields → Approve."
  },
  {
    key: "generate",
    tag: "Build",
    title: "Generate the set",
    says: "Anchor plus approved intent produces a small, ranked set drawn from the catalog.",
    action: "Tap Build my Compass mix."
  },
  {
    key: "results",
    tag: "Steer",
    title: "Tune the results",
    says: "Every card shows why it fits and whether the artist is new to your profile.",
    action: "Save, Not for me, More like this, or More adventurous."
  }
];

export function GuideRail({
  screenRef,
  opened
}: {
  screenRef: RefObject<HTMLDivElement | null>;
  opened: boolean;
}) {
  const [active, setActive] = useState("welcome");

  useEffect(() => {
    const screen = screenRef.current;
    if (!screen) return;

    const compute = () => {
      if (!opened) {
        setActive("welcome");
        return;
      }
      const marks = [...screen.querySelectorAll<HTMLElement>("[data-guide]")];
      if (!marks.length) return;
      // Active = the last marked section whose top has crossed the reading line (~40% down
      // the screen), so a section becomes active once it is meaningfully in view.
      const rect = screen.getBoundingClientRect();
      const readingLine = rect.top + rect.height * 0.4;
      let current = marks[0].dataset.guide ?? "home";
      for (const el of marks) {
        if (el.getBoundingClientRect().top <= readingLine) current = el.dataset.guide ?? current;
      }
      setActive(current);
    };

    compute();
    screen.addEventListener("scroll", compute, { passive: true });
    window.addEventListener("resize", compute);
    // Results and the approved-intent panel mount later; re-sync when the DOM grows.
    const observer = new MutationObserver(compute);
    observer.observe(screen, { childList: true, subtree: true });

    return () => {
      screen.removeEventListener("scroll", compute);
      window.removeEventListener("resize", compute);
      observer.disconnect();
    };
  }, [screenRef, opened]);

  const activeIndex = Math.max(0, STEPS.findIndex((step) => step.key === active));
  const step = STEPS[activeIndex];

  return (
    <aside className="guide-rail" aria-label="Step-by-step guide">
      <span className="guide-kicker">How to use it</span>
      <ol className="guide-steps">
        {STEPS.map((item, index) => (
          <li key={item.key} className={index === activeIndex ? "is-active" : index < activeIndex ? "is-done" : ""}>
            <i aria-hidden="true" />
            {item.tag}
          </li>
        ))}
      </ol>
      <div className="guide-active" aria-live="polite">
        <p className="guide-tag">{step.tag}</p>
        <strong>{step.title}</strong>
        <p className="guide-says">{step.says}</p>
        <p className="guide-do"><span>Do</span>{step.action}</p>
      </div>
    </aside>
  );
}
