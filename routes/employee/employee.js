module.exports = function (express, app, db, lib) {
    const router = express.Router()

    // router.get('/vendorList', (req, res) =>{
    //   const context = "Get All Vendor  By Employee"
    //   const options = {}
    //   if (req.query) {
    //     options.search = req.query.search
    //     options.offset = req.query.offset
    //     options.limit = req.query.limit
    //     options.status = req.query.status
    //     options.gender = req.query.gender
    //     options.verified = req.query.verified
    //     options.role = req.query.role
    //     options.createdAt = req.query.createdAt
    //   }
    //   try{
    //     lib.Vendor.Vendor.getAll(req.body, options)
    //      .then(result =>{
    //       const response = app.responseHandler(false, context)
    //       response.count = result.count
    //       response.data = result.rows
    //       res.status(response.httpStatus).send(response)
    //      }).catch(error =>{
    //        const response = app.responseHandler(error, context)
    //        res.status(response.httpStatus).send(response)
    //      })
    //   } catch(error ) {
    //     const response = app.responseHandler(error,context)
    //     res.status(response.httpStatus).send(response)
    //   }
    // })

    // router.get('/vendor/:id', (req, res) =>{
    //   req.body.id = req.params.id
    //   const context = "Get Specific Vendor by Employee"
    //   try{
    //       lib.Vendor.Vendor.getById(req.body)
    //       .then(result =>{
    //           const response = app.responseHandler(false, context)
    //           response.count = 1
    //           response.data = result
    //           res.status(response.httpStatus).send(response)
    //       }).catch(error =>{
    //           const response = app.responseHandler(error, context,"Unable to find Vendor")
    //           res.status(response.httpStatus).send(response)
    //       })
    //   } catch (error) {
    //       const response = app.responseHandler(error, context)
    //       res.status(response.httpStatus).send(response)
    //   }
    // })

    router.get('/', (req, res) =>{
      const context = "Get All Employee"
      const options = {}
      if (req.query) {
        options.search = req.query.search
        options.offset = req.query.offset
        options.limit = req.query.limit
        options.isActive = req.query.isActive
        options.gender = req.query.gender
        options.role = req.query.role
        options.createdAt = req.query.createdAt
        options.name = req.query.name
        options.city = req.query.city
        options.organizationAdmin = req.query.organizationAdmin
        options.LocationId = req.query.LocationId
        options.OrganizationId = req.query.OrganizationId
      }
      try{
        lib.Employee.getAll(req.body, options)
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
    
    router.delete('/:id', (req, res) =>{
        req.body.id = req.params.id
        console.log('param id is :', req.body.id)
        const context = "Delete Employee"
        try{
            lib.Employee.remove(req.body)
             .then(result =>{
                const response = app.responseHandler(false, context)
                response.count = 1
                response.data = result
                res.status(response.httpStatus).send(response)
             }).catch(error =>{
                const response = app.responseHandler(error, context,"Unable to delete Employee")
                res.status(response.httpStatus).send(response)
             })
        } catch (error) {
            const response = app.responseHandler(error, context)
            res.status(response.httpStatus).send(response)
        }
    })

    router.get('/:id', (req, res) =>{
      req.body.id = req.params.id
      const context = "Get Specific Employee"
      try{
          lib.Employee.getById(req.body)
           .then(result =>{
              const response = app.responseHandler(false, context)
              response.count = 1
              response.data = result
              res.status(response.httpStatus).send(response)
           }).catch(error =>{
              const response = app.responseHandler(error, context,"Unable to find Employee")
              res.status(response.httpStatus).send(response)
           })
      } catch (error) {
          const response = app.responseHandler(error, context)
          res.status(response.httpStatus).send(response)
      }
  })
  
  router.put('/:id', (req, res) =>{
    req.body.id = req.params.id
    console.log('param id is :', req.body.id)
    const context = "Update Employee"
    try{
      lib.Employee.update(req.body)
        .then(result =>{
          const response = app.responseHandler(false, context)
          response.count = 1
          response.data = result
          res.status(response.httpStatus).send(response)
        }).catch(error =>{
          const response = app.responseHandler(error, context,"Unable to update Employee")
          res.status(response.httpStatus).send(response)
        })
    } catch (error) {
      const response = app.responseHandler(error, context)
      res.status(response.httpStatus).send(response)
    }
  })

  
    return router
  }
  