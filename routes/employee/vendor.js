module.exports = function (express, app, db, lib) {
    const router = express.Router()

    router.get('/', (req, res) =>{
      const context = "Get All Vendor By Employee"
      const options = {}
      if (req.query) {
        options.search = req.query.search
        options.offset = req.query.offset
        options.limit = req.query.limit
        options.name = req.query.name
      }
      try{
        lib.Vendor.getAll(req.body, options)
         .then(result =>{
          const response = app.responseHandler(false, context)
          response.count = result.count
          response.data = result.rows
          res.status(response.httpStatus).send(response)
         }).catch(error =>{
           const response = app.responseHandler(error, context)
           res.status(response.httpStatus).send(response)
         })
      } catch(error ) {
        const response = app.responseHandler(error,context)
        res.status(response.httpStatus).send(response)
      }
    })

    router.post('/', (req, res) =>{
        const context = "Create Vendor"
        const options = {}
        try {
            lib.Vendor.create(req.body, options)
            .then(result =>{
                const response = app.responseHandler(false, context)
                response.count = 1
                response.data = result
                res.status(response.httpStatus).send(response)
            }).catch(error =>{
                const response = app.responseHandler(error, context, "Unable to Create Categroy")
                res.status(response.httpStatus).send(response)
            })
        } catch (error) {
            const response = app.responseHandler(error, context)
            res.status(response.httpStatus).send(response)
        }
    })
  
    router.put('/:id', (req, res) =>{
        req.body.id = req.params.id
        const context = "Update Vendor"
        try{
        lib.Vendor.update(req.body)
        .then(result =>{
            const response = app.responseHandler(false, context)
            response.count = 1
            response.data = result
            res.status(response.httpStatus).send(response)
        }).catch(error =>{
            const response = app.responseHandler(error, context,"Unable to Update")
            res.status(response.httpStatus).send(response)
        })
        } catch (error) {
            const response = app.responseHandler(error, context)
            res.status(response.httpStatus).send(response)
        }
    })

    router.delete('/:id', (req, res) =>{
        req.body.id = req.params.id
        const context = "Delete Vendor"
        try{
        lib.Vendor.remove(req.body)
        .then(result =>{
            const response = app.responseHandler(false, context)
            response.count = 1
            response.data = result
            res.status(response.httpStatus).send(response)
        }).catch(error =>{
            const response = app.responseHandler(error, context,"Unable to reomve Vendor")
            res.status(response.httpStatus).send(response)
        })
        } catch (error) {
            const response = app.responseHandler(error, context)
            res.status(response.httpStatus).send(response)
        }
    })

    router.get('/:id', (req, res) =>{
      req.body.id = req.params.id
      const context = "Get Specific Vendor by Employee"
      try{
          lib.Vendor.getById(req.body)
          .then(result =>{
            const response = app.responseHandler(false, context)
            response.count = 1
            response.data = result
            res.status(response.httpStatus).send(response)
          }).catch(error =>{
            const response = app.responseHandler(error, context,"Unable to find Vendor")
            res.status(response.httpStatus).send(response)
          })
        } catch (error) {
            const response = app.responseHandler(error, context)
            res.status(response.httpStatus).send(response)
        }
    })

  
    return router
  }
  