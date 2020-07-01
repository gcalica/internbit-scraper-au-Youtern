const puppeteer = require('puppeteer');
const fs = require('fs');

function removeDuplicates(skills) {
  return [...new Set(skills)];
}

async function getLinks(page) {
  const links = await page.evaluate(
      () => {
        return Array.from(
            // eslint-disable-next-line no-undef
            document.querySelectorAll('div[class=top-meta] a'),
            a => a.getAttribute('href'),
        );
      },
  );
  return links;
}

async function goIntoLink(page) {
  let details = [];
  let start;
  let contact;
  let compensation;
  let qualifications;
  let description;

  await page.click('div[class=top-meta] a');

  start = await fetchInfo(page, 'dl[class=other-details] dd');
  if (start.length === 0) {
    start = 'N/A';
  }
  contact = await fetchInfo(page, 'ul[class=contact-list] li[class=mail]');
  if (contact.length === 0) {
    contact = await fetchInfo(page, 'ul[class=contact-list] li[class=phone]');
    if (contact.length === 0) {
      contact = 'N/A';
    }
  }
  compensation = await fetchInfo(page, 'div[class=benefits]');
  if (compensation.length === 0) {
    compensation = 'N/A';
  }
  qualifications = await fetchInfo(page, 'div[class=employee_expectations] p');
  if (qualifications.length === 0) {
    qualifications = 'N/A';
  }
  description = await fetchInfo(page, 'div[class=employee-experience] p');
  if (description.length === 0) {
    description = await fetchInfo(page, 'div[class=general_description] p');
    if (description.length === 0) {
      description = 'N/A';
    }
  }

  details.push({
    start: start,
    contact: contact,
    compensation: compensation,
    qualifications: qualifications,
    description: description
  });
  await page.goBack();
  return details;
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

    try {
      let browser = await puppeteer.launch({ slowMo: 250, devtools: true }); // Slow down by 250 ms
      let page = await browser.newPage();
      await page.goto('https://www.coolworks.com/find-a-job');

      // search technology jobs
      await page.waitForSelector('input[id="search_keywords"]');
      // change this text for what you want to search
      await page.type('input[id=search_keywords]', 'computer');
      await page.click('div[class="search-submit"]');
    } catch (errb) {
      console.log('Error with browser', errb.message);
    }
    // Go to search internship page
    await page.waitFor(3000);
    // Scrape information
    try {
      const url = await getLinks(page);
      // let start;
      // let contact;
      // let compensation;
      // let qualifications;
      // let description;
      const details = await goIntoLink(page, url);
        // if (url != null) {
        //   await page.click('div[class=top-meta] a');
        //
        //   start = await fetchInfo(page, 'dl[class=other-details] dd');
        //   if (start.length === 0) {
        //     start = 'N/A';
        //   }
        //   contact = await fetchInfo(page, 'ul[class=contact-list] li[class=mail]');
        //   if (contact.length === 0) {
        //     contact = await fetchInfo(page, 'ul[class=contact-list] li[class=phone]');
        //     if (contact.length === 0) {
        //       contact = 'N/A';
        //     }
        //   }
        //   compensation = await fetchInfo(page, 'div[class=benefits]');
        //   if (compensation.length === 0) {
        //     compensation = 'N/A';
        //   }
        //   qualifications = await fetchInfo(page, 'div[class=employee_expectations] p');
        //   if (qualifications.length === 0) {
        //     qualifications = 'N/A';
        //   }
        //   description = await fetchInfo(page, 'div[class=employee-experience] p');
        //   if (description.length === 0) {
        //     description = await fetchInfo(page, 'div[class=general_description] p');
        //     if (description.length === 0) {
        //       description = 'N/A';
        //     }
        //   }
        //
        //   await page.close();
        // }

      const position = await fetchInfo(page, 'div.top-meta h4');
      const company = await fetchInfo(page, 'div.top-meta h5');
      const location = await fetchInfo(page, 'p[class=locations] a');
      let posted = await fetchInfo(page, 'div[class=link-job] span');
      if (posted.length === 0) {
        posted = 'N/A';
      }
      const lastScraped = new Date();

      let skills = '';
      try {
        skills = await page.evaluate(
            () => Array.from(
              document.querySelectorAll('selector'),
              a => a.textContent,
            ),
        );
        if (skills.length === 0) {
          skills = 'N/A';
        } else {
          skills = removeDuplicates(skills);
        }
      } catch (errs) {
        console.log('Error with finding skills', errs.message);
      }

      // push items onto JSON file
      jobs.push ({
        position: position,
        company: company,
        // contact: contact,
        location: location,
        posted: posted,
        // compensation: compensation,
        // qualifications: qualifications,
        url: url,
        lastScraped: lastScraped,
        details: details,
        // description: description,
      });
      JobsScraped++;
    } catch (err) {
      console.log('Error with getting information', err.message);
      await browser.close();
    }
    // const jobs = await page.evaluate(() => {
    //   let jobArray;
    //   // the Nodes for the information I want
    //   let titleNode = document.querySelectorAll('div.s-res b');
    //   let linkNode = document.querySelectorAll('div.s-res a');
    //   let locationNode = document.querySelectorAll('div.search-result-item-company-name a');
    //   let companyName = document.querySelectorAll('div[class=search-result-item-company-name]');
    //   let datePosted = document.querySelectorAll('span[class=search-result-item-post-date]');
    //   let descriptionList = document.querySelectorAll('div[class=search-result-item-description]');
    //   jobArray = [];
    //   // Scrape the information ??
    //   for (let i = 0; i < titleNode.length; i++) {
    //     jobArray.push({
    //       position: titleNode[i].innerHTML.trim(),
    //       url: linkNode[i].getAttribute('href'),
    //       location: locationNode[i].innerText.trim(),
    //       company: companyName[i].innerText.trim(),
    //       posted: datePosted[i].innerText.trim(),
    //       description: descriptionList[i].innerText.trim()
    //     });
    //   }
    //   return jobArray;
    // });

    // write json file
    fs.writeFile('coolworks.canonical.data.json', JSON.stringify(jobs), function (e) {
      if (e) throw e;
      console.log('Your info has been written into the coolworks.canonical.data.JSON file');
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
