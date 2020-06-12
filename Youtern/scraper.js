const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {
  const browser = await puppeteer.launch({slowMo: 250, devtools: true}); // Slow down by 250 ms
  const page = await browser.newPage();
  await page.goto('https://www.youtern.com/');
  // sign in process here
  await page.click('#child-28338 li', '1');

  await page.waitForSelector('div.s-res');

  const jobs = await page.evaluate(() => {
    let jobArray;
    // the Nodes for the information I want
    let titleNode = document.querySelectorAll('h3');
    let locationNode = document.querySelectorAll('a');
    let companyName = document.querySelectorAll('div.search-result-item-company-name');
    let datePosted = document.querySelectorAll('span.search-result-item-post-date');
    let descriptionList = document.querySelectorAll('div.search-result-item-description');
    jobArray = [];
    // Scrape the information ??
    for (let i = 0; i < titleNode.length; i++) {
      jobArray[i] = {
        title: titleNode[i].innerHTML.trim(),
        link: titleNode[i].getAttribute('href'),
        location: locationNode[i].innerText.trim(),
        company: companyName[i].innerText.trim(),
        date: datePosted[i].innerText.trim(),
        description: descriptionList[i].innerText.trim()
      };
    }
    return jobArray;
  });
  await browser.close();
    // write json file
    fs.writeFile('yt.data.json', JSON.stringify(jobs), function (err) {
      if (err) throw err;
      console.log('Your info has been written into JSON file');
    });

  console.log('Process Completed');
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
