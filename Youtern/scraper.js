const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({slowMo: 250, devtools: true}); // Slow down by 250 ms
  const page = await browser.newPage();
  await page.goto('https://www.youtern.com/');
  await page.waitForSelector('div.s-res');

  const jobs = await page.evaluate(() => {
    let jobArray;
    let titleNode = document.querySelectorAll('h3');
    let location = document.querySelectorAll('a');
    let company = document.querySelectorAll('div.search-result-item-company-name');
    let datePosted = document.querySelectorAll('span.search-result-item-post-date');
    let description = document.querySelectorAll('div.search-result-item-description');
    jobArray = [];
    // Scrape the information ??
    for (let i = 0; i < titleNode.length; i++) {
      jobArray[i] = {
        title: titleNode[i].innerHTML.trim(),
        link: titleNode[i].getAttribute('href'),
        location: location[i].innerText.trim(),
        company: company[i].innerText.trim(),
        datePosted: datePosted[i].innerText.trim(),
        description: description[i].innerText.trim()
      };
    }
    return jobArray;
  });
// insert login proxy here
  await page.click('#child-28338 li', '1');
  await page.evaluate(() => console.log('url is ${location.href}'));
  await page.json('youtern.data.json');  // node youtern.data.json


  console.log('Job title:');
  console.log('Job location:');
  console.log('Job description:');

  await browser.close();
})();
// can page.focus be used to focus on the buttons or the information I want to scrape?
// learn how to work page.click
// find how to do the proxy user and password login --> await page.authenticate ({username: 'joel', password: 'browserless-rocks',})
    // await page.setExtraHTTPHeaders ({'Proxy-Authorization': 'Basic username:passwrod', OR Authorization: 'Basic username:password',})
// code together with jenny to figure out puppeteer
// does line 12 write to a json file?
// how to test it with node in command

// 1- click on sign in button --> in div class .login, a class .inline-act forgot-act, in img src='/imglib/sign_in.gif'
// 2- use proxy to enter user and password
// 3- click on sign in
// 4- click on search internships button
// 5- fill out internship search choices OR go type keyword into quick search and location
// 6- click search button
