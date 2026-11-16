---
# ~50 chars
title: Link Straight to Any Section or Chart
date: 2026-11-13
# ~100 character
teaser: Copy a link to a single chart, section, or FAQ, and share a server or database page in one click.
# 320x220
image: /assets/images/blog/thumbnails/section-links.webp
image_alt: Server details chart with a copy-link anchor icon next to the title.
author: Adam Toth
tags: [user-experience, web-application, charts]
---

Our server and database pages are long. A server details page can include
hardware specs, prices, and a long series of benchmark charts, so a comparison
page is even longer. If you wanted to point someone at a specific chart or
section, you used to send the page link and say, "scroll down to Memory
Bandwidth."

Now sharing a page and linking to the exact part you mean are both one click
away. In short:

- **Share button**: server and database details pages now have a `Share`
  button next to `Compare`, which copies the page link.
- **Section links**: click the `#` next to a section heading, chart title, or
  FAQ to copy a link to that exact spot.
- **Reliable landing**: a link to a section opens the page at that section,
  right below the site header, even when the charts load a little later.

## Share a Whole Page

The server and database listings, the [server prices](/server_prices) page,
and the [Advisor](/advisor) already had a share button in their page header.
Now the details pages have one too, and all of them use the same icon and the
same "Link copied to clipboard!" confirmation.

The copied link is simply the page URL, so a shared search keeps its filters,
and a shared comparison keeps its servers and baseline. No account is needed to
share or open the link. If you would rather keep a page for yourself than send
it, save it as a bookmark, as described in our
[Bookmark Your Searches and Comparisons](/article/registered-users) article.

## Copy a Link to Any Section

Hover over a heading, and a `#` appears next to it. Click it, and the link to
that section is copied to your clipboard, with the same confirmation as the
`Share` button. For example, the following link opens a Google Cloud
server page at its Geekbench multi-core chart:
[/server/gcp/t2d-standard-1#geek_multi](/server/gcp/t2d-standard-1#geek_multi).

<div class="text-center m-2.5 mt-8 mb-6">
  <img class="zoomin w-full"
    title="Copy a link to a chart"
    alt="Benchmark chart heading on a server details page, with the copy-link # icon shown on hover next to its title."
    src="/assets/images/blog/section-links-hover.webp"/>
  <p>The <code>#</code> next to a chart title copies a link to that chart</p>
</div>

You can find these links on the following pages:

- server details pages: sections, benchmark charts, and FAQs
- database details pages: sections and benchmark charts
- server and database comparisons: every section of the comparison table,
  replacing the separate link buttons of the server comparison page
- [vendor pages](/vendors): the details, metadata, billing, and regions
  sections
- [benchmark workloads](/navigator/benchmark-workloads): each benchmark
  framework, such as `bogomips` or `bw_mem`
- blog articles, including this one: every heading
- the landing page and the [about](/about/spare-cores) and
  [partners](/about/partners) pages

## Feedback

Please share your feedback or suggestions in the comment box below!
