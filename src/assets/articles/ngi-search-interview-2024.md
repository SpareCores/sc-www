---
# ~50 chars
title: NGI Search Beneficiary Interview
date: 2024-10-20
# ~100 character
teaser: Spare Cores was featured in the NGI Search Interview series and NGI Innovators Expo directory.
# 320x220
image: /assets/images/blog/thumbnails/ngi-search-inteview-cover.webp
image_alt: Screenshot on the number oflikes on the Pragmatic Engineer post shared on social media.
author: Gergely Daroczi
tags: [interview, media]
---

As an [NGI Search beneficiary](/article/ngi-search-grant), we were invited for an interview to share project updates on Spare Cores. The interview was published in the <a href="https://spaces.fundingbox.com/spaces/ngi-community-ngi-innovators/67136d6eaef37c9e08371df4" target="_blank" rel="noopener">NGI Innovators Expo</a> directory, but for easier access, we also published it below:

<hr class="my-6" />

<img src="/assets/images/blog/ngi-search-interview-cover.webp" alt="Cover image of the NGI Search interview, including a profile picture of Gergely Daroczi and the affiliation with Spare Cores." />

Have you ever wondered how to simplify the search for the best cloud server among thousands of options?

Meet Spare Cores, a Python-based ecosystem that tracks and evaluates over 2000 compute resources across major cloud providers and offers this data through public databases, APIs, and an easy-to-use webpage.

✅ Introduce yourself and your company, and explain what makes you different.

Spare Cores is a Python-based ecosystem that provides a comprehensive inventory and performance evaluation of 2000+ compute resources across public cloud and server providers. We monitor the availability and pricing of cloud servers, run actual hardware inspection tools and benchmark workloads on each instance type, and make all the collected data available in public databases, APIs, SDKs, and a user-friendly webpage.

We are a small team of three, with a full-time developer focused on the frontend, and two part-time engineers handling data collection, backend, and infrastructure. When not working on Spare Cores, some of us are managing the critical data infrastructure of a public US adtech company, teaching data analysis/visualization/programming at CEU (Vienna, Austria), maintaining other Python and R open-source packages, and spending time with family (with an aggregated number of more than ten kids overall).

✅ What services or products do you offer?

Our primary mission is to design, build, and maintain an open, transparent, and easy-to-navigate set of tools to find the optimal cloud server for any task.

To achieve this, we are working on almost 20 git repositories, including Python packages for ETL or cloud infra management, an Angular app, a public HTTP API, SDKs for different programming languages to search cloud servers, Docker images for hardware inspection and benchmarks etc.

Suppose I need to pick one to highlight. In that case, that’s our homepage at sparecores.com, which is building on the many previously mentioned components to provide a user-friendly listing of cloud servers with various filtering and sorting options, along with data visualisations on the benchmark scores. We even have a fun slot machine to spin the cheapest server type for the requested number of virtual CPU cores and memory amount.

✅ What milestones have you achieved so far since your project launch?

Nine months after launching, we have just cleared our second (and most significant) milestone with the NGI Search project, delivering five open-source packages and conference presentations in three countries. Now, we will focus more on improving documentation and working with early adopters.

✅ What have you achieved with your idea thanks to the NGI Search project?

We support 2000+ server types in 300+ availability zones from four vendors (AWS, GCP, Azure, and Hetzner), monitor over 250k price records every five minutes, and track hundreds of thousands of benchmark scores on these servers. The related SQLite database of current records is over 300 MiB – after excluding the 20M historical records we have collected since the start of the year!

Our homepage also gets a pretty good number of visitors, e.g., from Google (~2k/month) and growing organic traffic (~5k/month), and we have received great feedback at the three in-person conferences where we have presented and in online communities as well: see, for example, one of our highly rated Reddit posts or The Pragmatic Engineer’s independent review.

All this was possible thanks to the NGI Search funding, which allowed us to dedicate time and resources to writing software, burning compute resources, and being active in online and offline communities!

✅ What are your goals for the middle/long-time future?

In the long term, we aim to offer a service on top of our curated data that lets users effortlessly start machines at any supported vendor to run containerized batch jobs without direct vendor engagement or managing any infrastructure. Consider this a Container-as-a-Service like AWS Fargate or Google Cloud Run – but in a much more accessible, affordable, and vendor-independent way.

✅ Any piece of advice for those who are looking for public funding?

I have contributed to and maintained open-source R packages for over a decade. Still, working on Spare Cores as part of the NGI Search grant has been an absolute game-changer, which provided support and resources to build useful and free tools without stealing time from work or family.

Other open-source communities would also greatly benefit from similar opportunities! So, I highly recommend all interested parties keep an eye on the NGI project and make the most of its initiatives. The application and the project management were a breeze compared to the value we got from the NGI Search project.