const puppeteer = require('puppeteer');
const fs = require('fs');

function removeDuplicates(skills) {
  return [...new Set(skills)];
}

async function getLinks(page) {
  try {
    const links = await page.evaluate(
        () => Array.from(
        document.querySelector('h4 a').getAttribute('href'),
    ),
  );
    return links;
  } catch (errl) {
    console.log("error with get links", errl.message);
  }
}

async function getAllLinks(page) {

  try {
    let next = true;
    const allLinks = [];
    while (next === true) {
      try {
        await page.waitFor(1000);
        getLinks(page).then((links => {
          allLinks.push(links);
        }));
        await page.waitFor(3000);
          const nextPage = await page.$('ul[class=paging] a[rel=next]');
        if (nextPage !== null) {
          await nextPage.click();
        } else {
          next = false;
        }

      } catch (errp) {
        console.log(errp.message);
        console.log(allLinks);
        next = false;
        console.log('\nReached the end of pages!');
      }
    }
    return allLinks;
  }catch (erra) {
    console.log("error with getting allLinks", erra.message);
  }
}

async function findJobs(page, allLinks) {
  const general = [];
  for (let i = 0; i < allLinks.length; i++) {
    for (let j = 0; j < allLinks[i].length; j++) {
      const links = `https://www.coolworks.com${allLinks[i][j]}`;
      await page.goto(links);
      await page.waitForSelector('a[class=more-from]');

      const compensation = fetchInfo(page, 'div[class=benefits] p');
      const qualifications = fetchInfo(page, 'div[class=employee-expectations] ul');


      await page.evaluate(() => {
        document.querySelector('a[class=more-from]').click();
      });
      await page.waitForSelector('ul[class=contact-list] li[class=website]');

      const url = page.url();
      const position = fetchInfo(page, 'h4[class=job-title]');
      const company = fetchInfo(page, 'div[class=container] h1');
      const location = fetchInfo(page, 'div[class=location]');
      const start = fetchInfo(page, 'div[class-section] li');
      const name = fetchInfo(page, 'ul[class=contact-list] li[class=profile]');
      const email = fetchInfo(page, 'ul[class=contact-list] li[class=mail]');
      const website = fetchInfo(page, 'ul[class=contact-list] li[class=website]');

      let phone = fetchInfo(page, 'ul[class=contact-list] li[class=phone]');
      if (phone === null) {
        phone = 'N/A';
      }

      const handles = await page.$$('a[class=more-from]');
      for (const handle of handles)
        await handle.click();

      const description = fetchInfo(page, 'div[class=job-description text show-content] p');

      general.push({
        position: position,
        company: company,
        location: location,
        description: description,
        compensation: compensation,
        qualifications: qualifications,
        start: start,
        contact: {
          employer: name,
          email: email,
          phone: phone,
          website: website,
        },
        url: {
          jobs: url,
          companyProfile: links,
        },
      });
    }
  }
  return general;
}

async function fetchInfo(page, selector) {
  let result;
  try {

    await page.waitForSelector(selector);
    result = await page.evaluate(document.querySelector(selector));
  } catch (error) {
    console.log('Error with fetching info', error.message);
    result = 'Error';
  }
  return result;
}

(async () => {
  try {
      let browser = await puppeteer.launch({ slowMo: 250, devtools: true }); // Slow down by 250 ms
      let page = await browser.newPage();
      await page.goto('https://www.coolworks.com/search?utf8=%E2%9C%93&search%5Bkeywords%5D=&employer_types=IT+%2F+Technology&commit=Search&search%5Bfields_to_search%5D=job_title');
      await page.waitForSelector('article[class=employer-post');

    // Scrape information
    try {
      getAllLinks(page).then((allLinks => {
        console.log(allLinks);
        findJobs(page, allLinks).then((general => {
          fs.writeFile('coolworksP.canonical.data.json', JSON.stringify(general), function (e) {
            if (e) throw e;
            console.log('Your info has been written into the coolworksP.canonical.data.JSON file');
          });
          console.log('Process Completed');
          browser.close();
        }))
      }))
    } catch (errorDetailType) {
      console.log("Error with scraping", errorDetailType.message);
    }
  } catch (e) {
    console.log('Something went wrong', e.message);
  }
})();
