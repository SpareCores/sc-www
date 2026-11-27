## November 2026

New features:

- Embed widgets for databases: the spec cards (Database Metadata, Availability & Pricing,
  Engine, Capacity, Features, Security) and pgbench charts of the Database details page,
  and the specs and prices table and pgbench chart of the database Compare page, can be
  embedded via the new `/embed/database/:vendor/:id/:widget` and
  `/embed/database-compare/:widget` routes (#328)
- Server details page spec cards (Server Metadata, Availability, Processor, System
  Resources and Accelerators, CPU and System Topology, Server Description) can be
  embedded; the "Embed widget" button moved to the Specifications heading so servers
  without benchmarks can be embedded too, and the redesigned embed dialog has height and
  width steppers, a widget picker and a Mobile/Tablet/Desktop preview (#324)
- Section links across the site: hovering a section, chart card or FAQ heading on the
  Server and Database details, Compare, Vendor details, Benchmark workloads, landing,
  About and article pages shows a `#` link that copies the URL of that section, and the
  details pages get a Share button (#332)
- API Tokens and Organization tabs in the profile modal: create personal or
  organization API tokens with an expiration, copy the secret once, revoke tokens, see
  when they were last used, and switch between the personal account and organization
  memberships; Active devices now list location, IP address and last-active time (#339)
- Article author bios with avatars, roles and social links, multiple authors per
  article or talk, and article listings filtered by author (#337)

Improvements:

- Faster initial page load: the sign-in and analytics libraries are loaded on demand,
  halving the initial download (1.19 MB to 602 kB transferred), and sign in / sign up
  buttons open the modal at once (#319)
- Unified modal design (dark header and footer with action buttons, lighter body, light
  input fields) for the bookmark save/edit, Search Prompt, benchmark, summary and Edit
  profile modals, and for the redesigned login and register modals, which now stay open
  on browser back/forward (#326, #329)
- Benchmark categories in the Servers listing benchmark picker are arranged in a grid
  (#326)
- Every listing table (Servers, Databases, Server prices, Storages, Traffic prices,
  Advisor) shows a "No ... match the selected filters." row, and the loading overlay
  covers the whole table even when scrolled sideways (#327)

Fixes:

- The "Active only" and "Orderable only" filters of the Databases listing are checkboxes
  again instead of Any/True/False radios, where "Any" still filtered to orderable
  databases (#323)
- Closing the promo banner and clicking a bookmark button work before the page finishes
  loading (#335)
- The Lowest Prices chart of the Server details page shows the ondemand price of every
  listed zone instead of 0 for zones whose ondemand price was not among the 10 cheapest
  prices (#347)

New content:

- Slides:
  - [Data-Driven Instance Selection](https://sparecores.com/assets/slides/sreday-amsterdam-2026.html) (SREday Amsterdam 2026)
- Articles:
  - [From Cron Jobs to a Nine-Cloud Kubernetes Cluster](https://sparecores.com/article/inspector-journey)
  - [Link Straight to Any Section or Chart](https://sparecores.com/article/section-links)

## October 2026

New features:

- Stress-ng stressor results (about 84 stressors in 7 groups, e.g. CPU integer, Memory,
  Cryptography, Compression) with single-core, multi-core and scaling values on the
  Server details and Compare pages (#295)
- GPU bandwidth and latency (nvbandwidth) benchmark cards on the Server details and
  Compare pages, with the CUDA (driver) version of the benchmark environment (#293, #318)
- New Accelerator and ASIC filter categories on the Servers listing (e.g. Google TPUs),
  next to the GPU filters, which now match GPUs only; GPU sections are renamed to
  Accelerators on server pages, which also show the specific accelerator type (#285,
  #286, #289, #291, #317)
- More embeddable charts on the Compare page: PassMark CPU and memory benchmarks,
  workload profiles, prices and server features; embed dialogs only offer charts that
  have data (#294)
- Custom Edit profile modal with Account (name, avatar, email addresses, GitHub
  connect/disconnect) and Security (password, active devices, account deletion) tabs
  (#299)
- Glossary tooltips for recognized terms in articles (#296)
- Server details page shows the last known prices of servers that can no longer be
  ordered (#289)

Improvements:

- Guests see all instances of a shared comparison in the compare menu (and can remove,
  reorder or pick a baseline), while adding more than 4 instances still requires an
  account (#276)
- Failed API requests are retried automatically (timeouts, rate limits, server errors),
  with clear error toasts on the listing, compare, details, Advisor and other pages when
  retries run out (#280)
- Sign-in state stays in sync with logins and logouts made on sentinel.sparecores.com
  when returning to an open tab (#278)
- A warning that "Orderable only" has no effect when sorting the Servers listing by
  price, $ efficiency or $Core (#289)

Fixes:

- The sign-in overlay no longer covers the Cloudflare captcha during registration, and
  the login modal no longer flashes after GitHub sign-in (#275)
- Zero prices are shown as `0` instead of a dash on the Servers listing (#289)

New content:

- Slides:
  - [563 Things Karpenter Didn't Know About](https://sparecores.com/assets/slides/kcd-budapest-2026.html) (KCD Budapest 2026)
- Articles:
  - [New PostgreSQL Benchmark: A First Look](https://sparecores.com/article/pgbench-early-results-graviton)
  - [Bookmark Your Searches and Comparisons](https://sparecores.com/article/registered-users)
  - [Three new conference talks across Europe](https://sparecores.com/article/conferences-2026-q4)
  - [Measuring PostgreSQL Performance at Scale](https://sparecores.com/article/benchmark-pgbench-postgres)

## September 2026

New features:

- User accounts: sign up or log in with email or GitHub (with a CAPTCHA and consent step
  at registration), edit the profile or delete the account from the account menu in the
  header (#260, #272, #274)
- Bookmarks for signed-in users: star servers and databases as favorites, save searches
  (including filters, columns, currency and price allocation), comparisons and Advisor
  assessments, then manage them on the new Bookmarks page (rename, add notes, open,
  share, delete, reorder by drag and drop or sort by name or time bookmarked) (#260,
  #272)
- Servers listing: new searchable multi-select filter for CPU flags (#270)
- Databases listing: new Network and Performance filter categories (#270)

Improvements:

- Servers listing and Server prices: the hardware virtualization and hyperthreading
  filters are now any/yes/no filters instead of plain checkboxes (#270)
- After logging in or registering with GitHub, users return to the page they started
  from, and a cancelled GitHub authorization shows a clear message instead of a
  half-finished sign-up (#274)

Fixes:

- Servers listing, Server prices, Databases listing, Advisor and the Compare pages no
  longer reset the filters or fire an unfiltered search after a reload, changing columns
  or enabling a benchmark; outdated slower searches no longer overwrite newer results,
  and removing a database from the comparison no longer reloads the whole page (#271)

New content:

- Slides:
  - [The Cloud Performance Map: How Hetzner Ranks Among 5,000 Instance Types](https://sparecores.com/assets/slides/hetzner-summit-2026.html) (Hetzner Summit)
  - [SELECT instance FROM cloud WHERE workload = ? ORDER BY cost_efficiency](https://sparecores.com/assets/slides/posit-conf-2026.html) (posit::conf(2026))

## August 2026

New features:

- New Databases listing (`/databases`) with filters, sorting, pagination, price
  allocation options and customizable columns, and Database details pages
  (`/database/<vendor>/<id>`) with metadata, availability, pricing, security features,
  a link to the underlying server, and pgbench performance charts and SCore; both are
  linked from the header (#261, #264)
- New Database compare page (`/databases/compare`) with specs, pricing, cost efficiency,
  baseline deltas and pgbench charts; databases can be added to the comparison from the
  listing and details pages, and the header's Compare menu now has separate server and
  database sections (#263)
- New vendor pages (`/vendors/<vendor>`) with regions and zones, server and database
  counts, billing information and status, linked from server, database, benchmark,
  partner, comparison and landing pages (#264)
- Server details page: new pgbench chart when scores are available (#261)

Improvements:

- The server Compare page moved to `/servers/compare`; old `/compare` links permanently
  redirect to the new URL (#263)
- Compare pages: hiding a server in one chart's legend hides it in all charts, and
  sections or charts without data are no longer shown (#263)
- Regions table: server counts and active/inactive status for each region (#264)
- Unified button styles across the site (server details, Compare, chart dropdowns,
  Navigator, Contact, header and landing page) (#259)
- Server details page: the fullscreen button of the hardware topology (lstopo) diagram is
  only shown when the diagram does not already fit (#262)

## July 2026

New features:

- New Workload Profiles radar chart on the Server details page (also embeddable) and the
  Compare page, with a details view for each profile showing a score gauge and a
  breakdown table of the underlying raw benchmark scores, weights and their impact;
  click a profile on the chart to select it (#245, #254, #252)
- Compare page: pick a baseline server (persisted in the URL) to show deltas against it
  across prices, properties and benchmarks (#255)
- Compare page: reorder the compared servers by drag and drop in the header's Compare
  dropdown (#251)
- Server details page: a warning about more variable benchmark results on burstable
  instances (#253)

Improvements:

- Charts show warning icons with notes on benchmark caveats, chart tooltips name the
  vendor next to the server, and chart legends have a consistent style; the Workload
  Profiles chart is hidden when there is no relevant data (#252)
- Compare page: show/hide details toggles moved into the section headers, and the
  average time to start is marked as "lower is better", with best-value highlighting
  that handles ties (#251, #254)
- Search filters on the listing pages are applied on Enter or when leaving the field
  instead of on every keystroke, with a visual cue for pending, not yet applied values
  (#256)

Fixes:

- Icons are no longer rendered twice (#257)
- Correct size of the AI summary modal on the Server details page (#258)
- Compare dropdown in the header stays within the viewport and closes after comparing
  (#251)

New content:

- Slides:
  - [Getting Things Logged](https://sparecores.com/assets/slides/ghana-r-2026.html) (Ghana R Conference 2026)
  - [cloud::servers[workload == R][order(cost_efficiency)][1, eval(task)]](https://sparecores.com/assets/slides/user-2026.html) (useR! 2026)
- Articles:
  - [Burning CPU Cycles in a Wide Variety of Ways](https://sparecores.com/article/stress-ng-cpu-methods)

## June 2026

New features:

- Server details page: AI-assisted server descriptions, with a short description card and
  a "Summarize" button that opens a full summary (#248)
- Servers listing: new "Introduction" button opening a video guide, and a restyled Share
  button that confirms when the URL is copied (#247)
- Servers listing and Advisor: new baseline and maximum network speed and storage speed
  columns; Server prices: new hardware virtualization and start time columns (#242,
  #244)
- Compare page: the memory bandwidth chart marks the L1D/L2/L3 cache sizes of the
  compared servers (#249)

Improvements:

- Refreshed landing page and header navigation presenting Navigator, Resource Tracker and
  Sentinel (#233)
- Advisor: deltas against the baseline server for network speeds, and the "Benchmark"
  column is now called "Workload" (#233, #244)
- Consistent check, cross and dash marks for yes/no and missing values on the Servers
  listing, Server prices, Server details and Compare pages, and KiB/MiB units in memory
  charts (#244, #249)
- Landing page server slot machine prefers distinct vendors and shows results faster
  (#235)

Fixes:

- Correct percentage differences from the baseline server's price on the Advisor when
  traffic or extra storage requirements are set (#234)
- Zero values are shown as zero (not "-") in tables, and fractional GPU counts such as
  1/24 are displayed correctly (#244, #246, #249)
- No unwanted hover tooltip on the property cards of the Server details page (#237)
- Traffic prices table no longer offers ordering by vendor, which was not supported
  (#244)

New content:

- Slides:
  - [SELECT instance FROM cloud WHERE workload = ? ORDER BY cost_efficiency](https://sparecores.com/assets/slides/pydata-london-2026.html) (PyData London 2026)
- Articles:
  - [AWS Graviton5 Benchmarks](https://sparecores.com/article/aws-graviton5-benchmarks)
  - [A Personal Recap of PyData London 2026](https://sparecores.com/article/pydata-2026)

## May 2026

New features:

- Advisor page (`/advisor`) gets a hero section with an introduction video, example presets
  and a share button, a guided baseline selection (the baseline server field is focused
  first, then focus moves to the workload), and benchmark, efficiency and price deltas
  relative to the baseline server in the recommendations table (#232)
- Dismissible announcement banner on the home page pointing to the Advisor (#232)
- New "Network" filter category in the Servers listing sidebar (#225)

Improvements:

- Compare page: synced scrollbar mirrors and a single bottom scrollbar so wide comparisons
  are not cut off, sticky "Further Benchmarks" labels and benchmark rows, narrower columns
  so more servers fit, full category names, and chart selectors no longer clipped on the
  right (#224, #228)
- Advisor: the workload control stays disabled until a baseline server is selected and
  lists only the benchmarks available for that server (with a warning if there are none),
  the minimum memory is derived automatically when left empty, and extra cost filters are
  shown inline (#224, #225, #228)
- Embedded charts use a simplified full-width layout (#225)
- Reworked mobile menu (#224)
- Navigator overview updated with current coverage numbers (5,000+ server types, 500,000
  pricing records), licensing details (MPL 2.0 for software, CC BY-SA 4.0 for raw data),
  License and References columns in the components table, and a "Contact Us" button
  (#230)

Fixes:

- Charts and tooltips on the Server details and Compare pages no longer break when
  benchmark metadata or a server is missing; the LLM inference chart hides the model
  dropdown once a model is selected (#225)

New content:

- Articles:
  - [Conferences across Europe and USA in 2026](https://sparecores.com/article/upcoming-conferences-2026)
  - [Spare Cores Awarded EIC Seal of Excellence](https://sparecores.com/article/eic-seal-of-excellence)

## April 2026

New features:

- New Advisor page (`/advisor`): pick a baseline server, its region and a workload, set an
  optimization goal and filters (price allocation, minimum memory, peak GPU memory, etc.),
  and get a sortable, paginated table of recommended servers with compare actions and a
  shareable URL (#216)
- New Partners page (`/about/partners`) listing partners by category, linked from the
  header and footer (#222)
- The landing page slot machine results (vendor, server, region) are clickable and open the
  Servers listing filtered to that result with the selected CPU and RAM (#218)
- Compression chart on the Server details page gets a single-core/multi-core selector
  (#214)

Improvements:

- Compression chart shows results with different block sizes as separate series, adds an
  "N/A" compression level so `bzip3` results are displayed, and shows the full
  configuration in tooltips (#214, #221)
- Simpler Economics section on the Server details page, without the allocation filter
  dropdowns (#217)

Fixes:

- Malformed or outdated compare and benchmark URL parameters show an error message instead
  of breaking the page (#219)
- Tooltips are dismissed when scrolling on mobile and tablet screens (#223)
- Links on the Regions page (`/regions`) open the matching servers instead of the server
  prices page (#218)
- Dropdowns on the Compare page charts are no longer hidden behind other elements (#214)

New content:

- Articles:
  - [Resource Tracker in Rust: Single-Binary Monitoring](https://sparecores.com/article/resource-tracker-rs)
  - [A 3-Day Hackathon for Augmented Workloads](https://sparecores.com/article/ovh-softwareone-hackathon-2026)

## March 2026

New features:

- New Benchmark Workloads page (`/navigator/benchmark-workloads`) describing each benchmark
  framework and workload with its status, configurations and score distribution histogram,
  linked as "Workloads" in the navigation. Benchmarks are shown with icons across the site
  (#205)
- Server details page shows the hardware topology (`lstopo`) diagram, with hover tooltips,
  click-and-drag panning and a fullscreen view (#200, #202)
- New memory benchmark charts from `sc-membench` (bandwidth, bandwidth per core, latency
  with CPU cache size annotations) on the Server details and Compare pages (#207)
- New "CPU Cache" filter category in the Servers listing sidebar with a range slider
  (#209)

Improvements:

- Server details page reorganized into collapsible property cards with a sticky table of
  contents that highlights the current section (#205)
- Legal pages show a loading spinner and a dedicated page when a document is missing or
  fails to load; the footer always stays at the bottom of the page (#204)

Fixes:

- Compression charts distinguish single-core and multi-core results (#210)
- Benchmark selection in the Servers listing updates reliably (#211)
- CPU cache sizes are displayed correctly after the data switched to KiB

## February 2026

New features:

- Benchmark Coverage page (`/navigator/benchmark-coverage`, replacing `/debug`, which
  redirects): per-vendor counts and percentages of active, inactive, evaluated and missing
  servers with a total row, expandable vendor rows listing inactive servers and servers
  with technical or quota issues, a per-server table with filters (including "Has all
  benchmarks") and pagination, and a "Coverage" navigation link (#191, #194, #195, #196)
- Server details page warns and links to the Benchmark Coverage page when benchmark data is
  not available (#194)
- Servers listing: new optional columns for CPU cache (L1/L2/L3), network speed, inbound
  and outbound traffic, and IPv4 addresses (#192)
- Servers listing: filter by vendor region and country (#197)
- Servers listing: currency selector and best price allocation selector (any, spot only,
  on-demand only, monthly) (#199)

Improvements:

- Compare page shows large numbers in compact form (full value on hover) and right-aligns
  numeric columns (#198)
- Servers listing shows an explicit message when no servers match the filters (#194)
- Better keyboard navigation and screen reader support in filters and search (#190)

## January 2026

New features:

- New Design page (`/design`) with UI kits, icons, typography, a color palette with
  copy-to-clipboard, and downloadable logo collections (#182)

Improvements:

- The Navigator overview lists Alibaba Cloud as a supported vendor (7 in total), with
  updated server, region and price counts (#181)

Fixes:

- Regions and zones are always matched together with their vendor, fixing mixed-up
  region names and prices on the Server details, Compare and embedded chart pages when
  vendors share region IDs (#185, #186)

New content:

- Slides:
  - [Benchmarking 2000+ Cloud Servers for DS/ML/AI Workloads](https://sparecores.com/assets/slides/budapest-ds-meetup-2026.html) (Budapest Data Science Meetup)
- Articles:
  - [Modern Memory Bandwidth Benchmarks](https://sparecores.com/article/membench)
  - [Spare Cores Closes Pre-Seed Funding Round](https://sparecores.com/article/pre-seed)

## December 2025

New content:

- Slides:
  - [Cost-efficient and Scalable Dashboards in the Cloud](https://sparecores.com/assets/slides/ceu-data-jamboree-2025.html) (Vienna Data Science Group)

## November 2025

Improvements:

- Vendor logos for OVHcloud and Alibaba Cloud

New content:

- Articles:
  - [What We Have Been Up to in the Past Months](https://sparecores.com/article/year-in-review-2025)

## September 2025

New content:

- Slides:
  - [Resource Monitoring and Optimization with Metaflow](https://sparecores.com/assets/slides/pydata-amsterdam-2025.html) (PyData Amsterdam 2025)
  - [Magically Right Size the Compute Resources Dedicated to Your AI/ML Workloads](https://sparecores.com/assets/slides/outerbounds-office-hours-2025.html) (Outerbounds Office Hours)
  - [Benchmarking 2000+ Cloud Servers for GBM Model Training and LLM Inference Speed](https://sparecores.com/assets/slides/pydata-berlin-2025.html) (PyData Berlin 2025)

## August 2025

New content:

- Slides:
  - [Getting Things Logged](https://sparecores.com/assets/slides/user-2025.html) (useR! 2025)
- Articles:
  - [Native support for the Resource Tracker in R](https://sparecores.com/article/resource-tracker-for-r)

## July 2025

New features:

- Revamped landing page focusing on the products, with testimonials, service offerings and
  a link to the wait-list, plus new "About Navigator" (`/about/navigator`) and "About Spare
  Cores" (`/about/spare-cores`) pages under a new "About" dropdown in the header; `/about`
  redirects to the latter (#177)

## June 2025

New content:

- Slides:
  - [Resource Monitoring and Cloud Optimization for Data Science Tasks with Metaflow](https://sparecores.com/assets/slides/budapest-ml-2025.html) (Budapest ML Forum 2025)
- Articles:
  - [Spare Cores at the useR! and PyData events](https://sparecores.com/article/upcoming-conferences-2025-Q3)

## May 2025

Improvements:

- "Book a Demo" buttons open an embedded scheduling widget instead of an external link
  (#175)
- Footer links to YouTube instead of Facebook

Fixes:

- Servers listing no longer breaks on benchmarks without a unit

New content:

- Articles:
  - [LLM Inference Speed Benchmarks](https://sparecores.com/article/llm-inference-speed)

## April 2025

New features:

- LLM inference speed charts (prompt processing and text generation) on the Server details
  and Compare pages, with model selection and embedding support (#173)
- Curated server lists for shared-core, burstable and dedicated servers, and for each GPU
  model (e.g. `/servers/h100`)
- New About page (`/about`) and reworked header navigation with a "Book a Demo" call to
  action (#172)

Improvements:

- Benchmark scores are shown with their units in the Servers listing (#173)

New content:

- Slides:
  - [Starting 2000 Cloud Servers for Benchmarking LLM Inference Speed](https://sparecores.com/assets/slides/kcd-budapest-2025.html) (KCD Budapest 2025)
- Articles:
  - [Kubernetes and Machine Learning conferences](https://sparecores.com/article/upcoming-conferences-2025-Q2)
  - [Optimizing Resource Usage of Batch Jobs](https://sparecores.com/article/metaflow-resource-tracker)

## March 2025

New features:

- Feedback form for Resource Tracker users (`/feedback/:id`) (#168)

Fixes:

- The embed dialog on the Server details page no longer renders an empty iframe before it
  is opened

New content:

- Articles:
  - [Search and Order Servers for Any Workload](https://sparecores.com/article/search-benchmarks)

## February 2025

New features:

- Servers listing: filter and sort by any of the 500+ benchmark scores via a benchmark
  selector, and curated server lists under `/servers/:id` (e.g. `/servers/gpu` for GPU
  servers) with their own title, description, filters, columns and ordering (#164)
- New Contact page (`/contact`) with a contact form, also linked from the footer (#167)

Improvements:

- Copy-to-clipboard actions and errors show toast notifications; pages show a loading
  spinner instead of a half-rendered table (#164)

New content:

- Articles:
  - [Welcome 67 new server types from UpCloud!](https://sparecores.com/article/upcloud-servers)

## January 2025

Improvements:

- Compare page shows the $Core score (performance per USD) for the best on-demand and spot
  prices and for every additional region price (#159, #161)
- Table rows no longer shift on hover, and vendor logos are capped in height (#165)

New content:

- Slides:
  - [Spare Cores introduction and project updates](https://sparecores.com/assets/slides/ngi-search-standup-2025.html) (NGI Search Standup #6)
  - [From idea to product: creating Spare Cores](https://sparecores.com/assets/slides/ceu-data-jamboree-2024.html) (Vienna Data Science Group)

## December 2024

New features:

- PassMark CPU and memory benchmark scores and charts on the Server details page and the
  Compare page, including the embeddable charts (#152)
- Select servers with checkboxes on the Server prices page and compare them; comparisons
  can now be pinned to specific zones, showing the zone of the best on-demand and spot
  prices (#153)

Improvements:

- The selected columns of the Servers listing and Server prices pages are stored in the
  URL (`columns` query param), so custom views can be bookmarked and shared (#155)
- Info icons and vendor/server names no longer wrap awkwardly in compare charts and on
  the Server prices page (#154)

Fixes:

- Azure servers no longer show a redundant API reference when it differs from the
  display name only by the `Standard_` prefix (#157)

New content:

- Slides:
  - [Spare Cores: Bringing Clarity to Cloud Server Options](https://sparecores.com/assets/slides/ow2-webinar-2024-3.html) (OW2 Open Source Webinar #3)
  - [Vendor-independent Cloud Computing Hardware Information and Benchmarking](https://sparecores.com/assets/slides/osxp-2024.html) (Open Source Experience 2024)

## November 2024

New features:

- Embeddable benchmark charts: an "Embed" button on the Server details page and the
  Compare page opens a dialog with a configurable iframe snippet, served from dedicated
  chart-only pages with a link back to Spare Cores (#142, #145, #146)
- Share a direct link to any benchmark section of the Server details and Compare pages
  (#141)
- Numeric inputs next to the range sliders in the search filters to type exact values
  (#148)

Improvements:

- Section titles of the Compare page fit on mobile screens (#141)
- Servers listing shows the column used for ordering when it is set in the query (#147)
- Vendor logos load from the site itself, and New Zealand is available as a country
  filter (#147)
- The landing page's slot machine picks top servers from three different vendors (#144)

Fixes:

- The maximum vCPUs filter is adjusted to never go below the minimum (#150)

New content:

- Slides:
  - [Optimizing Cloud Compute Resources with Spare Cores](https://sparecores.com/assets/slides/sfscon-2024.html) (SFSCON 2024)
- Articles:
  - [Fireside chat at Architecture Weekly](https://sparecores.com/article/architecture-weekly-2024)
  - [Spare Cores at SFSCon 2024 in Bolzano](https://sparecores.com/article/sfscon-2024)
  - [Embed Spare Cores charts in your website!](https://sparecores.com/article/embed-charts)
  - [Say hi in person and grab a Spare Cores sticker!](https://sparecores.com/article/upcoming-conferences-2024-Q4)

## October 2024

New features:

- Curated comparisons on `/compare` when no servers are selected (e.g. best
  single-/multi-core performance per vCPU count or memory, best static web and Redis
  servers, optionally below a price cap), including the SQL queries behind each list;
  the Compare page is added to the header navigation as "Compare Servers", with server,
  storage and traffic prices grouped under a new "Prices" menu (#130)
- Stress-ng multi-core scalability charts on the Server details and Compare pages
  (#132)
- $Core (SCore per price) and best on-demand/spot price columns on the Servers listing
  and Server prices pages (#128)
- Best spot price on the Compare page (#131)
- Similar servers on the Server details page can be listed by CPU performance per price
  (#135)

Improvements:

- Benchmark charts on the Server details and Compare pages share unified dropdowns to
  pick benchmark settings (#125)
- The Regions page loads its map library only when needed, speeding up the rest of the
  site (#126)
- Storage descriptions are shown on the Server details page, and memory below 1 GiB is
  shown with one decimal (#137, #138)
- Back navigation restores the scroll position, the Compare page's sticky header stays
  aligned, and narrow screens get side margins (#140)

Fixes:

- Filters at the bottom of the search sidebar are reachable by scrolling (#124)
- `true`/`false` query params are applied as proper boolean filters (#129)
- Price filter input is readable on Safari (#136)
- The compression chart on the Server details page renders correctly (#140)
- Section anchors on the Compare page are unique (#123)

New content:

- Articles:
  - [Spare Cores featured by The Pragmatic Engineer](https://sparecores.com/article/pragmatic-engineer-pulse-2024)
  - [vCPUs in the Real World: Do They Truly Scale?](https://sparecores.com/article/multi-core-scalability)
  - [NGI Search Beneficiary Interview](https://sparecores.com/article/ngi-search-interview-2024)

## September 2024

New features:

- Storage prices (`/storages`) and Traffic prices (`/traffic-prices`) pages with
  filtering, sorting, pagination and currency selection (#118)
- Static web server and Redis benchmark charts on the Server details and Compare pages
  (#95, #102)
- CPU and GPU manufacturer, family and model columns and filters, plus a maximum vCPUs
  filter on the Servers listing and Server prices pages (#120)
- Vendor legend on the Regions map to show or hide each vendor's regions (#111)

Improvements:

- Faster loading of the Server details page (#98)

Fixes:

- Servers without price data no longer crash the page (#108)
- The CPU cache-size markers on the memory bandwidth chart update when switching servers
  (#106)
- The Compare page dropdown is no longer hidden behind the sticky table header (#119)
- Landing page tooltips are positioned correctly (#105)

## August 2024

New features:

- Similar servers section on the Server details page with selectable criteria (same
  family, specs, performance), kept in the URL (#86, #92, #93)
- Price column on the Servers listing (#82)
- The Compare page marks the best price, performance and value servers (#81)

Improvements:

- Benchmark charts and tables on the Server details and Compare pages note whether
  higher or lower is better, with explanatory tooltips (#78)
- GPU memory columns on the Servers listing show minimum and total GPU memory (#83)

Fixes:

- Correct best multi-core performance marking on the Compare page for single-vCPU servers
  (#85)

New content:

- Articles:
  - [New Benchmarks: Static Web Server Workloads](https://sparecores.com/article/benchmark-static-webserver)

## July 2024

New features:

- Server details pages have a comment section (GitHub Discussions via Giscus) (#72)
- Each server details page has its own social preview image showing the server's
  specs and prices when shared (#52, #59)
- Regions page shows an interactive world map of the regions of each vendor (#76)
- The landing page lists the supported and planned vendors, with tooltips listing them
  (#77)
- Survey pages (`/survey/:id`) for collecting feedback from users (#68)
- Terms of Service and Privacy Policy are separate pages, with a list of all legal
  documents at `/legal`; the old `/legal/tos` URL redirects to the new one (#75)

Improvements:

- Compare page: sticky header row, a loading indicator, benchmark sections with charts
  inside the comparison table, single-item benchmark lists opened automatically, and
  clearer chart tooltips and labels (#51, #54, #57)
- Servers and Server prices listings show the CPU allocation (shared or dedicated) next
  to the vCPU count (#71)
- Server details page shows storage and GPU details in readable form instead of raw
  JSON, and supports the `showDetails` and `openFAQ` query params to open all details or
  a FAQ item (#67)
- Landing page slot machine starts animating right after pressing SPIN (#71)

Fixes:

- An unknown or failing server details page shows an error message instead of silently
  redirecting to the landing page (#67)
- Correct canonical URL of server details pages (#53)

New content:

- Slides:
  - [Spare Cores: Harnessing Unutilized Cloud Compute Resources](https://sparecores.com/assets/slides/user-2024.html) (useR! 2024)
- Articles:
  - [Exploring the 2024 Cloud Use Cases Landscape](https://sparecores.com/article/survey-cloud-use-cases-2024)
  - [The EU Must Keep Funding Open Source!](https://sparecores.com/article/open-letter-to-eu-to-keep-ngi-funded)
  - [Spare Cores Joins NVIDIA Inception](https://sparecores.com/article/nvidia-inception)
  - [A closer look at Hetzner Cloud's new CX servers](https://sparecores.com/article/hetzner-new-cx-servers)

## June 2024

Breaking changes:

- Server details URLs use the server's API reference (e.g. `/server/aws/t3.micro`)
  instead of the internal server ID (#27)
- Datacenters are called regions: the Datacenters page moved to `/regions` (`/datacenters`
  redirects) and the `datacenters` filter query param of the listings is now `regions`
  (#25)

New features:

- Compare page (`/compare`): select servers on the Servers listing or the Compare button
  on a server details page, then compare their specs, best on-demand prices (in the
  chosen currency) and benchmark scores side by side, with Geekbench, memory bandwidth,
  OpenSSL and compression charts and links to each server (#22, #24, #27, #29, #44,
  #45)
- Server prices listing (`/server_prices`) with prices per server and region (#22)
- Server details page shows benchmark results: memory bandwidth, compression, Geekbench
  scores and OpenSSL speed, with a radar chart and expandable benchmark details (#26,
  #27)
- Servers and Server prices listings have a SCORE column (stress-ng div16 performance)
  with score per USD price, a GPU total memory column and filter, and show memory speed
  and generation (#32)
- Share button copying the link of the current Servers or Server prices search (#26)
- Vendor filter with a checkbox per vendor (#48)

Improvements:

- New search bar on the Servers and Server prices listings, with filter categories
  expanded when in use, and pagination links instead of buttons (#31, #33, #35, #37)
- Vendor and compliance framework names shown instead of IDs (#48)
- Prices are shown in the selected currency instead of always USD (#31)
- More details and FAQ entries on server details pages, e.g. the vendor, the number of
  prices, zones and supported regions (#38)
- Sticky site header (#46)
- The landing page slot machine picks three different servers (#42)
- Server details pages appear as products in Google search results (#43)

Fixes:

- Correct active-only filter, compression benchmark labels, and multi-core score of
  servers where all CPUs means a single one (#31, #47)
- Decompression speed is shown on screens narrower than 1025px (#48)
- Selecting multiple countries or regions on the Server prices listing no longer crashes
  the page (#34)
- Search bar fields keep focus while typing (#37)

New content:

- Slides:
  - [Harnessing Spare Cores to Breeze Through Cloud-Based Batch Jobs](https://sparecores.com/assets/slides/budapest-data-2024.html) (Budapest Data Forum 2024)
  - [Harnessing Spare Cores to Breeze Through Cloud Compute](https://sparecores.com/assets/slides/berlin-buzzwords-2024.html) (Berlin Buzzwords 2024)
- Articles:
  - [Spare Cores at the Berlin Buzzwords 2024 conf](https://sparecores.com/article/berlin-buzzwords-2024)

## May 2024

Breaking changes:

- Article URLs no longer include the category: `/article/:id` instead of
  `/article/:category/:id` (#11)

New features:

- Servers listing (`/servers`) with filters (e.g. vCPUs, memory, price, vendor,
  continent/country/datacenter, green energy), selectable columns, currency and price
  allocation selectors, pagination and page size, and filters kept in the URL (#6, #9)
- Server details page (`/server/:vendor/:id`) with specs, prices across datacenters with
  charts, similar servers and a FAQ (#9, #11, #12)
- AI-assisted search: describe the server you need in free text to fill in the filters
  (#11)
- Datacenters and Vendors pages, listing the tracked datacenters and supported vendors
  (#11)
- Articles listing and article pages, and a Terms of Service page (#6)

Improvements:

- Mobile-friendly layout with a menu icon (#8)
- Faster loading with compressed WebP images and fixed-size logo; better accessibility
  labels and image alt texts (#10, #18, #19)
- Landing page: updated images, larger text and faster SPIN button (#9, #10)

Fixes:

- Opening a vendor homepage no longer also opens a filtered Servers listing (#14)

New content:

- Articles:
  - [Unlocking Cloud Compute Performance](https://sparecores.com/article/cloud-compute-performance-benchmarks)

## April 2024

New features:

- First version of sparecores.com: landing page with a slot machine picking random
  servers from live Spare Cores data, featured articles, header and footer with links
  to the open-source repositories and social profiles (#2, #3, #4, #5)

New content:

- Articles:
  - [Meet the Spare Cores team live at conferences](https://sparecores.com/article/upcoming-conferences-2024-Q3)
  - [Spot server termination rate per availability zones](https://sparecores.com/article/spot-instance-terminate-rates-per-az)
  - [67% cost savings at adtech company](https://sparecores.com/article/67pct-cost-saving-at-adtech-company)
  - [When to use resource ids, or prefer the names?](https://sparecores.com/article/ids-vs-names)
  - [Project takeoff: NGI Search grant award](https://sparecores.com/article/ngi-search-grant)
