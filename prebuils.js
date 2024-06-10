const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');

// list all items in the directory and generate a json file to be used in the app
let dirPath = path.join(__dirname, './src/assets/articles/featured');
let files = fs.readdirSync(dirPath);

let allArticles = [];

// extract metadata from the files and sort by date
let data = files.map((file) => {
  const content = fs.readFileSync(path.join(dirPath, file), 'utf-8');
  const { data } = matter(content);
  return {
    ...data,
    filename: path.parse(file).name
  }
  }).filter((item) => item.tags?.includes('featured'));


data = data.sort((a, b) => new Date(b.date) - new Date(a.date));

fs.writeFileSync('./src/assets/articles/featured.json', JSON.stringify(data));

allArticles = allArticles.concat(data);

fs.writeFileSync('./src/assets/articles/all.json', JSON.stringify(allArticles));

/////////////////////////////////
// get all slides
/////////////////////////////////
dirPath = path.join(__dirname, './src/assets/slides');
files = fs.readdirSync(dirPath);

allArticles = [];

// extract metadata from the '*.Rmd' files and sort by date
data = files
  .filter((file) => file.endsWith('.Rmd'))
  .map((file) => {
  const content = fs.readFileSync(path.join(dirPath, file), 'utf-8');
  const { data } = matter(content);
  console.log('nw file', file);
  console.log(data);
  return {
    ...data,
    filename: path.parse(file).name
  }
  });


data = data.sort((a, b) => new Date(b.date) - new Date(a.date));

fs.writeFileSync('./src/assets/slides/slides.json', JSON.stringify(data));



