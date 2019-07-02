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
  
    const checkers = require('../../middleware/checkCredentials')

    // router.use('/',routes.emailVerification)
    router.use('*', checkers.checkAdminApiKey)
    // router.use('/', routes.main)
    router.use("/organization", routes.organization)
    router.use("/location", routes.location)
    router.use("/category", routes.category)
    
  
    return router
  }
  