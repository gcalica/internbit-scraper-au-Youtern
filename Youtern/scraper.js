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
    await page.goto('https://www.youtern.com/cm/candidate/search_jobs');

    await page.waitForSelector('div.flineQbox');
    await page.click('input[id=pngFix]');
    await page.waitForSelector('div[class="popup-cent"]');

    const jobs = await page.evaluate(() => {
      let jobArray;
      // the Nodes for the information I want
      let titleNode = document.querySelectorAll('b');
      let linkNode = document.querySelectorAll('a@href');
      let locationNode = document.querySelectorAll('a');
      let companyName = document.querySelectorAll('div[class=search-result-item-company-name]');
      let datePosted = document.querySelectorAll('span[class=search-result-item-post-date]');
      let descriptionList = document.querySelectorAll('div[class=search-result-item-description]');
      jobArray = [];
      // Scrape the information ??
      for (let i = 0; i < titleNode.length; i++) {
        jobArray[i] = {
          title: titleNode[i].innerHTML.trim(),
          link: linkNode[i].getAttribute('href'),
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
  } catch (err) {
    console.log(err);
    await browser.close();
    console.log(error("Browser closed"));
  }
})();
// can page.focus be used to focus on the buttons or the information I want to scrape?
// learn how to work page.click
// find how to do the proxy user and password login --> await page.authenticate ({username: 'joel', password: 'browserless-rocks',})
    // await page.setExtraHTTPHeaders ({'Proxy-Authorization': 'Basic username:passwrod', OR Authorization: 'Basic username:password',})
// code together with jenny to figure out puppeteer
// does line 12 write to a json file?
// how to test it with node in command

// 1- click on sign in button --> in div class .login, a class .inline-act forgot-act, in img src='/imglib/sign_in.gif'
// 2- use proxy to enter user and password --> INPUT U: class='txt' id='email', P: id='password'
// 3- click on sign in
// 4- click on search internships button
// 5- click on search button on right column
// 6- evaluate the internships
