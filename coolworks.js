const Xray = require('x-ray');

const x = Xray();
// look up paginate
x('https://www.coolworks.com/search?utf8=%E2%9C%93&search%5Bkeywords%5D=&commit=Search&search%5Bfields_to_search%5D=job_title', {
  jobs: x('.job-post-row', [{
    info: x('.holder', [{
      datePosted: '.time',
      description: x('.text', 'p'),
      main: x('.top-meta', [{
        position: 'h4',
        URL: 'a@href',
        company: 'h5',
        location: '.location',
      }]),
    }]),
  }]),
  jobs2: x('.profiles-row', [{
    info: x('.holder', [{
      description: x('.text', '.blurb'),
      main: x('.top-meta', [{
        position: 'h4',
        URL: 'a@href',
        company: '.ttl',
        location: '.location',
      }]),
    }]),
  }]),
})(function (err, obj) {
  // eslint-disable-next-line no-console
  console.log(err, obj);
}).paginate('.paging a@href')
    .write('CoolWorks.canonical.data.json');