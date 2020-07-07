const Xray = require('x-ray');


function getLinks(page) {
  try {
    const links = page.evaluate(
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

function getAllLinks(page) {

  try {
    let next = true;
    const allLinks = [];
    while (next === true) {
      try {
         page.waitFor(1000);
        getLinks(page).then((links => {
          allLinks.push(links);
        }));
         page.waitFor(3000);
        const nextPage =  page.$('ul[class=paging] a[rel=next]');
        if (nextPage !== null) {
           nextPage.click();
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

const x = Xray();
x('https://www.coolworks.com/search?utf8=%E2%9C%93&search%5Bkeywords%5D=computer&commit=Search', {
  jobs: x('.job-post-row', [{
    info: x('.holder', [{
      posted: '.time',
      main: x('.top-meta', [{
        position: 'h4',
        url: 'a@href',
        company: 'h5',
        location: '.location',
      }]),
    }]),
  }]),
})(function (err, obj) {
  // eslint-disable-next-line no-console
  console.log(err, obj);
}).paginate('.paging a@href')
    .write('CoolWorks.canonical.data.json');

