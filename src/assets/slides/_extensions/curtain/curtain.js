window.RevealCurtain = function () {
  return {
    id: "RevealCurtain",
    init: function (deck) {
      initCurtain(deck);
    }
  };
};

function initCurtain(deck) {
  // data-curtain="close": an extra (hidden) fragment step closes the curtains
  //   over the slide content, and they stay closed.
  // data-curtain="open": the slide arrives behind closed curtains that open.
  // Only forward steps animate; going backwards jumps to the end state.
  if (
    deck.getConfig().view === "print" ||
    /print-pdf/i.test(window.location.search)
  ) {
    return;
  }

  const STATES = ["is-hidden", "is-open", "is-closed"];
  let stage = null;
  let timer = null;
  let defaultMs = 1600;
  let prev = null;
  let pending = false;

  function moveFromStacks() {
    deck
      .getRevealElement()
      .querySelectorAll("section[data-curtain]")
      .forEach(function (section) {
        const children = section.querySelectorAll(":scope > section");
        if (!children.length) return;
        const mode = section.getAttribute("data-curtain");
        const target =
          mode === "close" ? children[children.length - 1] : children[0];
        if (!target.hasAttribute("data-curtain")) {
          target.setAttribute("data-curtain", mode);
          const ms = section.getAttribute("data-curtain-duration");
          if (ms) target.setAttribute("data-curtain-duration", ms);
        }
        section.removeAttribute("data-curtain");
        section.removeAttribute("data-curtain-duration");
      });
  }

  function prepareSlides() {
    moveFromStacks();
    const root = deck.getRevealElement();
    root
      .querySelectorAll('section[data-curtain="close"]')
      .forEach(function (slide) {
        if (slide.querySelector(":scope > .curtain-trigger")) return;
        const frags = slide.querySelectorAll(".fragment");
        let max = -1;
        let allIndexed = true;
        frags.forEach(function (f) {
          const i = parseInt(f.getAttribute("data-fragment-index"), 10);
          if (isNaN(i)) {
            allIndexed = false;
          } else if (i > max) {
            max = i;
          }
        });
        const trigger = document.createElement("span");
        trigger.className = "fragment curtain-trigger";
        if (frags.length && allIndexed) {
          trigger.setAttribute("data-fragment-index", String(max + 1));
        }
        slide.appendChild(trigger);
      });
    root
      .querySelectorAll('section[data-curtain="open"]')
      .forEach(function (slide) {
        if (!slide.hasAttribute("data-transition")) {
          slide.setAttribute("data-transition", "none");
        }
      });
  }

  function createStage() {
    stage = document.createElement("div");
    stage.className = "curtain-stage is-hidden";
    stage.setAttribute("aria-hidden", "true");
    ["curtain-left", "curtain-right", "curtain-valance"].forEach(function (c) {
      const el = document.createElement("div");
      el.className = c === "curtain-valance" ? c : "curtain-panel " + c;
      stage.appendChild(el);
    });
    deck.getRevealElement().appendChild(stage);
    const v = getComputedStyle(stage)
      .getPropertyValue("--curtain-duration")
      .trim();
    const n = parseFloat(v);
    if (!isNaN(n)) defaultMs = /ms$/.test(v) ? n : n * 1000;
  }

  function durationOf(slide) {
    const n = parseInt(slide && slide.getAttribute("data-curtain-duration"), 10);
    return isNaN(n) ? defaultMs : n;
  }

  function setState(state) {
    clearTimeout(timer);
    stage.classList.add("no-anim");
    stage.classList.remove("is-swinging");
    stage.classList.remove.apply(stage.classList, STATES);
    stage.classList.add(state);
    void stage.offsetWidth;
    stage.classList.remove("no-anim");
  }

  function animate(from, to, ms, done) {
    setState(from);
    stage.style.setProperty("--curtain-duration", ms + "ms");
    void stage.offsetWidth;
    stage.classList.remove(from);
    stage.classList.add(to);
    timer = setTimeout(done, ms + 100);
  }

  function closeCurtains(slide) {
    animate("is-open", "is-closed", durationOf(slide), function () {
      stage.classList.add("is-swinging");
    });
  }

  function openCurtains(slide) {
    animate("is-closed", "is-open", durationOf(slide), function () {
      setState("is-hidden");
    });
  }

  function triggerVisible(slide) {
    const t = slide && slide.querySelector(":scope > .curtain-trigger");
    return !!(t && t.classList.contains("visible"));
  }

  function resolve() {
    pending = false;
    const slide = deck.getCurrentSlide();
    if (!slide) return;
    const mode = slide.getAttribute("data-curtain");
    const shut = mode === "close" && triggerVisible(slide);
    const index = deck.getSlides().indexOf(slide);

    if (prev && prev.slide === slide) {
      if (shut && !prev.shut) {
        closeCurtains(slide);
      } else if (!shut && prev.shut) {
        setState("is-hidden");
      }
    } else if (
      prev &&
      index > prev.index &&
      (mode === "open" || (prev.shut && !shut))
    ) {
      openCurtains(slide);
    } else if (shut) {
      setState("is-closed");
    } else {
      setState("is-hidden");
    }

    prev = { slide: slide, shut: shut, index: index };
  }

  function schedule() {
    if (pending) return;
    pending = true;
    requestAnimationFrame(resolve);
  }

  function boot() {
    createStage();
    resolve();
    deck.on("slidechanged", schedule);
    deck.on("fragmentshown", schedule);
    deck.on("fragmenthidden", schedule);
  }

  prepareSlides();
  if (typeof deck.isReady === "function" && deck.isReady()) {
    boot();
  } else {
    deck.on("ready", boot);
  }
}
