check-npm-package-licenses
==========================

[![npm version](https://img.shields.io/npm/v/check-npm-package-licenses.svg)](https://www.npmjs.com/package/check-npm-package-licenses)
[![license](https://img.shields.io/badge/license-Apache--2.0-303284.svg)](http://www.apache.org/licenses/LICENSE-2.0)
[![build status](https://img.shields.io/travis/jslicense/check-npm-package-licenses.js.svg)](http://travis-ci.org/jslicense/check-npm-package-licenses.js)

Check the license metadata of a package and its dependencies.

<!-- js
  // The examples below are run as tests.
  var check = require('./');
-->

```js
check('mocha', '2.2.5', function(error, problems) {
  problems.some(function(problem) {
    return problem.message === 'Package commander@2.3.0 has no license metadata.';
  }); // => true
});
```

You can do the same from the command line with `check-npm-package-licenses mocha 2.2.5`.
