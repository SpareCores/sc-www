---
# ~50 chars
title: Embed Spare Cores charts in your website!
date: 2024-11-18
# ~100 character
teaser: Now it's easy to embed dynamic charts and tables on server details or multiple server comparisons via Iframes.
# 320x220
image: /assets/images/blog/thumbnails/embed-charts.webp
image_alt: Screenshot of an embedded version of the Static web server benchmarks of an Azure instance.
author: Gergely Daroczi
tags: [benchmark, score, charts]
---

We have been using static screenshots of the Spare Cores charts in our blog posts for a long time, which worked relatively well, but it had some drawbacks:

- It was a manual process to create the screenshots, then add the image files to our blog site, and write up the `ALT` tags for accessibility.
- It was annoying to update the charts when the underlying data changed.
- Images are not responsive, and look different on different screens.
- Static images lack interactivity.

To address these issues, we have now added the ability to embed the Spare Cores charts dynamically using Iframes, either for a single server or for a comparison of servers. This allows you to add the charts to your own website with a single line of code!

To embed a chart of a server's specific benchmarks, go to the server details page, and click on the `Embed chart` button in the `Performance` section. This will pop up a modal window where you can choose the benchmarks you want to embed, set the dimensions of the Iframe, and get a HTML code chunk to embed the chart. A quick example:

<iframe 
 src="/embed/server/azure/Standard_DC16s_v3/static_web" 
 style="height: 440px; width: 640px; border: 1px solid #34d399; border-radius: 8px; min-height: 400px">
</iframe>

Embedding a chart for a comparison of servers is similar: go to the server comparison page, and click on the `Embed chart` button on the top of the page. A quick example:

<iframe 
 src="http://localhost:4200/embed/compare/geekbench_multi?instances=W3sidmVuZG9yIjoiYXdzIiwic2VydmVyIjoibTdhLjR4bGFyZ2UifSx7InZlbmRvciI6ImdjcCIsInNlcnZlciI6InQyZC1zdGFuZGFyZC0xNiJ9LHsidmVuZG9yIjoiYXp1cmUiLCJzZXJ2ZXIiOiJTdGFuZGFyZF9EMTZwc192NiJ9LHsidmVuZG9yIjoiYXp1cmUiLCJzZXJ2ZXIiOiJTdGFuZGFyZF9EQzE2c192MyJ9LHsidmVuZG9yIjoiaGNsb3VkIiwic2VydmVyIjoiY2F4NDEifSx7InZlbmRvciI6ImdjcCIsInNlcnZlciI6InQyYS1zdGFuZGFyZC0xNiJ9LHsidmVuZG9yIjoiYXdzIiwic2VydmVyIjoibThnLjR4bGFyZ2UifV0=" 
 style="height: 760px; width: 100%; border: 1px solid #34d399; border-radius: 8px; min-height: 600px">
</iframe>

We hope you will find this feature useful! And we also appreciate any pingback if you are using any embedded Spare Cores charts on your site :)
