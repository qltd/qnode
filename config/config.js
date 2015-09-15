
/**
 * Module dependencies.
 */

var path = require('path')
  , rootPath = path.normalize(__dirname + '/..')


module.exports = {
  development: {
    db: {
      host: 'localhost',
      name: 'froggy_legs'
    },
    root: rootPath,
  },
  test: {
    db: {
      host: 'localhost',
      name: 'froggy_legs'
    },
    root: rootPath,
  },
  production: {
    db: {
      host: 'localhost',
      name: 'froggy_legs'
    },
    root: rootPath,
  }
}
