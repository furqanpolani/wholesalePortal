module.exports = function (express, app, db, lib) {
    const router = express.Router()

    router.get('/', (req, res) =>{
      const context = "Get All Store By Employee"
      const options = {}
      if (req.query) {
        options.search = req.query.search
        options.offset = req.query.offset
        options.limit = req.query.limit
        options.name = req.query.name
        options.status = req.query.status
        options.statusByEmployee = req.query.statusByEmployee
        options.approveStatus = req.query.approveStatus
        options.type = req.query.type
        options.createdBy = req.query.CreatedBy
        options.CreatedById = req.query.CreatedById
        options.ApprovedById = req.query.ApprovedById
        options.registeredOn = req.query.createdAt
      }
      try{
        lib.Store.getAll(req.body, options)
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
        const context = "Create Store"
        const options = {}
        try {
            lib.Store.create(req.body, options)
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
        const context = "Update Store"
        try{
        lib.Store.update(req.body)
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

    router.put('/approve/:id', (req, res) =>{
        req.body.id = req.params.id
        const approveData = {
            approveStatus: req.body.approveStatus,
        }
        if (req.body.statusByEmployee){
            approveData.statusByEmployee=req.body.statusByEmployee
        }
        const context = "Approve Store By Employee"
        try{
        lib.Store.updateStoreForEmployee(req.body, approveData)
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

    router.put('/cancel/:id', (req, res) =>{
        req.body.id = req.params.id
        const cancelStoreData = {
            cancelStore: req.body.cancelStore
        }
        const context = "Cancel Store By Employee"
        try{
        lib.Store.updateStoreForEmployee(req.body,cancelStoreData)
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

    router.put('/restore/:id', (req, res) =>{
        req.body.id = req.params.id
        const restoreData = {
            restoreStore: req.body.restoreStore
        }
        if (req.body.statusByEmployee){ restoreData.statusByEmployee = req.body.statusByEmployee}
        const context = "Restore Store By Employee"
        try{
        lib.Store.updateStoreForEmployee(req.body,restoreData)
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

    router.put('/defaultVendor/:id', (req, res) =>{
        req.body.id = req.params.id
        const context = "Restore Store By Employee"
        const defaultVendorData = {
            defaultVendorId:  req.body.defaultVendorId
        }
        try{
        lib.Store.updateStoreForEmployee(req.body, defaultVendorData)
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
        const context = "Delete Store"
        try{
        lib.Store.remove(req.body)
        .then(result =>{
            const response = app.responseHandler(false, context)
            response.count = 1
            response.data = result
            res.status(response.httpStatus).send(response)
        }).catch(error =>{
            const response = app.responseHandler(error, context,"Unable to reomve Store")
            res.status(response.httpStatus).send(response)
        })
        } catch (error) {
            const response = app.responseHandler(error, context)
            res.status(response.httpStatus).send(response)
        }
    })

    router.get('/:id', (req, res) =>{
      req.body.id = req.params.id
      const context = "Get Specific Store by Employee"
      try{
          lib.Store.getById(req.body)
          .then(result =>{
            const response = app.responseHandler(false, context)
            response.count = 1
            response.data = result
            res.status(response.httpStatus).send(response)
          }).catch(error =>{
            const response = app.responseHandler(error, context,"Unable to find Store")
            res.status(response.httpStatus).send(response)
          })
        } catch (error) {
            const response = app.responseHandler(error, context)
            res.status(response.httpStatus).send(response)
        }
    })

  
    return router
  }
  