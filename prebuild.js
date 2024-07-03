const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');

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

allArticles = [];

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



