const debug = require('debug')('app:Config')

const env = process.env.NODE_ENV || 'Default'
debug(`${env} Config will be loaded`)

module.exports = function () {
  let obj = {}
  switch (process.env.NODE_ENV) {

    case 'local':
      obj = {
        testing: true,
        port: process.env.PORT,
        username: 'root',
        password: '',
        database: 'wholesale',
        host: 'localhost',
        dialect: 'mysql',
        logging: false,
        db: {
          reset: true,
          loadData: true,
          database: 'wholesale',
          user: 'root',
          password: '',
          options: {
            dialect: 'mysql',
            host: 'localhost',
            logging: false,
            decimalNumbers: true,
          },
          sync: true,

        },
        secret: 'trHRWuPAN8h8srwTWQ'
      }

      if (process.env.RESETDATABASE) {
        debug(`RESETING ${obj.db.database} database`)
        obj.db.reset = true
        obj.db.loadData = true
      }

      return obj
    default:
      obj = {
        testing: process.env.TESTING || false,
        port: 3306,
        username: process.env.DB_USER || 'root',
        password: process.env.DB_PASS || '',
        database: 'wholesale',
        host: process.env.HOST || 'localhost',
        dialect: 'mysql',
        db: {
          database: process.env.DB_NAME || 'wholesale',
          user: process.env.DB_USER || 'root',
          password: process.env.DB_PASS || '',
          options: {
            dialect: process.env.DIALECT || 'mysql',
            host: process.env.HOST || 'localhost',
            logging: false,
          },
          sync: false,

        },
        secret: 'trHRWuPAN8h8srwTWQ'
      }
      if (process.env.LOADDATA) {
        debug('Loading data into database')
        obj.db.loadData = true
        obj.db.sync = true
      }

      if (process.env.RESETDATABASE) {
        debug(`RESETING ${obj.db.database} database`)
        obj.db.sync = true
        obj.db.reset = true
        obj.db.loadData = true
      }

      return obj
  }
}
