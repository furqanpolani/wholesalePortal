const debug = require('debug')('app:Employee:Authentication')

module.exports = function (express, app, db, lib) {
  const router = express.Router()
//   const passport = app.get('passport')



  router.post('/resetPassword', (req, res) => {
    const context = 'Reset Password'

    try {
      lib.Employee.resetPassword(req.body)
        .then((valid) => {
          const response = app.responseHandler(false, context)
          response.count = 1
          response.data = 1
          response.message = 'Password successfully changed.'
          res.status(response.httpStatus).send(response)
        })
        .catch((error) => {
          const response = app.responseHandler(error, context, 'Unable to reset password')
          res.status(response.httpStatus).send(response)
        })
    } catch (error) {
      const response = app.responseHandler(error, context)
      res.status(response.httpStatus).send(response)
    }
  })

  router.get('/verify', (req, res) => {
    if (req.query) {
        req.body.token = req.query.token
        req.body.email = req.query.email
    }
    const context = 'Email Verification'

    const options = {}

    try {
      lib.Employee.Registration.verifyEmail(req.body, options)
        .then((result) => {
          const response = app.responseHandler(false, context)
          response.data = result
          response.message = 'Email was verified'
          res.status(response.httpStatus).send(response)
        })
        .catch((error) => {
          const response = app.responseHandler(error, context, 'Unable to verify email.')
          res.status(response.httpStatus).send(response)
        })
    } catch (error) {
      const response = app.responseHandler(error, context)
      res.status(response.httpStatus).send(response)
    }
  })

  return router
}

