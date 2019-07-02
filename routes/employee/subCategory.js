module.exports = function (express, app, db, lib) {
    const router = express.Router()

    router.get('/', (req, res) =>{
      const context = "Get All SubCategory By Employee"
      const options = {}
      if (req.query) {
        options.search = req.query.search
        options.offset = req.query.offset
        options.limit = req.query.limit
        options.name = req.query.name
      }
      try{
        lib.SubCategory.getAll(req.body, options)
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
        const context = "Create SubCategory"
        const options = {}
        try {
            lib.SubCategory.create(req.body, options)
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

    router.post('/bulk', (req, res) =>{
      const context = "Bulk Create SubCategory"
      const options = {}
      try {
          lib.SubCategory.bulkCreate(req.body, options)
          .then(result =>{
              const response = app.responseHandler(false, context)
            //   response.count = 1
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
        const context = "Update SubCategory"
        try{
        lib.SubCategory.update(req.body)
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
        const context = "Delete SubCategory"
        try{
        lib.SubCategory.remove(req.body)
        .then(result =>{
            const response = app.responseHandler(false, context)
            response.count = 1
            response.data = result
            res.status(response.httpStatus).send(response)
        }).catch(error =>{
            const response = app.responseHandler(error, context,"Unable to reomve SubCategory")
            res.status(response.httpStatus).send(response)
        })
        } catch (error) {
            const response = app.responseHandler(error, context)
            res.status(response.httpStatus).send(response)
        }
    })

    router.get('/:id', (req, res) =>{
      req.body.id = req.params.id
      const context = "Get Specific SubCategory by Employee"
      try{
          lib.SubCategory.getById(req.body)
          .then(result =>{
            const response = app.responseHandler(false, context)
            response.count = 1
            response.data = result
            res.status(response.httpStatus).send(response)
          }).catch(error =>{
            const response = app.responseHandler(error, context,"Unable to find SubCategory")
            res.status(response.httpStatus).send(response)
          })
        } catch (error) {
            const response = app.responseHandler(error, context)
            res.status(response.httpStatus).send(response)
        }
    })

  
    return router
  }
  