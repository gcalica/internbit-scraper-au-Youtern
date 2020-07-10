const puppeteer = require('puppeteer');
const fs = require('fs');

async function writeFile(object) {
  fs.writeFile('./cw.canonical.data.json', JSON.stringify(object, null, 4), 'utf-8', function (error) {
    if (error) {
      throw error;
    }
    console.log('Your info has been written into JSON file');
  });
}

async function getLinks(page) {
  try {
    let links;
    links = await page.evaluate(() => {
      const u = document.querySelectorAll('p[class=job-list-link] a');
      return [].map.call(u, a => a.href);
    });
    return links;
  } catch (error) {
    console.error("getLinks Error", error.message);
  }
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
    console.log('fetchInfo Error: ', error.message);
    result = 'Error';
  }
  return result;
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

      } catch (error) {
        console.error('getAllLinks Error %o \n allLinks: %o', error.message, allLinks);
        console.error(allLinks);
        next = false;
        console.log('\nReached the end of pages!');
      }
    }
    return allLinks;
  } catch (error) {
    console.error("getAllLinks Error: ", error);
  }
}

async function getJobPositionInformation(page, pageLink, jobId) {
  try {
    const position = await fetchInfo(page, `#${jobId} h4[class="job-title"]`);
    const company = await fetchInfo(page, 'div[class="container"] h1');

    // Contact
    const name = await fetchInfo(page, 'li[class="profile"]');
    const phone = await fetchInfo(page, 'li[class="phone"]');
    const email = await fetchInfo(page, 'li[class="mail"]');
    const website = await fetchInfo(page, 'li[class="website"]');
    const contact = {
      employer: name,
      email: email,
      phone: phone,
      website: website,
    }

    const location = await fetchInfo(page, 'dl[class=other-details] dd:nth-child(2)');
    const resp = await fetchInfo(page, 'ul[class=job-list-list] ul:nth-child(5)');
    const compensation = await fetchInfo(page, 'ul[class=job-list-list] ul:nth-child(7)');

    // Qualifications
    const skills = await fetchInfo(page, 'ul[class=job-list-list] ul');
    const qualifications = {
      skills: skills,
      responsibilities: resp,
    };

    const start = await fetchInfo(page, 'dl[class=other-details] dd:nth-child(4)');
    const url = pageLink;
    const lastScraped = new Date();
    const description = await fetchInfo(page, 'ul[class=job-list-list] p');

    return {
      position,
      company,
      contact,
      location,
      // posted,
      // due,
      start,
      // end,
      compensation,
      qualifications,
      url,
      // skills,
      lastScraped,
      description
    }
  } catch (error) {
    console.error('getJobPositionInformation Error: ', error);
  }

}

async function findJobs(page, allLinks) {
  try {
    let jobs = [];
    for (let i = 0; i < allLinks.length; i++) {
      for (let j = 0; j < allLinks[i].length; j++) {
        const pageLink = allLinks[i][j];
        await page.goto(pageLink);
        await page.waitForSelector('dl[class=other-details] dd:nth-child(2)');

        // Open all the Job Description accordions
        const viewJobDescriptionButtons = await page.$$('button[class=view-more]');
        for (const button of viewJobDescriptionButtons) {
          await button.click();
          await page.waitFor(500);
        }

        // Get all the job position "cards"
        const jobPositions = await page.$$('li[class="description-toggler job active"]');
        for (const jobPosition of jobPositions) {
          const id = await (await jobPosition.getProperty('id')).jsonValue();
          jobs.push(getJobPositionInformation(page, pageLink, id));
        }
      }
    }
    return jobs;
  } catch (error) {
    console.error('findJobs Error: ', error);
  }
}

(async () => {
  try {
    let browser = await puppeteer.launch({ headless: false }); // Slow down by 250 ms
    let page = await browser.newPage();
    await page.goto('https://www.coolworks.com/search?utf8=%E2%9C%93&search%5Bkeywords%5D=&employer_types=IT+%2F+Technology&commit=Search&search%5Bfields_to_search%5D=job_title');
    await page.waitForSelector('article[class=employer-post');

    try {
      getAllLinks(page).then((allLinks) => {
        console.log('allLinks ', allLinks);
        findJobs(page, allLinks).then((jobs) => {
          writeFile(jobs);
          console.log('Process Completed');
          browser.close();
        })
      })
    } catch (error) {
      console.error('Sub try ', error);
    }
  } catch (error) {
    console.error("Main try ", error);
  }
})();
