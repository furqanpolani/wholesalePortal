module.exports = function (express, app, db, lib) {
    const router = express.Router()
  
    router.post('/', (req, res) => {
        const context = 'Create Api User'
    
        try {
          lib.ApiUser.create(req.body)
            .then((result) => {
              const response = app.responseHandler(false, context)
              response.count = 1
              response.data = result
              res.status(response.httpStatus).send(response)
            })
            .catch((error) => {
              const response = app.responseHandler(error, context, 'Unable to create API user')
              res.status(response.httpStatus).send(response)
            })
        } catch (error) {
          const response = app.responseHandler(error, context)
          res.status(response.httpStatus).send(response)
        }
    })

    router.post('/cspapi', (req, res) => {
      const context = 'Create CSP Api'
  
      try {
        lib.ApiUser.createCSPApiUser(req.body)
          .then((result) => {
            const response = app.responseHandler(false, context)
            response.count = 1
            response.data = result
            res.status(response.httpStatus).send(response)
          })
          .catch((error) => {
            const response = app.responseHandler(error, context, 'Unable to create API user')
            res.status(response.httpStatus).send(response)
          })
      } catch (error) {
        const response = app.responseHandler(error, context)
        res.status(response.httpStatus).send(response)
      }
  })
  
    return router
  }
  