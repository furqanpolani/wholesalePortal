module.exports = function (express, app, db, lib) {
    const router = express.Router()
    
    router.get('/:id', (req, res) =>{
      req.body.id = req.params.id
      const context = "Get Specific Organization by Employee"
      try{
          lib.Organization.getById(req.body)
          .then(result =>{
            const response = app.responseHandler(false, context)
            response.count = 1
            response.data = result
            res.status(response.httpStatus).send(response)
          }).catch(error =>{
            const response = app.responseHandler(error, context,"Unable to find Organization")
            res.status(response.httpStatus).send(response)
          })
        } catch (error) {
            const response = app.responseHandler(error, context)
            res.status(response.httpStatus).send(response)
        }
    })

  
    return router
  }
  