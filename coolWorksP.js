const puppeteer = require('puppeteer');
const fs = require('fs');

function removeDuplicates(skills) {
  return [...new Set(skills)];
}

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

(async () => {
  try {
    const jobs = [];
    let JobsScraped = 0;

      let browser = await puppeteer.launch({ slowMo: 250, devtools: true }); // Slow down by 250 ms
      let page = await browser.newPage();
      // goes to the computer search page
      await page.goto('https://www.coolworks.com/search?utf8=%E2%9C%93&search%5Bkeywords%5D=computer&commit=Search');
      //
      // // search technology jobs
      // await page.waitForSelector('input[id="search_keywords"]');
      // // change this text for what you want to search
      // await page.type('input[id=search_keywords]', 'computer');
      // await page.click('div[class="search-submit"]');
    // Go to search internship page
    await page.waitFor(2000);
    // Scrape information
    try {
      let contact;
      let compensation;
      let description;
      let qualifications;
      let url = '';
      let position;
      let company;
      let location;
      let posted;
      let skills = '';
      let lastScraped;

        let jobInfo = await page.evaluate(() => {
          let starting = 'https://www.coolworks.com';
          let section = document.querySelector('.holder');
          let cards = Array.from(section.children);

          let info = cards.map(list => {
            position = list.querySelector('div.top-meta h4');
            company = list.querySelector('div.top-meta h5');
            location = list.querySelector('p[class=locations] a');
            posted = list.querySelector('div[class=link-job] span');
            lastScraped = new Date();
            url = list.getAttribute('href');
            url = starting + url;
            return {position, company, location, posted, lastScraped, url};
          });
          return info;
          console.log(info);
        });


      console.log(url);

      // go to each individual URL
      await page.goto(url);
      await page.waitForNavigation();

        contact = fetchInfo(page,'ul[class=contact-list] li');
      await page.waitFor(3000);

      compensation = fetchInfo(page, 'div[class=benefits]');
      await page.waitFor(3000);

      qualifications = fetchInfo(page, 'div[class=employee_expectations] p');
      await page.waitFor(3000);

      description = fetchInfo(page, 'div[class=employee-experience] p');
      await page.waitFor(3000);

      // skills = page.evaluate(
      //     () => Array.from(
      //         document.querySelectorAll('selector'),
      //         a => a.textContent,
      //     ),
      // );
      // if (skills.length === 0) {
      //   skills = 'N/A';
      // } else {
      //   skills = removeDuplicates(skills);
      // }

      // go back to main page
      await page.goto('https://www.coolworks.com/search?utf8=%E2%9C%93&search%5Bkeywords%5D=computer&commit=Search');
      await page.waitFor(3000);
      //
      // const position = await fetchInfo(page, 'div.top-meta h4');
      // const company = await fetchInfo(page, 'div.top-meta h5');
      // const location = await fetchInfo(page, 'p[class=locations] a');
      // let posted = await fetchInfo(page, 'div[class=link-job] span');
      // if (posted.length === 0) {
      //   posted = 'N/A';
      // }
      // const lastScraped = new Date();

      // push items onto array
      jobs.push ({
        // position: position,
        // company: company,
        // location: location,
        // posted: posted,
        // url: url,
        // lastScraped: lastScraped,
        main: jobInfo,
        description: description,
        compensation: compensation,
        qualifications: qualifications,
        contact: contact,

      });
      JobsScraped++;
    } catch (err) {
      console.log('Error with getting information', err.message);
      await browser.close();
    }

    // write json file
    fs.writeFile('coolworksP.canonical.data.json', JSON.stringify(jobs), function (e) {
      if (e) throw e;
      console.log('Your info has been written into the coolworksP.canonical.data.JSON file');
    });
    console.log('Total Jobs Scraped: ', JobsScraped);
    console.log('Process Completed');
    await browser.close();

  } catch (error) {
    console.log('Something went wrong', error.message);
    await browser.close();
    console.log(error("Browser now closed"));
  }
})();
