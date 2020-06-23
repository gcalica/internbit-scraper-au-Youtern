const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {
  try {
    let browser = await puppeteer.launch({ slowMo: 250, devtools: true }); // Slow down by 250 ms
    let page = await browser.newPage();
    await page.goto('https://www.youtern.com/');
    // sign in process here
    //click sign in button
    await page.waitForSelector('a[class="inline-act forgot-act"]');
    await page.click('a[class="inline-act forgot-act"]');
    await page.waitForSelector('input[id=email]');
    await page.type('input[id=email]', 'ausui@hawaii.edu');
    await page.waitForSelector('input[id=password]');
    await page.type('input[id=password]', 'bball24');
    await page.click('input[name="submit.commonLogin"]');

    // Go to search internship page
    await page.waitFor(2000);
    await page.goto('https://www.youtern.com/cm/candidate/search_jobs');

    await page.waitForSelector('div.flineQbox');
    await page.click('input[id=pngFix]');
    await page.waitForSelector('div[class="s-res"]');

    const jobs = await page.evaluate(() => {
      let jobArray;
      // the Nodes for the information I want
      let titleNode = document.querySelectorAll('div.s-res b');
      let linkNode = document.querySelectorAll('div.s-res a');
      let locationNode = document.querySelectorAll('div.search-result-item-company-name a');
      let companyName = document.querySelectorAll('div[class=search-result-item-company-name]');
      let datePosted = document.querySelectorAll('span[class=search-result-item-post-date]');
      let descriptionList = document.querySelectorAll('div[class=search-result-item-description]');
      jobArray = [];
      // Scrape the information ??
      for (let i = 0; i < titleNode.length; i++) {
        jobArray[i] = {
          position: titleNode[i].innerHTML.trim(),
          URL: linkNode[i].getAttribute('href'),
          location: locationNode[i].innerText.trim(),
          company: companyName[i].innerText.trim(),
          postDate: datePosted[i].innerText.trim(),
          description: descriptionList[i].innerText.trim()
        };
      }
      return jobArray;
    });
    await browser.close();
    // write json file
    fs.writeFile('youtern.canonical.data.json', JSON.stringify(jobs), function (err) {
      if (err) throw err;
      console.log('Your info has been written into JSON file');
    });

    console.log('Process Completed');
  } catch (err) {
    console.log(err);
    await browser.close();
    console.log(error("Browser closed"));
  }
})();
