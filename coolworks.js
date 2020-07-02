const Xray = require('x-ray');

let website;
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
        description: x()
      }]),
    }]),
  }]),
})(function (err, obj) {
  // eslint-disable-next-line no-console
  console.log(err, obj);
}).paginate('.paging a@href')
    .write('CoolWorks.canonical.data.json');

