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

async function getLink(page, url) {
  await page.goto(url);
  await page.waitForNavigation();
  let details = await page.evaluate(() => {
    let contact = fetchInfo(page,'ul[class=contact-list] li');
    let compensation = fetchInfo(page, 'div[class=benefits]');
    let qualifications = fetchInfo(page, 'div[class=employee_expectations] p');
    let description = fetchInfo(page, 'div[class=employee-experience] p');

    return {contact, compensation, description, qualifications};
  });
return details;
}

async function addBase(url) {
  let Base = 'https://www.coolworks.com';
  let link = Base + url;
  return link;
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
      // let skills = '';
      let lastScraped;
      let starting = 'https://www.coolworks.com';

        let jobInfo = await page.evaluate(() => {
          let section = document.querySelector('.holder');
          let cards = Array.from(section.children);

          let info = cards.map(list => {
            position = list.querySelector('div.top-meta h4');
            company = list.querySelector('div.top-meta h5');
            location = list.querySelector('p[class=locations] a');
            posted = list.querySelector('div[class=link-job] span');
            lastScraped = new Date();
            url = list.getAttribute('href');
            return {position, company, location, posted, lastScraped, url};
          });
          return info;
        });


        for (let job of jobInfo) {
          let link = await addBase(jobInfo["url"]);
          let other = await getLink(page, link);
          jobInfo["extra"] = other;
          jobInfo["url"] = link;

          jobs.push ({
            // position: position,
            // company: company,
            // location: location,
            // posted: posted,
            // url: url,
            // lastScraped: lastScraped,
            main: jobInfo,
            // description: description,
            // compensation: compensation,
            // qualifications: qualifications,
            // contact: contact,

          });        }

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


      // const position = await fetchInfo(page, 'div.top-meta h4');
      // const company = await fetchInfo(page, 'div.top-meta h5');
      // const location = await fetchInfo(page, 'p[class=locations] a');
      // let posted = await fetchInfo(page, 'div[class=link-job] span');
      // if (posted.length === 0) {
      //   posted = 'N/A';
      // }
      // const lastScraped = new Date();

      // push items onto array
      // jobs.push ({
      //   // position: position,
      //   // company: company,
      //   // location: location,
      //   // posted: posted,
      //   // url: url,
      //   // lastScraped: lastScraped,
      //   main: jobInfo,
      //   description: description,
      //   compensation: compensation,
      //   qualifications: qualifications,
      //   contact: contact,
      //
      // });
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
