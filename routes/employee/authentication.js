const debug = require('debug')('app:employee:Authentication')

module.exports = function (express, app, db, lib) {
  const router = express.Router()
  const passport = app.get('passport')


  router.get('/', (req, res) => {
    res.send({ message: 'Post credentials to log in' })
  })

  router.post('/forget', (req, res) => {
    const context = 'Forget Password'
    // req.body.host = req.headers.host

    try {
      console.log('inside forget')
      lib.Employee.forgotPassword(req.body)
        .then((valid) => {
          const response = app.responseHandler(false, context)
          response.count = 1
          response.data = 1
          response.message = 'Email has been sent.'
          res.status(response.httpStatus).send(response)
        })
        .catch((error) => {
          const response = app.responseHandler(error, context, 'Unable to reset password')
          res.status(response.httpStatus).send(response)
        })
    } catch (error) {
      // console.log(error)
      const response = app.responseHandler(error, context)
      res.status(response.httpStatus).send(response)
    }
  })

  // router.post('/reset', (req, res) => {
  //   const context = 'Reset Password'

  //   try {
  //     lib.User.resetPassword(req.body)
  //       .then((valid) => {
  //         const response = app.responseHandler(false, context)
  //         response.count = 1
  //         response.data = 1
  //         response.message = 'Password successfully changed.'
  //         res.status(response.httpStatus).send(response)
  //       })
  //       .catch((error) => {
  //         const response = app.responseHandler(error, context, 'Unable to reset password')
  //         res.status(response.httpStatus).send(response)
  //       })
  //   } catch (error) {
  //     const response = app.responseHandler(error, context)
  //     res.status(response.httpStatus).send(response)
  //   }
  // })

  router.post('/token', (req, res, next) => {
    const context = 'Authenticate employee'
    try {
      passport.authenticate('local-employee-login', (error, response) => {
        if (!response) {
          debug('no response given')
          const response = app.responseHandler({ name: 'Unauthenticated' }, context, 'Unable to authenticate employee')
          res.status(response.httpStatus).send(response)
        } else {
          debug('Response came from passport')
          res.status(response.httpStatus).send(response)
        }
      })(req, res, next)
    } catch (error) {
      const response = app.responseHandler(error, context)
      res.status(response.httpStatus).send(response)
    }
  })


  return router
}

