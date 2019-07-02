module.exports = function (express, app, db, lib) {
    const router = express.Router()

    router.get('/', (req, res) =>{
      const context = "Get All Invoice By Employee"
      const options = {}
      if (req.query) {
        options.search = req.query.search
        options.offset = req.query.offset
        options.limit = req.query.limit
        options.name = req.query.name
      }
      try{
        lib.Invoice.getAll(req.body, options)
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
        const context = "Create Invoice"
        const options = {}
        try {
            lib.Invoice.create(req.body, options)
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
        const context = "Update Invoice"
        try{
        lib.Invoice.update(req.body)
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
        const context = "Delete Invoice"
        try{
        lib.Invoice.remove(req.body)
        .then(result =>{
            const response = app.responseHandler(false, context)
            response.count = 1
            response.data = result
            res.status(response.httpStatus).send(response)
        }).catch(error =>{
            const response = app.responseHandler(error, context,"Unable to reomve Invoice")
            res.status(response.httpStatus).send(response)
        })
        } catch (error) {
            const response = app.responseHandler(error, context)
            res.status(response.httpStatus).send(response)
        }
    })

    router.get('/:id', (req, res) =>{
      req.body.id = req.params.id
      const context = "Get Specific Invoice by Employee"
      try{
          lib.Invoice.getById(req.body)
          .then(result =>{
            const response = app.responseHandler(false, context)
            response.count = 1
            response.data = result
            res.status(response.httpStatus).send(response)
          }).catch(error =>{
            const response = app.responseHandler(error, context,"Unable to find Invoice")
            res.status(response.httpStatus).send(response)
          })
        } catch (error) {
            const response = app.responseHandler(error, context)
            res.status(response.httpStatus).send(response)
        }
    })

  
    return router
  }
  