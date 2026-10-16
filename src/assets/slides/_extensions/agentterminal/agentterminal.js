window.RevealAgentTerminal = function () {
  return {
    id: "RevealAgentTerminal",
    init: function (deck) {
      initAgentTerminal(deck);
    }
  };
};

function initAgentTerminal(deck) {
  // .agent-terminal holds .agent-step rows played in order after one click:
  //   [data-type="..."]  text typed char by char
  //   data-wait="ms"     pause after the step (spinner spins meanwhile)
  //   .agent-running / .agent-done  shown while the step runs / once finished
  // Going backwards or deep-linking shows the end state without animation.
  const FRAMES = "⠋⠙⠹⠸⠼⠴⠦⠧⠇⠏";
  const TYPE_MS = 40;
  let token = 0;
  let spinTimer = null;
  let prev = null;
  let pending = false;

  function addTriggers() {
    deck
      .getRevealElement()
      .querySelectorAll(".slides section .agent-terminal")
      .forEach(function (term) {
        const slide = term.closest("section");
        if (slide.querySelector(":scope > .agent-trigger")) return;
        const trigger = document.createElement("span");
        trigger.className = "fragment agent-trigger";
        const frags = slide.querySelectorAll(".fragment");
        let max = -1;
        let allIndexed = frags.length > 0;
        frags.forEach(function (f) {
          const i = parseInt(f.getAttribute("data-fragment-index"), 10);
          if (isNaN(i)) {
            allIndexed = false;
          } else if (i > max) {
            max = i;
          }
        });
        if (allIndexed) {
          trigger.setAttribute("data-fragment-index", String(max + 1));
        }
        slide.insertBefore(trigger, slide.firstChild);
      });
  }

  function steps(term) {
    return term.querySelectorAll(".agent-step");
  }

  function stopSpinner() {
    clearInterval(spinTimer);
    spinTimer = null;
  }

  function reset(term) {
    token++;
    stopSpinner();
    steps(term).forEach(function (s) {
      s.classList.remove("is-running", "is-done");
      const typed = s.querySelector("[data-type]");
      if (typed) typed.textContent = "";
    });
  }

  function finish(term) {
    token++;
    stopSpinner();
    steps(term).forEach(function (s) {
      s.classList.remove("is-running");
      s.classList.add("is-done");
      const typed = s.querySelector("[data-type]");
      if (typed) typed.textContent = typed.getAttribute("data-type");
    });
  }

  function wait(ms, my) {
    return new Promise(function (resolve, reject) {
      setTimeout(function () {
        if (my === token) {
          resolve();
        } else {
          reject(new Error("cancelled"));
        }
      }, ms);
    });
  }

  async function play(term) {
    reset(term);
    const my = token;
    try {
      for (const step of steps(term)) {
        step.classList.add("is-running");
        const typed = step.querySelector("[data-type]");
        if (typed) {
          for (const ch of typed.getAttribute("data-type")) {
            typed.textContent += ch;
            await wait(TYPE_MS, my);
          }
        }
        const spin = step.querySelector(".agent-spinner");
        if (spin) {
          let i = 0;
          spin.textContent = FRAMES[0];
          spinTimer = setInterval(function () {
            spin.textContent = FRAMES[++i % FRAMES.length];
          }, 80);
        }
        await wait(parseInt(step.getAttribute("data-wait") || "0", 10), my);
        stopSpinner();
        step.classList.remove("is-running");
        step.classList.add("is-done");
      }
    } catch (e) {
      stopSpinner();
    }
  }

  function triggerVisible(slide) {
    const t = slide && slide.querySelector(":scope > .agent-trigger");
    return !!(t && t.classList.contains("visible"));
  }

  function resolve() {
    pending = false;
    const slide = deck.getCurrentSlide();
    if (prev && prev.term && prev.slide !== slide) reset(prev.term);
    const term = slide && slide.querySelector(".agent-terminal");
    if (!term) {
      prev = { slide: slide, term: null, shown: false };
      return;
    }
    const shown = triggerVisible(slide);
    if (prev && prev.slide === slide) {
      if (shown && !prev.shown) {
        play(term);
      } else if (!shown && prev.shown) {
        reset(term);
      }
    } else if (shown) {
      finish(term);
    } else {
      reset(term);
    }
    prev = { slide: slide, term: term, shown: shown };
  }

  function schedule() {
    if (pending) return;
    pending = true;
    requestAnimationFrame(resolve);
  }

  function boot() {
    resolve();
    deck.on("slidechanged", schedule);
    deck.on("fragmentshown", schedule);
    deck.on("fragmenthidden", schedule);
  }

  addTriggers();
  if (typeof deck.isReady === "function" && deck.isReady()) {
    boot();
  } else {
    deck.on("ready", boot);
  }
}
