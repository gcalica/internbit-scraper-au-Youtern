
const puppeteer = require('puppeteer');
const fs = require('fs');

async function fetchInfo(page, selector) {
  let result = '';
  try {

    await page.waitForSelector(selector);
    result = await page.evaluate((select) => document.querySelector(select).textContent, selector);
  } catch (error) {
    console.log('Our Error: fetchInfo() failed.\n', error.message);
    result = 'Error';
  }
  return result;
}

async function write(obj) {
  fs.writeFile('./coolworksP.canonical.data.json', JSON.stringify(obj, null, 4), 'utf-8', function (err) {
    if (err) throw err;
    console.log('Your info has been written into JSON file');
  });
}

(async () => {
  try {
    const browser = await puppeteer.launch({ headless: false, devtools: true }); // Slow down by 250 ms
    const page = await browser.newPage();


  } catch (e) {
    console.log("Error with main function: ", e.message);
  }
})();