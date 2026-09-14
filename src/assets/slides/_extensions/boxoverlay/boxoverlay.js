window.RevealBoxOverlay = function () {
  return {
    id: "RevealBoxOverlay",
    init: function (deck) {
      initBoxOverlay(deck);
    }
  };
};

function initBoxOverlay(deck) {
  // Avoid HTML-comment syntax: bash highlighting treats < > as operators and
  // strips number coloring from the token that follows (e.g. 1920 vs 32768).
  // @@box@@     show as soon as the marked lines are highlighted
  // @@box+@@    extra click after that line step (inserts a dummy fragment)
  // @@box:N@@   show when Reveal fragment index is N (0-based; first click is 0)
  const MARKER_RE = /@@box(\+|:\d+)?@@/g;
  let overlay = null;
  let scrollBound = null;

  function ensureOverlay(slide) {
    if (!overlay) {
      overlay = document.createElement("div");
      overlay.className = "box-overlay";
      overlay.style.display = "none";
    }
    if (overlay.parentNode !== slide) {
      slide.appendChild(overlay);
    }
    return overlay;
  }

  function hideOverlay() {
    if (overlay) overlay.style.display = "none";
  }

  function visibleCode(slide) {
    const current = slide.querySelector("pre code.current-fragment");
    if (current) return current;
    // Dummy box-trigger can be the current fragment; keep the last visible
    // line-highlight clone so the overlay still measures the right table.
    const visibleFrags = slide.querySelectorAll("pre code.fragment.visible");
    if (visibleFrags.length) return visibleFrags[visibleFrags.length - 1];
    const codes = slide.querySelectorAll("pre code.sourceCode");
    for (let i = 0; i < codes.length; i++) {
      if (!codes[i].classList.contains("fragment")) return codes[i];
    }
    return codes[0] || null;
  }

  function parseSpec(suffix) {
    if (suffix === "+") return { delay: true };
    if (suffix && suffix.charAt(0) === ":") {
      return { index: parseInt(suffix.slice(1), 10) };
    }
    return {};
  }

  function mergeSpecs(a, b) {
    const out = {};
    if (a.delay || b.delay) out.delay = true;
    if (a.index !== undefined || b.index !== undefined) {
      out.index = a.index !== undefined ? a.index : b.index;
    }
    return out;
  }

  function collectTextNodes(root) {
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    const nodes = [];
    let text = "";
    let node;
    while ((node = walker.nextNode())) {
      nodes.push({
        node: node,
        start: text.length,
        end: text.length + node.nodeValue.length
      });
      text += node.nodeValue;
    }
    return { nodes: nodes, text: text };
  }

  function findMarkers(text) {
    const found = [];
    MARKER_RE.lastIndex = 0;
    let m;
    while ((m = MARKER_RE.exec(text))) {
      found.push({
        start: m.index,
        length: m[0].length,
        spec: parseSpec(m[1] || "")
      });
    }
    return found;
  }

  function splitTextNode(node, offset) {
    if (offset <= 0) return node;
    if (offset >= node.nodeValue.length) return node.nextSibling;
    return node.splitText(offset);
  }

  function replaceMarkerAt(nodes, start, length) {
    const end = start + length;
    let startNode = null;
    let startOffset = 0;
    let endNode = null;
    let endOffset = 0;

    for (let i = 0; i < nodes.length; i++) {
      const n = nodes[i];
      if (!startNode && start >= n.start && start < n.end) {
        startNode = n.node;
        startOffset = start - n.start;
      }
      if (end > n.start && end <= n.end) {
        endNode = n.node;
        endOffset = end - n.start;
        break;
      }
    }
    if (!startNode || !endNode) return null;

    const afterStart = splitTextNode(startNode, startOffset);
    let endTarget = endNode;
    let endOff = endOffset;
    if (startNode === endNode) {
      endTarget = afterStart;
      endOff = length;
    }
    const afterEnd = splitTextNode(endTarget, endOff);

    const range = document.createRange();
    range.setStart(afterStart, 0);
    if (afterEnd) {
      range.setEnd(afterEnd, 0);
    } else {
      range.setEnd(
        endTarget,
        endTarget.nodeValue ? endTarget.nodeValue.length : 0
      );
    }
    range.deleteContents();

    const anchor = document.createElement("span");
    anchor.className = "box-anchor";
    range.insertNode(anchor);
    return anchor;
  }

  function inHighlightLine(el) {
    return !!(el && el.closest && el.closest(".highlight-line"));
  }

  function processRoot(root) {
    if (!root || root.dataset.boxProcessed === "1") return;
    const collected = collectTextNodes(root);
    const markers = findMarkers(collected.text);
    if (markers.length === 0) {
      root.dataset.boxProcessed = "1";
      return;
    }
    let spec = {};
    markers.forEach(function (m) {
      spec = mergeSpecs(spec, m.spec);
    });
    for (let i = markers.length - 1; i >= 0; i--) {
      const again = collectTextNodes(root);
      replaceMarkerAt(again.nodes, markers[i].start, markers[i].length);
    }
    if (spec.delay) root.dataset.boxDelay = "1";
    if (spec.index !== undefined) root.dataset.boxIndex = String(spec.index);
    root.dataset.boxProcessed = "1";
  }

  function insertDelayTriggers() {
    document.querySelectorAll("pre").forEach(function (pre) {
      if (pre.querySelector(".box-trigger")) return;
      const codes = pre.querySelectorAll("code.sourceCode");
      let host = null;
      for (let i = 0; i < codes.length; i++) {
        const code = codes[i];
        processRoot(code);
        if (code.dataset.boxDelay !== "1") continue;
        const anchors = code.querySelectorAll(".box-anchor");
        if (anchors.length !== 2) continue;
        const highlighted = Array.prototype.every.call(anchors, inHighlightLine);
        if (highlighted || !host) host = code;
        if (highlighted) break;
      }
      if (!host) return;
      const trigger = document.createElement("span");
      trigger.className = "fragment box-trigger";
      host.parentNode.insertBefore(trigger, host.nextSibling);
      const frags = pre.querySelectorAll(":scope > .fragment");
      for (let i = 0; i < frags.length; i++) {
        frags[i].setAttribute("data-fragment-index", String(i));
      }
    });
  }

  function processAll() {
    document.querySelectorAll("pre code.sourceCode").forEach(processRoot);
    insertDelayTriggers();
  }

  function updateOverlay() {
    const slide = deck.getCurrentSlide();
    if (!slide) {
      hideOverlay();
      return;
    }

    const code = visibleCode(slide);
    if (code) processRoot(code);

    let pair = [];
    if (code) {
      pair = Array.prototype.slice.call(code.querySelectorAll(".box-anchor"));
    }
    if (pair.length !== 2) {
      hideOverlay();
      return;
    }

    const hasLineHighlights = code && code.classList.contains("has-line-highlights");
    if (
      hasLineHighlights &&
      (!inHighlightLine(pair[0]) || !inHighlightLine(pair[1]))
    ) {
      hideOverlay();
      return;
    }

    const f = deck.getIndices().f;
    if (
      code.dataset.boxIndex !== undefined &&
      f !== parseInt(code.dataset.boxIndex, 10)
    ) {
      hideOverlay();
      return;
    }
    if (code.dataset.boxDelay === "1") {
      const trigger =
        code.parentNode && code.parentNode.querySelector(".box-trigger");
      if (!trigger || !trigger.classList.contains("visible")) {
        hideOverlay();
        return;
      }
      const currentCode = slide.querySelector("pre code.current-fragment");
      if (currentCode && currentCode !== code) {
        hideOverlay();
        return;
      }
    }

    if (scrollBound !== code) {
      if (scrollBound) {
        scrollBound.removeEventListener("scroll", updateOverlay);
      }
      scrollBound = code;
      if (code) {
        code.addEventListener("scroll", updateOverlay, { passive: true });
      }
    }

    const a = pair[0].getBoundingClientRect();
    const b = pair[1].getBoundingClientRect();
    if ((a.width === 0 && a.height === 0) || (b.width === 0 && b.height === 0)) {
      hideOverlay();
      return;
    }

    const slideBounds = slide.getBoundingClientRect();
    const scale = deck.getScale();
    const left = (Math.min(a.left, b.left) - slideBounds.left) / scale;
    const top = (Math.min(a.top, b.top) - slideBounds.top) / scale;
    const right = (Math.max(a.right, b.right) - slideBounds.left) / scale;
    const bottom = (Math.max(a.bottom, b.bottom) - slideBounds.top) / scale;
    const pad = 2;

    const box = ensureOverlay(slide);
    box.style.display = "block";
    box.style.left = left - pad + "px";
    box.style.top = top - pad + "px";
    box.style.width = right - left + pad * 2 + "px";
    box.style.height = bottom - top + pad * 2 + "px";
  }

  function scheduleUpdate() {
    requestAnimationFrame(function () {
      requestAnimationFrame(updateOverlay);
    });
  }

  function boot() {
    processAll();
    updateOverlay();
    deck.on("slidechanged", scheduleUpdate);
    deck.on("fragmentshown", scheduleUpdate);
    deck.on("fragmenthidden", scheduleUpdate);
    deck.on("resize", scheduleUpdate);
  }

  if (typeof deck.isReady === "function" && deck.isReady()) {
    boot();
  } else {
    deck.on("ready", boot);
  }
}
