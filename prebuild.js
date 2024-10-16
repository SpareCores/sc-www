const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');
const { SitemapStream, streamToPromise } = require( 'sitemap' )
const { Readable } = require( 'stream' )
const specialCompares = require('./src/app/pages/server-compare/special-compares');


////////////////////////////////////////////////////////////////////////////////
// init the static list of pages to prerender
////////////////////////////////////////////////////////////////////////////////

fs.copyFileSync('prerender_routes_static.txt', 'prerender_routes.txt');

////////////////////////////////////////////////////////////////////////////////
// compile list of articles and append to prerender list
////////////////////////////////////////////////////////////////////////////////

let dirPath = path.join(__dirname, './src/assets/articles');
let files = fs.readdirSync(dirPath);
files = files.filter(file => file.endsWith('.md'));

let allArticles = files.map((file) => {
  const filename = path.parse(file).name
  // append to list of pages to prerender
  fs.appendFileSync('prerender_routes.txt', '/article/' + filename + '\n');
  // extract metadata
  const content = fs.readFileSync(path.join(dirPath, file), 'utf-8');
  const { data } = matter(content);
  return {
    ...data,
    filename: filename
  }
});
allArticles = allArticles.sort((a, b) => new Date(b.date) - new Date(a.date));
fs.writeFileSync('./src/assets/articles/all.json', JSON.stringify(allArticles));

////////////////////////////////////////////////////////////////////////////////
// compile list of talks
////////////////////////////////////////////////////////////////////////////////

dirPath = path.join(__dirname, './src/assets/slides');
files = fs.readdirSync(dirPath);

// extract metadata from the '*.Rmd' files and sort by date
data = files
  .filter((file) => file.endsWith('.Rmd'))
  .map((file) => {
  const content = fs.readFileSync(path.join(dirPath, file), 'utf-8');
  const { data } = matter(content);
  return {
    ...data,
    filename: path.parse(file).name
  }
  });


data = data.sort((a, b) => new Date(b.date) - new Date(a.date));

fs.writeFileSync('./src/assets/slides/slides.json', JSON.stringify(data));

////////////////////////////////////////////////////////////////////////////////
// compile list of legal documents
////////////////////////////////////////////////////////////////////////////////

dirPath = path.join(__dirname, './src/assets/legal');
files = fs.readdirSync(dirPath);

data = files
  .filter((file) => file.endsWith('.md'))
  .map((file) => {
  const content = fs.readFileSync(path.join(dirPath, file), 'utf-8');
  const { data } = matter(content);
  return {
    ...data,
    filename: path.parse(file).name
  }
  });
data = data.sort((a, b) => new Date(a.priority) - new Date(b.priority));
fs.writeFileSync('./src/assets/legal/legal-documents.json', JSON.stringify(data));


////////////////////////////////////////////////////////////////////////////////
// generate sitemap
////////////////////////////////////////////////////////////////////////////////

const sitemapStream = new SitemapStream({ hostname: 'https://sparecores.com/' });

const links = [
  { url: '',  changefreq: 'monthly', priority: 1.0  },
  { url: 'servers',  changefreq: 'hourly', priority: 0.75  },
  { url: 'server_prices',  changefreq: 'hourly', priority: 0.75  },
  { url: 'vendors',  changefreq: 'monthly', priority: 0.5  },
  { url: 'regions',  changefreq: 'weekly', priority: 0.5  },
  { url: 'legal',  changefreq: 'monthly', priority: 0.10  },
  { url: 'legal/privacy-policy',  changefreq: 'monthly', priority: 0.10  },
  { url: 'legal/terms-of-service',  changefreq: 'monthly', priority: 0.10  },
  { url: 'articles',  changefreq: 'weekly', priority: 0.75  },
  { url: 'talks',  changefreq: 'monthly', priority: 0.75  },
  { url: 'compare',  changefreq: 'weekly', priority: 0.75  },
];

allArticles.forEach((article) => {
  links.push({ url: `article/${article.filename}`, changefreq: 'yearly', priority: 0.6 });
});

if(specialCompares?.length) {
  specialCompares.forEach((specialCompare) => {
    links.push({ url: `compare/${specialCompare.id}`, changefreq: 'daily', priority: 0.9 });
  });
}

// get https://keeper.sparecores.net/table/server using http
const https = require('https');

https.get('https://keeper.sparecores.net/table/server', (res) => {
  let data = '';

  // A chunk of data has been received.
  res.on('data', (chunk) => {
    data += chunk;
  });

  // The whole response has been received.
  res.on('end', () => {
    const parsedData = JSON.parse(data);
    if(parsedData?.length) {
      parsedData.forEach((server) => {
        links.push({ url: `server/${server.vendor_id}/${server.api_reference}`, changefreq: 'daily', priority: 0.9 });
      });
      streamToPromise(Readable.from(links).pipe(sitemapStream)).then((data) =>
      {
        data.toString();
        const xmlFormatter = require('xml-formatter');
        fs.writeFileSync('./src/sitemap.xml', xmlFormatter(data.toString(), { indentation: '  ', collapseContent: true }));
      }
      )
      .catch(err => console.error(err));
    }
  });

}).on("error", (err) => {
  console.log("Error: " + err.message);
});



