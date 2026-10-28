window.RevealPollChart = function () {
  return {
    id: "RevealPollChart",
    init: function (deck) {
      initPollChart(deck);
    },
  };
};

function initPollChart(deck) {
  const POLL_API =
    location.hostname === "sparecores.com"
      ? "https://www-api.sparecores.com"
      : "https://www-api-staging.sparecores.net";
  const SVG_NS = "http://www.w3.org/2000/svg";
  const W = 1000;
  const H = 540;
  const M = { top: 120, right: 30, bottom: 90, left: 30 };

  function svgEl(tag, attrs, text) {
    const el = document.createElementNS(SVG_NS, tag);
    Object.keys(attrs || {}).forEach(function (k) {
      el.setAttribute(k, attrs[k]);
    });
    if (text !== undefined) el.textContent = text;
    return el;
  }

  function fmt(x) {
    return Number(x.toPrecision(x >= 100 ? 3 : 2)).toLocaleString("en-US");
  }

  function barPath(x, y, w, h) {
    const r = Math.min(4, h, w / 2);
    const y0 = y + h;
    return (
      "M" + x + "," + y0 +
      "V" + (y + r) +
      "Q" + x + "," + y + " " + (x + r) + "," + y +
      "H" + (x + w - r) +
      "Q" + (x + w) + "," + y + " " + (x + w) + "," + (y + r) +
      "V" + y0 + "Z"
    );
  }

  function niceEdges(lo, hi) {
    const edges = [];
    const raw = (hi - lo) / 8 || 1;
    const mag = Math.pow(10, Math.floor(Math.log10(raw)));
    const step =
      [1, 2, 5, 10].find(function (f) {
        return f * mag >= raw;
      }) * mag;
    for (let v = Math.floor(lo / step) * step; ; v += step) {
      edges.push(Number(v.toPrecision(12)));
      if (v >= hi && edges.length > 1) return edges;
    }
  }

  function histogram(values) {
    const edges = niceEdges(
      Math.min.apply(null, values),
      Math.max.apply(null, values),
    );
    const counts = new Array(edges.length - 1).fill(0);
    values.forEach(function (v) {
      let i = 0;
      while (i < counts.length - 1 && v >= edges[i + 1]) i++;
      counts[i]++;
    });
    const lo = edges[0];
    const hi = edges[edges.length - 1];
    return {
      counts: counts,
      edges: edges,
      scale: function (v) {
        return M.left + ((v - lo) / (hi - lo)) * (W - M.left - M.right);
      },
    };
  }

  function median(values) {
    const sorted = values.slice().sort(function (a, b) {
      return a - b;
    });
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
  }

  function showMessage(el, text) {
    el.textContent = "";
    el.appendChild(
      Object.assign(document.createElement("p"), {
        className: "poll-chart-message",
        textContent: text,
      }),
    );
  }

  function render(el, votes) {
    const values = votes
      .map(function (v) { return v.value; })
      .filter(Number.isFinite);
    if (!values.length) {
      showMessage(el, "No votes yet");
      return;
    }
    el.textContent = "";

    const hist = histogram(values);
    const maxCount = Math.max.apply(null, hist.counts);
    const plotH = H - M.top - M.bottom;
    const baseY = H - M.bottom;
    const svg = svgEl("svg", {
      viewBox: "0 0 " + W + " " + H,
      class: "poll-chart-svg",
      role: "img",
      "aria-label": "Histogram of " + values.length + " votes",
    });

    const labels = [];
    hist.counts.forEach(function (count, i) {
      if (!count) return;
      const x0 = hist.scale(hist.edges[i]);
      const x1 = hist.scale(hist.edges[i + 1]);
      const h = (count / maxCount) * plotH;
      const delay = i * 60 + "ms";
      const bar = svgEl("path", {
        d: barPath(x0 + 1, baseY - h, x1 - x0 - 2, h),
        class: "poll-chart-bar",
        style: "animation-delay:" + delay,
      });
      bar.appendChild(svgEl("title", {},
        fmt(hist.edges[i]) + "–" + fmt(hist.edges[i + 1]) + ": " +
        count + (count === 1 ? " vote" : " votes")));
      svg.appendChild(bar);
      labels.push(svgEl("text", {
        x: (x0 + x1) / 2,
        y: baseY - h - 10,
        class: "poll-chart-count",
        style: "animation-delay:" + delay,
      }, count));
    });

    svg.appendChild(svgEl("line", {
      x1: M.left, x2: W - M.right, y1: baseY, y2: baseY,
      class: "poll-chart-axis",
    }));
    const step = hist.edges.length > 11 ? 2 : 1;
    hist.edges.forEach(function (edge, i) {
      if (i % step) return;
      svg.appendChild(svgEl("text", {
        x: hist.scale(edge),
        y: baseY + 34,
        class: "poll-chart-tick",
      }, fmt(edge)));
    });

    const mean = values.reduce(function (a, b) { return a + b; }, 0) / values.length;
    [
      { name: "mean", value: mean, y: 30 },
      { name: "median", value: median(values), y: 70 },
    ].forEach(function (stat) {
      const x = hist.scale(stat.value);
      svg.appendChild(svgEl("line", {
        x1: x, x2: x, y1: baseY, y2: stat.y + 8,
        class: "poll-chart-stat poll-chart-" + stat.name,
      }));
      svg.appendChild(svgEl("text", {
        x: x,
        y: stat.y,
        class: "poll-chart-stat-label poll-chart-" + stat.name + "-label",
        "text-anchor": x > W - 160 ? "end" : x < 160 ? "start" : "middle",
      }, stat.name + ": " + fmt(stat.value)));
    });
    labels.forEach(function (label) {
      svg.appendChild(label);
    });
    svg.appendChild(svgEl("text", {
      x: W / 2,
      y: H - 8,
      class: "poll-chart-caption",
    }, values.length + (values.length === 1 ? " vote" : " votes")));

    el.appendChild(svg);
    deck.layout();
  }

  function load(el) {
    const pollId = el.getAttribute("data-poll-chart");
    showMessage(el, "Loading votes…");
    fetch(POLL_API + "/polls/" + encodeURIComponent(pollId) + "/votes", {
      cache: "no-store",
      credentials: "omit",
    })
      .then(function (res) {
        if (!res.ok) throw new Error("HTTP " + res.status);
        return res.json();
      })
      .then(function (votes) {
        render(el, votes);
      })
      .catch(function (err) {
        console.warn("RevealPollChart: could not load votes:", pollId, err);
        showMessage(el, "Could not load votes");
      });
  }

  function sync() {
    const slide = deck.getCurrentSlide && deck.getCurrentSlide();
    if (!slide) return;
    slide.querySelectorAll("[data-poll-chart]").forEach(load);
  }

  deck.on("ready", sync);
  deck.on("slidechanged", sync);
}
