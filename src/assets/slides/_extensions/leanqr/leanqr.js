window.RevealLeanQR = function () {
  return {
    id: "RevealLeanQR",
    init: function (deck) {
      initLeanQR(deck);
    },
  };
};

function initLeanQR(deck) {
  if (!(window.LeanQR && typeof window.LeanQR.generate === "function")) {
    console.error("RevealLeanQR: lean-qr nano is not loaded");
    return;
  }

  const POLL_MS = 1000;
  const cards = new Map();

  const POLL_API =
    location.hostname === "sparecores.com"
      ? "https://www-api.sparecores.com"
      : "https://www-api-staging.sparecores.net";

  function setCount(el, n) {
    const countEl = el.querySelector(".qr-card-count");
    if (!countEl) return;
    if (typeof n !== "number" || n < 0 || !isFinite(n)) {
      countEl.textContent = "… responses";
      return;
    }
    countEl.textContent = n === 1 ? "1 response" : n + " responses";
  }

  function stopPoll(state) {
    if (state.timer) {
      clearInterval(state.timer);
      state.timer = null;
    }
  }

  function pollOnce(state) {
    fetch(state.resultsUrl, { cache: "no-store", credentials: "omit" })
      .then(function (res) {
        if (!res.ok) throw new Error("HTTP " + res.status);
        return res.json();
      })
      .then(function (votes) {
        setCount(state.el, votes.length);
      })
      .catch(function (err) {
        if (!state.warn) {
          state.warn = true;
          console.warn(
            "RevealLeanQR: could not poll results:",
            state.resultsUrl,
            err,
          );
        }
      });
  }

  function startPoll(state) {
    if (!state.resultsUrl || state.timer) return;
    pollOnce(state);
    state.timer = setInterval(function () {
      pollOnce(state);
    }, POLL_MS);
  }

  function render(el) {
    if (el.querySelector("canvas")) return;
    const url = el.getAttribute("data-qr");
    if (!url) return;
    const pollId = el.getAttribute("data-qr-poll");
    const resultsUrl = pollId
      ? POLL_API + "/polls/" + encodeURIComponent(pollId) + "/votes"
      : null;

    const canvas = document.createElement("canvas");
    canvas.className = "qr-card-canvas";
    canvas.setAttribute("aria-hidden", "true");
    el.appendChild(canvas);

    const link = document.createElement("a");
    link.className = "qr-card-link";
    link.href = url;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.textContent = url;
    el.appendChild(link);

    if (resultsUrl) {
      const countEl = document.createElement("div");
      countEl.className = "qr-card-count";
      countEl.textContent = "… responses";
      el.appendChild(countEl);
    }

    try {
      window.LeanQR.generate(url).toCanvas(canvas, { pad: 2 });
    } catch (err) {
      console.error("RevealLeanQR: failed to generate QR for", url, err);
    }

    const state = {
      el: el,
      resultsUrl: resultsUrl,
      timer: null,
      warn: false,
    };
    cards.set(el, state);
  }

  function renderAll() {
    deck
      .getRevealElement()
      .querySelectorAll("[data-qr]")
      .forEach(render);
  }

  function syncPolling() {
    const slide = deck.getCurrentSlide && deck.getCurrentSlide();
    cards.forEach(function (state) {
      const onSlide = !!(slide && slide.contains(state.el));
      if (onSlide) startPoll(state);
      else stopPoll(state);
    });
  }

  renderAll();
  syncPolling();
  deck.on("ready", function () {
    renderAll();
    syncPolling();
  });
  deck.on("slidechanged", syncPolling);
}
