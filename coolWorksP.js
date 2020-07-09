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
  let jobsScraped = 0;
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

        // make a node that points to each li element (cards)
        let node = await page.$$('li[class="description-toggler job"]');

        //
        // // grabs all the positions
        // const position = await page.evaluate(
        //     () => Array.from(
        //         // eslint-disable-next-line no-undef
        //         document.querySelectorAll('h4[class=job-title]'),
        //         a => a.textContent,
        //     ),
        // );
        //
        // // grabs all the location
        // const location = await page.evaluate(
        //     () => Array.from(
        //         // eslint-disable-next-line no-undef
        //         document.querySelectorAll('div[class=location]'),
        //         a => a.textContent,
        //     ),
        // );
        //
        // // grabs all the description
        // const description = await page.evaluate(
        //     () => Array.from(
        //         // eslint-disable-next-line no-undef
        //         document.querySelectorAll('ul[class=job-list-list] p'),
        //         a => a.textContent,
        //     ),
        // );

        //
        // // below needs array of multiple
        // const company = await page.evaluate(
        //     () => Array.from(
        //         // eslint-disable-next-line no-undef
        //         document.querySelectorAll('div[class=container] h1'),
        //         a => a.textContent,
        //     ),
        // );
        //
        // const start = await page.evaluate(
        //     () => Array.from(
        //         // eslint-disable-next-line no-undef
        //         document.querySelectorAll('dl[class=other-details] dd:nth-child(4)'),
        //         a => a.textContent,
        //     ),
        // );
        //
        // const name = await page.evaluate(
        //     () => Array.from(
        //         // eslint-disable-next-line no-undef
        //         document.querySelectorAll('li[class=profile]'),
        //         a => a.textContent,
        //     ),
        // );
        //
        // const email = await page.evaluate(
        //     () => Array.from(
        //         // eslint-disable-next-line no-undef
        //         document.querySelectorAll('li[class=mail]'),
        //         a => a.textContent,
        //     ),
        // );
        //
        // const website = await page.evaluate(
        //     () => Array.from(
        //         // eslint-disable-next-line no-undef
        //         document.querySelectorAll('li[class=website]'),
        //         a => a.textContent,
        //     ),
        // );
        //
        // let comp = clone(company, node);
        // let strt = clone(start, node);
        // let nme = clone(name, node);
        // let mail = clone(email, node);
        // let web = clone(website, node);

        const skills = await fetchInfo(page, 'ul[class=job-list-list] ul');
        const resp = await fetchInfo(page, 'ul[class=job-list-list] ul:nth-child(5)');
        const compensation = await fetchInfo(page, 'ul[class=job-list-list] ul:nth-child(7)');
        const position = await fetchInfo(page, 'h4[class=job-title]');
        const location = await fetchInfo(page, 'dl[class=other-details] dd:nth-child(2)');
        const description = await fetchInfo(page, 'ul[class=job-list-list] p');
        const company = await fetchInfo(page, 'div[class=container] h1');
        const start = await fetchInfo(page, 'dl[class=other-details] dd:nth-child(4)');
        const name = await fetchInfo(page, 'li[class=profile]');
        let email = await fetchInfo(page, 'li[class=mail]');
        let website = await fetchInfo(page, 'li[class=website]');
        const lastScraped = new Date();
        let phone = await fetchInfo(page, 'li[class=phone]');

        // loop through the number of nodes
        // for (let i = 0; i < node.length; i++) {

          general.push({
            position: position,
            location: location,
            description: description,
            compensation: compensation,
            qualifications: {
              skills: skills,
              responsibilities: resp,
            },
            company: company,
            start: start,
            contact: {
              employer: name,
              email: email,
              phone: phone,
              website: website,
            },
            url: pageLink,
            lastScraped: new Date(),
          });
        // }

            jobsScraped++;
        await page.waitFor(4000);
        console.log("position", position);
        console.log("location:", location);
        console.log("Description:", description);
        console.log("company:", company);
        console.log("name:", name);
        console.log("email:", email);
        console.log("last scraped:", lastScraped);
      }
    }
  } catch (e) {
    console.log("Error with getting info off Page: ", e.message);
  }
  console.log("Total number of jobs scraped: " + jobsScraped);
  console.log(general);
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