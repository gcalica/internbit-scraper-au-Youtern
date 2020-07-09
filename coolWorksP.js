import _ from 'lodash';
const puppeteer = require('puppeteer');
const fs = require('fs');

async function getLinks(page) {
  try {
    let links;
    links = await page.evaluate(() => {
      const u = document.querySelectorAll('p[class=job-list-link] a');
      return [].map.call(u, a => a.href);
    });
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
  let general = [];
  try {
    for (let i = 0; i < allLinks.length; i++) {
      for (let j = 0; j < allLinks[i].length; j++) {
        const pageLink = allLinks[i][j];
        await page.goto(pageLink);

        await page.waitForSelector('dl[class=other-details] dd:nth-child(2)');

        const handles = await page.$$('button[class=view-more]');
        for (const handle of handles) {
          await handle.click();
          await page.waitFor(2000);
        }

        let node = page.$$('li[class="description-toggler job"]');
        let num = _.reduce(node, function(memo, numb) { return memo + numb });
        console.log("there are ", num, " jobs to be scraped.\n");

        // make a node that points to each li element (cards)
        // loop through the nodes and scrape the info in each card
        for (let k = 0; k < num.length; k++) {
          const position = await fetchInfo(page, 'h4[class=job-title]');
          const company = await fetchInfo(page, 'div[class=container] h1');
          const location = await fetchInfo(page, 'dl[class=other-details] dd:nth-child(2)');
          const start = await fetchInfo(page, 'dl[class=other-details] dd:nth-child(4)');
          const name = await fetchInfo(page, 'li[class=profile]');
          let email = await fetchInfo(page, 'li[class=mail]');
          let website = await fetchInfo(page, 'li[class=website]');
          let phone = await fetchInfo(page, 'li[class=phone]');

          const description = await fetchInfo(page, 'ul[class=job-list-list] p');
          const skills = await fetchInfo(page, 'ul[class=job-list-list] ul');
          const resp = await fetchInfo(page, 'ul[class=job-list-list] ul:nth-child(5)');
          const compensation = await fetchInfo(page, 'ul[class=job-list-list] ul:nth-child(7)');
          const lastScraped = new Date();

          general.push({
            position: position,
            company: company,
            location: location,
            description: description,
            compensation: compensation,
            qualifications: {
              skills: skills,
              responsibilities: resp,
            },
            start: start,
            contact: {
              employer: name,
              email: email,
              phone: phone,
              website: website,
            },
            url: pageLink,
            lastScraped: lastScraped,
          });
        }
        await page.waitFor(4000);
      }
    }
  } catch (e) {
    console.log("Error with getting info off Page: ", e.message);
  }
  return general;
}

async function fetchInfo(page, selector) {
  let result;
  try {
    if ((await page.$(selector)) === null ) {
      result = 'N/A';
    } else {
      await page.waitForSelector(selector);
      result = await page.evaluate((select) => document.querySelector(select).textContent, selector);
    }
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
    let browser = await puppeteer.launch({ headless: false }); // Slow down by 250 ms
    let page = await browser.newPage();
    // let page2 = await browser.newPage();
    await page.goto('https://www.coolworks.com/search?utf8=%E2%9C%93&search%5Bkeywords%5D=&employer_types=IT+%2F+Technology&commit=Search&search%5Bfields_to_search%5D=job_title');
    await page.waitForSelector('article[class=employer-post');

    // Scrape information
    try {
      getAllLinks(page).then((allLinks => {
        console.log(allLinks);
        findJobs(page, allLinks).then((general => {
          write(general);
          // fs.writeFile('./coolworksP.canonical.data.json', JSON.stringify(general, null, 4), 'utf-8', function (err) {
          //   if (err) throw err;
          //   console.log('Your info has been written into JSON file');
          // });
          console.log('Process Completed');
          browser.close();
        }))
      }));
    } catch (errorDetailType) {
      console.log("Error with scraping", errorDetailType.message);
    }
  } catch (e) {
    console.log('Something went wrong', e.message);
  }
})();