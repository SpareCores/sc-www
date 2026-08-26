const fs = require("fs");
const path = require("path");
const matter = require("gray-matter");
const { SitemapStream, streamToPromise } = require("sitemap");
const { Readable } = require("stream");
const serverCompares = require("./src/app/pages/server-compare/server-compares");
const databaseCompares = require("./src/app/pages/database-compare/database-compares");
const specialServerLists = require("./src/app/pages/server-listing/special-lists");

////////////////////////////////////////////////////////////////////////////////
// init the static list of pages to prerender
////////////////////////////////////////////////////////////////////////////////

fs.copyFileSync("prerender_routes_static.txt", "prerender_routes.txt");

////////////////////////////////////////////////////////////////////////////////
// compile list of articles and append to prerender list
////////////////////////////////////////////////////////////////////////////////

let dirPath = path.join(__dirname, "./src/assets/articles");
let files = fs.readdirSync(dirPath);
files = files.filter((file) => file.endsWith(".md"));

let allArticles = files.map((file) => {
  const filename = path.parse(file).name;
  // append to list of pages to prerender
  fs.appendFileSync("prerender_routes.txt", "/article/" + filename + "\n");
  // extract metadata
  const content = fs.readFileSync(path.join(dirPath, file), "utf-8");
  const { data } = matter(content);
  return {
    ...data,
    filename: filename,
  };
});
allArticles = allArticles.sort((a, b) => new Date(b.date) - new Date(a.date));
fs.writeFileSync("./src/assets/articles/all.json", JSON.stringify(allArticles));

////////////////////////////////////////////////////////////////////////////////
// compile list of talks
////////////////////////////////////////////////////////////////////////////////

dirPath = path.join(__dirname, "./src/assets/slides");
files = fs.readdirSync(dirPath);

// extract metadata from the '*.Rmd' files and sort by date
data = files
  .filter((file) => file.endsWith(".Rmd"))
  .map((file) => {
    const content = fs.readFileSync(path.join(dirPath, file), "utf-8");
    const { data } = matter(content);
    return {
      ...data,
      // default to show the slides in the main index if not explicitly set
      featured: data.featured ?? true,
      filename: path.parse(file).name,
    };
  });

data = data.sort((a, b) => new Date(b.date) - new Date(a.date));

fs.writeFileSync("./src/assets/slides/slides.json", JSON.stringify(data));

////////////////////////////////////////////////////////////////////////////////
// compile list of legal documents
////////////////////////////////////////////////////////////////////////////////

dirPath = path.join(__dirname, "./src/assets/legal");
files = fs.readdirSync(dirPath);

data = files
  .filter((file) => file.endsWith(".md"))
  .map((file) => {
    const content = fs.readFileSync(path.join(dirPath, file), "utf-8");
    const { data } = matter(content);
    return {
      ...data,
      filename: path.parse(file).name,
    };
  });
data = data.sort((a, b) => new Date(a.priority) - new Date(b.priority));
fs.writeFileSync(
  "./src/assets/legal/legal-documents.json",
  JSON.stringify(data),
);

////////////////////////////////////////////////////////////////////////////////
// generate sitemap
////////////////////////////////////////////////////////////////////////////////

const sitemapStream = new SitemapStream({
  hostname: "https://sparecores.com/",
});

const links = [
  { url: "", changefreq: "monthly", priority: 1.0 },
  { url: "about/spare-cores", changefreq: "monthly", priority: 1.0 },
  { url: "about/navigator", changefreq: "monthly", priority: 1.0 },
  { url: "servers", changefreq: "hourly", priority: 0.75 },
  { url: "databases", changefreq: "hourly", priority: 0.75 },
  { url: "server_prices", changefreq: "hourly", priority: 0.75 },
  { url: "vendors", changefreq: "monthly", priority: 0.5 },
  { url: "regions", changefreq: "weekly", priority: 0.5 },
  { url: "legal", changefreq: "monthly", priority: 0.1 },
  { url: "legal/privacy-policy", changefreq: "monthly", priority: 0.1 },
  { url: "legal/terms-of-service", changefreq: "monthly", priority: 0.1 },
  { url: "articles", changefreq: "weekly", priority: 0.75 },
  { url: "talks", changefreq: "monthly", priority: 0.75 },
  { url: "servers/compare", changefreq: "weekly", priority: 0.75 },
  { url: "databases/compare", changefreq: "weekly", priority: 0.75 },
];

allArticles.forEach((article) => {
  links.push({
    url: `article/${article.filename}`,
    changefreq: "yearly",
    priority: 0.6,
  });
});

if (specialCompares?.length) {
  specialCompares.forEach((specialCompare) => {
    if (specialCompare.type === "card") {
      links.push({
        url: `servers/compare/${specialCompare.id}`,
        changefreq: "daily",
        priority: 0.9,
      });
    }
  });
}

if (databaseCompares?.length) {
  databaseCompares.forEach((databaseCompare) => {
    if (databaseCompare.type === "card") {
      links.push({
        url: `databases/compare/${databaseCompare.id}`,
        changefreq: "daily",
        priority: 0.9,
      });
    }
  });
}

if (specialServerLists?.length) {
  specialServerLists.forEach((specialList) => {
    links.push({
      url: `servers/${specialList.id}`,
      changefreq: "hourly",
      priority: 0.75,
    });
  });
}

////////////////////////////////////////////////////////////////////////////////
// get server and database tables from the Keeper API
////////////////////////////////////////////////////////////////////////////////

const https = require("https");

function fetchJson(url) {
  return new Promise((resolve, reject) => {
    https
      .get(url, (res) => {
        let data = "";
        res.on("data", (chunk) => {
          data += chunk;
        });
        res.on("end", () => {
          try {
            resolve(JSON.parse(data));
          } catch (err) {
            reject(err);
          }
        });
      })
      .on("error", reject);
  });
}

function writeSitemap() {
  streamToPromise(Readable.from(links).pipe(sitemapStream))
    .then((data) => {
      data.toString();
      const xmlFormatter = require("xml-formatter");
      fs.writeFileSync(
        "./src/sitemap.xml",
        xmlFormatter(data.toString(), {
          indentation: "  ",
          collapseContent: true,
        }),
      );
    })
    .catch((err) => console.error(err));
}

Promise.allSettled([
  fetchJson("https://keeper.sparecores.net/table/server"),
  fetchJson("https://keeper.sparecores.net/table/database"),
]).then(([serversResult, databasesResult]) => {
  if (serversResult.status === "fulfilled" && serversResult.value?.length) {
    serversResult.value.forEach((server) => {
      links.push({
        url: `server/${server.vendor_id}/${server.api_reference}`,
        changefreq: "daily",
        priority: 0.9,
      });
    });
  } else if (serversResult.status === "rejected") {
    console.log("Error: " + serversResult.reason?.message);
  }

  if (databasesResult.status === "fulfilled" && databasesResult.value?.length) {
    databasesResult.value.forEach((database) => {
      links.push({
        url: `database/${database.vendor_id}/${database.api_reference}`,
        changefreq: "daily",
        priority: 0.9,
      });
    });
  } else if (databasesResult.status === "rejected") {
    console.log("Error: " + databasesResult.reason?.message);
  }

  writeSitemap();
});
