module.exports = function (express, app, db, lib) {
    const router = express.Router()
  
    const routes = {}
    const fs = require('fs')
  
    fs
      .readdirSync(__dirname)
      .filter(file => (file.indexOf('.') !== 0) && (file !== 'index.js'))
      .forEach((file) => {
        const cd = file.replace('.js', '')
        routes[cd] = require(`./${file}`)(express, app, db, lib)
      })
  
    // IT Should not be public need to check credentials
    // Public
    router.use('/', routes.apiUser)
    
  
    return router
  }
  