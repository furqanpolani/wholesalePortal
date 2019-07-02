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
    router.use('*', checkers.checkApiKey)
    router.use('/', routes.main)
    router.use('/signup', routes.signup)
    // Public
    router.use('/auth', routes.authentication)
    router.use('*', checkers.checkEmployee)
    router.use('/subCategory', routes.subCategory)
    router.use('/employee', routes.employee)
    router.use('/product', routes.product)
    router.use('/vendor', routes.vendor)
    router.use('/purchase', routes.purchase)
    router.use('/customer', routes.customer)
    router.use('/invoice', routes.invoice)
    router.use('/organization', routes.organization)
    router.use('/location', routes.location)
    
    
    
    // router.use('/', routes.login)
  
  
    return router
  }
  