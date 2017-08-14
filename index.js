require('isomorphic-fetch');
const jsonfile = require('jsonfile');

const GITHUB_DOMAIN = '<YOUR DOMAIN>';

/**
 * Generate using: $ echo -n '<username>:<password>' | openssl base64
 */
const BASIC_AUTH = '<YOUR BASIC AUTH TOKEN>';

/**
 * Login to your Enterprise GitHub site and copy the `user_session` cookie below.
 */
const USER_SESSION = '<YOUR SESSION COOKIE>';

/**
 * For older versions of GitHub use the regex /class="contrib-number">(.*) total/
 */
const PROFILE_REGEX = /\s([,\d]+) contribution/;

const OUTPUT_FILE = './contribs.json';
const TROTTLE = 100;

const config = {
  headers: {
    Authorization: `Basic ${BASIC_AUTH}`,
    Cookie: `user_session=${USER_SESSION}`
  }
};

let users = [];

const get = (url, json = true) => fetch(`https://${GITHUB_DOMAIN}${url}`, config)
  .then((response) => json ? response.json() : response.text())
  .catch((ex) => {
    console.log('parsing failed', ex);
  });

const wait = () => new Promise((resolve) => setTimeout(resolve, TROTTLE));

const getPage = (id) => {
  console.log(`fetching page ${id}`);
  return get(`/api/v3/users?since=${id}`)
    .then((response) => {
      [].push.apply(users, response.filter((user) => user.type === 'User')
        .map((user) => ({ id: user.login }))
      );
      if (response.length) {
        return wait().then(() => getPage(response.pop().id));
      }
    });
};

const getUser = (index) => {
  const user = users[index];
  return get(`/${user.id}`, false)
    .then((html) => {
      user.contribs = parseInt(html.match(PROFILE_REGEX)[1].replace(/,/g, ''));
      user.name = html.match(/itemprop="name">(.*)<\/span>/)[1];
      console.log(index, user);
      index++;
      if (index < users.length) {
        return wait().then(() => getUser(index));
      }
    });
};

getPage(1).then(() => {
  console.log(`Found ${users.length} users`);
  getUser(0).then(() => {
    users = users.sort((a, b) => (a.contribs || 0) - (b.contribs || 0));
    jsonfile.writeFile(OUTPUT_FILE, { users }, (err) => console.log(err || "Done"));
  });
});
