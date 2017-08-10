# Enterprise GitHub Contribution Ranking

Generate a json file with all users of an Enterprise GitHub org ranked by contributions for the past year. You will need to modify the script with your domain, basic auth token, and session cookie.

### Setup

#### Basic Auth Token

```shell
$ echo -n '<username>:<password>' | openssl base64
```

#### Session Cookie

Login to your Enterprise GitHub site and copy the `user_session` cookie.

### Usage

```shell
$ npm start
```

Note: This script can take quite some time to run depending on the number of users your org has.
