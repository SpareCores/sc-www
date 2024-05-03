const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');

// list all items in the directory and generate a json file to be used in the app
const dirPath = path.join(__dirname, './src/assets/articles/featured');
const files = fs.readdirSync(dirPath);

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
