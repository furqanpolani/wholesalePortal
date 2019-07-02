const tools = require('../helperFunctions/tools')
const debug = require('debug')('app:Transactions')

module.exports = function (db, lib) {
  /**
   * Adds a sequelize transactions to the passed in options unless one already exisit
   * @param {*} opts
   * returns Promise({transaction:Sequelize.transaction})
   */
  function transaction(opts, creator) {
    return new Promise((resolve, reject) => { // eslint-disable-line
      if (!creator) reject(new Error('Transaction creator is required always'))
      // if transaction reference provided in options object
      if (opts && opts.transaction) {
        // use it
        debug(`${opts.transaction.id} Found, status: ${opts.transaction.finished}`)
        resolve(opts)
      } else if (opts && !opts.transaction) {
        // start one, added it to the provided options object
        return db.sequelize.transaction()
          .then((t) => {
            debug(`${t.id} Created`)
            opts.transaction = t
            opts.creator = creator
            resolve(opts)
          })
          .catch((error) => {
            reject(error)
          })
      } else {
        // start one, create options object
        return db.sequelize.transaction()
          .then((t) => {
            debug(`${t.id} Created`)
            resolve({ transaction: t, creator })
          })
          .catch((error) => {
            reject(error)
          })
      }
    })
  }

  function commit(options, serial, force) {
    if (!options) return false
    debug(`${options.transaction.id} trying commit, status: ${options.transaction.finished}`)
    switch (options.transaction.finished) {
      case 'commit':
        debug(`${options.transaction.id} already commited, can't again`)
        return new Error('Transaction Error')
      case 'rollback':
        debug(`${options.transaction.id} already commited, can't rollback`)
        return new Error('Transaction Error')
      default:
        if (options.creator === serial || force) {
          debug(`${options.transaction.id} commited, force:${force}`)
          options.transaction.commit()
        }
        // Transaction is left open since creator is responsible for commiting
    }
    return true
  }

  function rollback(options, serial, force) {
    if (!options) return false
    debug(`${options.transaction.id} trying rollback, status: ${options.transaction.finished}`)
    switch (options.transaction.finished) {
      case 'commit':
        debug(`${options.transaction.id} already commited`)
        return new Error('Transaction Error')
      case 'rollback':
        debug(`${options.transaction.id} already rolled back. Nothing happened`)
        // Do nothing since rollback already in motion
        return true
      default:
        if (serial === null || options.creator === serial || force) {
          debug(`${options.transaction.id} rolled back`)
          options.transaction.rollback()
        }
        return true
    }
  }

  function serial() {
    return tools.randomString(8)
  }

  function mysqlEscapeString(str) {
    return str.replace(/[\0\x08\x09\x1a\n\r"'\\\%]/g, (char) => {
      switch (char) {
        case '\0':
          return '\\0'
        case '\x08':
          return '\\b'
        case '\x09':
          return '\\t'
        case '\x1a':
          return '\\z'
        case '\n':
          return '\\n'
        case '\r':
          return '\\r'
        case '"':
        case "'":
        case '\\':
        case '%':
          return `\\${char}` // prepends a backslash to backslash, percent,
        default: // and double/single quotes
          // Do nothing
          throw Error("Can't escape")
      }
    })
  }

  return {
    transaction,
    mysqlEscapeString,
    commit,
    serial,
    rollback,
  }
}