const debug = require('debug')('app:router-signup')

module.exports = function (express, app, db, lib) {
  const router = express.Router()

  router.get('/', (req, res) => {
    res.send({ message: 'Welcome to Employee SignUp' })
  })

  router.post('/', (req, res) => {
    const context = 'New Employee Sign Up'
    debug('New Employee signing up')
    const options = {}

    try {
      console.log("\nlib.Registration is :\n", lib.Employee)
      lib.Registration.signUp(req.body, options)
        .then((result) => {
          const response = app.responseHandler(false, context)
          response.data = result
          response.message = 'User created. Please verify email.'
          res.status(response.httpStatus).send(response)
        })
        .catch((error) => {
          const response = app.responseHandler(error, context, 'Unable to sign up Employee')
          res.status(response.httpStatus).send(response)
        })
    } catch (error) {
      const response = app.responseHandler(error, context)
      res.status(response.httpStatus).send(response)
    }
  })

  router.post('/force', (req, res) => {
    const context = 'New Customer Sign Up FORCE'
    debug('New Customer signing up')
    const options = {}

    try {
      lib.Registration.signUpForce(req.body, options)
        .then((result) => {
          const response = app.responseHandler(false, context)
          response.data = result
          response.message = 'User was created'
          res.status(response.httpStatus).send(response)
        })
        .catch((error) => {
          const response = app.responseHandler(error, context, 'Unable to sign up customer')
          res.status(response.httpStatus).send(response)
        })
    } catch (error) {
      const response = app.responseHandler(error, context)
      res.status(response.httpStatus).send(response)
    }
  })

  router.post('/verifyEmail', (req, res) => {
    const context = 'Email Verification'

    const options = {}

    try {
      lib.Registration.verifyEmail(req.body, options)
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

  router.post('/resendVerification', (req, res) => {
    const context = 'Email Verification'

    const options = {}

    try {
      lib.Registration.resendVerifyEmail(req.body, options)
        .then((result) => {
          const response = app.responseHandler(false, context)
          response.data = result
          response.message = 'Email has been sent.'
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

  // router.get('/verify', (req, res) => {
  //   if (req.query) {
  //       req.body.token = req.query.token
  //       req.body.email = req.query.email
  //     }
  //   const context = 'Email Verification'

  //   const options = {}

  //   try {
  //     lib.Registration.verifyEmail(req.body, options)
  //       .then((result) => {
  //         const response = app.responseHandler(false, context)
  //         response.data = result
  //         response.message = 'Email was verified'
  //         res.status(response.httpStatus).send(response)
  //       })
  //       .catch((error) => {
  //         const response = app.responseHandler(error, context, 'Unable to verify email.')
  //         res.status(response.httpStatus).send(response)
  //       })
  //   } catch (error) {
  //     const response = app.responseHandler(error, context)
  //     res.status(response.httpStatus).send(response)
  //   }
  // })

  return router
}
