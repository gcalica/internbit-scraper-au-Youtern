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
    await page.waitForSelector('div.left');

      let jobs = await page.evaluate(() => {
        let jobArray;
        // the Nodes for the information I want
        let titleNode = page.$$('div.s-res b');
        let linkNode = page.$$('div.s-res a');
        let locationNode = page.$$('div.search-result-item-company-name a');
        let companyName = page.$$('div[class=search-result-item-company-name]');
        let datePosted = page.$$('span[class=search-result-item-post-date]');
        page.hover('div[class=s-res] b');
        let compensationNode = page.$$('div[class=popup-field] div');

        // let compensationNode = document.querySelectorAll('tbody td:6th-of-type(2)');
        // let startNode = document.querySelectorAll('tbody td:10th-of-type(2)');
        // let qualificationNode = document.querySelectorAll('ul li');
        // let descriptionList = document.querySelectorAll('p[dir=ltr] span');
        // page.waitFor(5000);
        jobArray = [];

        // Scrape the information
        for (let i = 0; i < titleNode.length; i++) {
          jobArray.push({
            position: titleNode[i].innerHTML.trim(),
            url: linkNode[i].getAttribute('href'),
            location: locationNode[i].innerText.trim(),
            company: companyName[i].innerText.trim(),
            posted: datePosted[i].innerText.trim(),
            compensation: compensationNode[i].innerText.trim(),
            // qualifications: qualificationNode[i].innerText.trim(),
            // description: descriptionList[i].innerText.trim(),
          });
        }
        return jobArray;
      });
    // write json file
    fs.writeFile('youtern.canonical.data.json', JSON.stringify(jobs, null, 4), 'utf-8', function (err) {
      if (err) throw err;
      console.log('Your info has been written into JSON file');
    });
    await browser.close();
    console.log('Process Completed');
  } catch (err) {
    console.log('Something went wrong', err.message);
    await browser.close();
    console.log(error("Browser closed"));
  }
})();
