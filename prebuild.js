const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');
const { SitemapStream, streamToPromise } = require( 'sitemap' )
const { Readable } = require( 'stream' )

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
// generate sitemap
////////////////////////////////////////////////////////////////////////////////

const sitemapStream = new SitemapStream({ hostname: 'https://sparecores.com/' });

const links = [
  { url: '',  changefreq: 'monthly', priority: 0.7  },
  { url: 'servers',  changefreq: 'daily', priority: 1.0  },
  { url: 'server_prices',  changefreq: 'daily', priority: 1.0  },
  { url: 'vendors',  changefreq: 'monthly', priority: 0.8  },
  { url: 'regions',  changefreq: 'monthly', priority: 0.8  },
  { url: 'legal/tos',  changefreq: 'monthly', priority: 0.3  },
  { url: 'articles',  changefreq: 'weekly', priority: 0.8  },
];

allArticles.forEach((article) => {
  links.push({ url: `article/${article.filename}`, changefreq: 'monthly', priority: 0.5 });
});

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
        /*
        fs.writeFileSync('./src/sitemap.xml',
          data.toString()
            .replaceAll('<url>', '\n\n  <url>')
            .replaceAll('</url>', '\n  </url>')
            .replaceAll('<loc>', '\n    <loc>')
            .replaceAll('<changefreq>', '\n    <changefreq>')
            .replaceAll('<priority>', '\n    <priority>'));
        */

        const xmlFormatter = require('xml-formatter');
        fs.writeFileSync('./src/sitemap.xml', xmlFormatter(data.toString(), { indentation: '  ', collapseContent: true }));
      }
      )
      //.then(xml2js.parseStringPromise)
      //.then(obj => xmlbuilder.create(obj).end({ pretty: true }))
      //.then(prettyXml => console.log(prettyXml))
      .catch(err => console.error(err));
    }
  });

}).on("error", (err) => {
  console.log("Error: " + err.message);
});



