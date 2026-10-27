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

  function render(el) {
    if (el.querySelector("canvas")) return;
    const url = el.getAttribute("data-qr");
    if (!url) return;

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

    try {
      window.LeanQR.generate(url).toCanvas(canvas, { pad: 2 });
    } catch (err) {
      console.error("RevealLeanQR: failed to generate QR for", url, err);
    }
  }

  function renderAll() {
    deck
      .getRevealElement()
      .querySelectorAll("[data-qr]")
      .forEach(render);
  }

  renderAll();
  deck.on("ready", renderAll);
  deck.on("slidechanged", renderAll);
}
