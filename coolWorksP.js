const puppeteer = require('puppeteer');
const fs = require('fs');

async function getLinks(page) {
  try {
    let links = await page.evaluate(
        () => Array.from(
            // eslint-disable-next-line no-undef
            document.querySelectorAll('div[class=top-meta] a'),
            a => a.getAttribute('href'),
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
    const elements = [];
    while (next === true) {
      try {
        // eslint-disable-next-line no-await-in-loop
        await page.waitFor(1000);
        getLinks(page).then(links => {
          elements.push(links);
        });
        await page.waitForSelector('ul[class=paging] a[rel=next]');
        const nextPage = await page.$('ul[class=paging] a[rel=next]');
        await nextPage.click();
      } catch (errp) {
        console.log(errp.message);
        console.log(elements);
        next = false;
        console.log('\nReached the end of pages!');
      }
    }
    console.log(elements);
    return elements;
  }catch (erra) {
    console.log("error with getting elements", erra.message);
  }
}

async function getPageInfo(page, elements) {
  try {
    let JobsScraped = 0;
    const details = [];
    for (let i = 0; i < elements.length; i++) {
      for (let j = 0; j < elements[i].length; j++) {
        const url = 'https://www.coolworks.com${elements[i][j]}';

        const company = list.querySelector('div.top-meta h5');
        const location = list.querySelector('p[class=locations] a');
        const posted = list.querySelector('div[class=link-job] span');
        let skills = '';
        skills = page.evaluate(
            () => Array.from(
                document.querySelectorAll('p[class=blurb]')),
        );
        if (skills.length === 0) {
          skills = 'N/A';
        } else {
          skills = removeDuplicates(skills);
        }
        await page.goto(url);
        await page.waitForNavigation();
        const position = fetchInfo(page, 'div[class=ttl-decor fixed-ttl] h1')
        const contact = fetchInfo(page, 'ul[class=contact-list] li');
        const compensation = fetchInfo(page, 'div[class=benefits]');
        const qualifications = fetchInfo(page, 'div[class=employee_expectations] p');
        const description = fetchInfo(page, 'div[class=employee-experience] p');
        const lastScraped = new Date();

        JobsScraped++;

        details.push({
          position: position,
          company: company,
          location: location,
          posted: posted,
          contact: contact,
          compensation: compensation,
          qualifications: qualifications,
          description: description,
          url: url,
          lastScraped: lastScraped,
        });
      }
    }
    console.log('Total Jobs Scraped: ', JobsScraped);
    return details;
  } catch (errp) {
    console.log("error with getting page info", errp.message);
  }
}

async function fetchInfo(page, selector) {
  let result = '';
  try {

    await page.waitForSelector(selector);
    result = await page.evaluate((select) => document.querySelector(select).textContent, selector);
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
      await page.goto('https://www.coolworks.com/');
      // search technology jobs
      await page.waitForSelector('input[id="search_keywords"]');
      // change this text for what you want to search
      await page.type('input[id=search_keywords]', 'computer');
      await page.click('div[class="search-submit"]');
      await page.waitForSelector('article[class=employer-post');

    // Scrape information
    try {
      await getAllLinks(page).then((elements) => {
        getPageInfo(page, elements).then((data) => {
          // write json file
          fs.writeFile('coolworksP.canonical.data.json', JSON.stringify(data), function (e) {
            if (e) throw e;
            console.log('Your info has been written into the coolworksP.canonical.data.JSON file');
          });
          console.log('Process Completed');
        })
      })
    } catch (errs) {
      console.log("Error with scraping", errs.message);
    }

    await browser.close();

  } catch (e) {
    console.log('Something went wrong', e.message);
  }
})();
