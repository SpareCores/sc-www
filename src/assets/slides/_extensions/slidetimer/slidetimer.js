window.RevealSlideTimer = function () {
  return {
    id: "RevealSlideTimer",
    init: function (deck) {
      initSlideTimer(deck);
    },
  };
};

function initSlideTimer(deck) {
  if (
    deck.isSpeakerNotes() ||
    deck.getConfig().view === "print" ||
    /print-pdf/i.test(window.location.search)
  ) {
    return;
  }

  const slides = new Map();
  const sections = new Map();
  let current = null;
  let sectionVisitStart = null;

  function now() {
    return performance.now();
  }

  function fmt(ms) {
    const s = Math.round(ms / 1000);
    return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
  }

  function headingOf(el) {
    const heading = el && el.querySelector("h1, h2, h3");
    const text = heading ? heading.textContent.trim().replace(/\s+/g, " ") : "";
    return text || (el && el.id) || "";
  }

  function sectionTitle(h) {
    const top = deck.getHorizontalSlides()[h];
    const first =
      top && top.classList.contains("stack")
        ? top.querySelector(":scope > section")
        : top;
    return headingOf(first);
  }

  function label(h, v) {
    return `${h + 1}.${v + 1}`;
  }

  function slideEntry(h, v, slide) {
    const key = label(h, v);
    if (!slides.has(key)) {
      slides.set(key, { h, v, title: headingOf(slide), visits: 0, ms: 0 });
    }
    return slides.get(key);
  }

  function sectionEntry(h) {
    if (!sections.has(h)) {
      sections.set(h, { title: sectionTitle(h), visits: 0, ms: 0 });
    }
    return sections.get(h);
  }

  function leave() {
    if (!current) return;
    const ms = now() - current.enteredAt;
    const slide = slideEntry(current.h, current.v, current.slide);
    slide.visits += 1;
    slide.ms += ms;
    const section = sectionEntry(current.h);
    section.ms += ms;
    console.log(
      `[slide timer] slide ${label(current.h, current.v)} "${slide.title}": ${fmt(ms)}` +
        (slide.visits > 1 ? ` (${fmt(slide.ms)} over ${slide.visits} visits)` : ""),
    );
  }

  function enter(slide) {
    const { h, v = 0 } = deck.getIndices(slide);
    if (current && current.h !== h) {
      const section = sectionEntry(current.h);
      section.visits += 1;
      console.log(
        `[slide timer] section ${current.h + 1} "${section.title}": ${fmt(now() - sectionVisitStart)}` +
          (section.visits > 1
            ? ` (${fmt(section.ms)} over ${section.visits} visits)`
            : ""),
      );
    }
    if (!current || current.h !== h) {
      sectionVisitStart = now();
    }
    current = { slide, h, v, enteredAt: now() };
  }

  function snapshot() {
    const liveMs = current ? now() - current.enteredAt : 0;
    const slideRows = [...slides.entries()].map(([key, s]) => ({
      key,
      ...s,
      ms: s.ms + (current && label(current.h, current.v) === key ? liveMs : 0),
    }));
    if (current && !slides.has(label(current.h, current.v))) {
      slideRows.push({
        key: label(current.h, current.v),
        h: current.h,
        v: current.v,
        title: headingOf(current.slide),
        visits: 0,
        ms: liveMs,
      });
    }
    const sectionTotals = new Map();
    for (const row of slideRows) {
      sectionTotals.set(row.h, (sectionTotals.get(row.h) || 0) + row.ms);
    }
    return { slideRows, sectionTotals };
  }

  function summary() {
    const { slideRows, sectionTotals } = snapshot();
    slideRows.sort((a, b) => a.h - b.h || a.v - b.v);
    const total = slideRows.reduce((sum, row) => sum + row.ms, 0);

    console.log(`[slide timer] summary, ${fmt(total)} in total`);
    console.table(
      [...sectionTotals.entries()]
        .sort((a, b) => a[0] - b[0])
        .map(([h, ms]) => ({
          section: h + 1,
          title: sectionTitle(h),
          time: fmt(ms),
          seconds: Math.round(ms / 1000),
        })),
    );
    console.table(
      slideRows.map((row) => ({
        slide: row.key,
        title: row.title,
        time: fmt(row.ms),
        seconds: Math.round(row.ms / 1000),
        visits: row.visits + (current && label(current.h, current.v) === row.key ? 1 : 0),
      })),
    );
  }

  function reset() {
    slides.clear();
    sections.clear();
    current = null;
    sectionVisitStart = null;
    enter(deck.getCurrentSlide());
    console.log("[slide timer] reset");
  }

  window.slideTimer = { summary, reset };

  deck.addKeyBinding(
    { keyCode: 84, key: "T", description: "Print slide timings to the console" },
    summary,
  );

  deck.on("slidechanged", function (event) {
    leave();
    enter(event.currentSlide);
  });

  if (deck.isReady()) {
    enter(deck.getCurrentSlide());
  } else {
    deck.on("ready", function (event) {
      enter(event.currentSlide);
    });
  }
}
