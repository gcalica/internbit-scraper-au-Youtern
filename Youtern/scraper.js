const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({slowMo: 250, devtools: true}); // Slow down by 250 ms
  const page = await browser.newPage();
  await page.goto('https://www.youtern.com/');

  page.on('console', msg => console.log('PAGE LOG', msg.text()));
// insert login proxy here
  await page.click('#child-28338 li');
  await page.evaluate(() => console.log('url is ${location.href}'));
  await page.json('youtern.data.json');  // node youtern.data.json

  console.log('Job title:');
  console.log('Job location:');
  console.log('Job description:');

  await browser.close();
})();
// learn how to work page.click
// find how to do the proxy user and password login
// code together with jenny to figure out puppeteer
// learn how to scrape the information off
