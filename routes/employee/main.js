module.exports = function (express, app, db, lib) {
    const router = express.Router()
    const passport = app.get('passport')
  
    router.get('/', (req, res) => {
      res.send({ message: 'Welcome to Employee API! Proceed to POST on / to retrieve a list of employees then POST to /token to authenticate the selected Employee' })
    })
  
    router.post('/', (req, res) => {
      const context = 'Get terminal information'
  
      try {
        lib.Terminal.getStoreEmployee(req.body)
          .then((result) => {
            const response = app.responseHandler(false, context)
            response.count = 1
            response.data = result
            res.status(response.httpStatus).send(response)
          })
          .catch((error) => {
            const response = app.responseHandler(error, context, 'Unable to register terminal')
            res.status(response.httpStatus).send(response)
          })
      } catch (error) {
        const response = app.responseHandler(error, context)
        res.status(response.httpStatus).send(response)
      }
    })
  
    router.post('/token', (req, res, next) => {
      const context = 'Authenticate Employee'
      try {
        passport.authenticate('local-terminal-login', (error, response) => {
          if (!response) {
            const response = app.responseHandler({ name: 'Unauthenticated' }, context, 'Unable to authenticate employee')
            res.status(response.httpStatus).send(response)
          } else {
            res.status(response.httpStatus).send(response)
          }
        })(req, res, next)
      } catch (error) {
        res.status(500).send('Internal Error')
      }
    })
  
    return router
  }
  