
/**
 * Module dependencies.
 */

var path = require('path')
  , rootPath = path.normalize(__dirname + '/..')

module.exports = {
  development: {
    db: {
      host: 'localhost',
      name: 'qnode_db_dev'
    },
    root: rootPath
  },
  production: {
    db: {
      host: 'localhost',
      name: 'qnode_db'
    },
    root: rootPath
  }
}
