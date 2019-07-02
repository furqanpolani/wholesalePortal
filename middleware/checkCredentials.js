const jwt = require('jsonwebtoken')
const config = require('../configuration/config.js')()
const debug = require('debug')('app:checkers')
const responseHandler = require('../helperFunctions/responseHandler')

const context = 'Authentication Gate'

const checkToken = function (req, res, next) {
  // Check if token from session
  if (req.session.passport !== undefined) {
    jwt.verify(
      req.session.passport.user, config.secret,
      (error, user) => {
        if (error) {
          const response = responseHandler(error, context)
          res.status(response.httpStatus).send(response)
        } else {
          debug('Valid token from session')
          req.body.user = user
          return next()
        }
        return undefined
      },
    )
  } else {
    // Request came from non-session
    jwt.verify(req.headers.token, config.secret, (error, user) => {
      if (error) {
        debug(error)
        const response = responseHandler(error, context)
        res.status(response.httpStatus).send(response)
      } else {
        req.app.get('lib').User.getById({ id: user.id })
          .then((userInstance) => {
            debug(`${userInstance.name} was the user found`)
            req.body.user = userInstance
            req.body.userToken = user
            return next()
          })
          .catch((error) => {
            const response = responseHandler(error, context)
            res.status(response.httpStatus).send(response)
          })
      }
    })
  }
}

const checkApiKey = function (req, res, next) {
  const ApiUser = req.app.get('lib').ApiUser
  ApiUser.verifyKey(req.headers['x-clientid'])
    .then(((result) => {
      if (result) {
        // Add ip to the body
        req.body.clientIp = req.clientIp
        return next()
      }
      const response = responseHandler({ name: 'InvalidAPIKey' }, context)
      res.status(response.httpStatus).send(response)
      return null
    }))
    .catch((error) => {
      const response = responseHandler(error, context)
      res.status(response.httpStatus).send(response)
    })
}

const checkAdminApiKey = function (req, res, next) {
  const ApiUser = req.app.get('lib').ApiUser
  const keys = {
    code: req.headers['x-clientid'],
    companySecret: req.headers['x-cellsmartposid']
  }
  ApiUser.adminApiVerify(keys)
    .then(((result) => {
      if (result) {
        // console.log('result is :', result)
        // Add ip to the body
        req.body.clientIp = req.clientIp
        req.body.CSPADMIN = result
        console.log("req.body.CSPID", req.body.CSPADMIN)
        return next()
      }
      const response = responseHandler({ name: 'InvalidAPIKey' }, context)
      res.status(response.httpStatus).send(response)
      return null
    }))
    .catch((error) => {
      const response = responseHandler(error, context)
      res.status(response.httpStatus).send(response)
    })
}




// const checkOrganization = function (req, res, next) {
//   req.body.organization = { id: req.headers.organizationid }

//   req.app.get('lib').Organization.getById(req.body)
//     .then((organization) => {
//       if (organization) {
//         req.body.organization = organization
//         const OrganizationLib = req.app.get('lib').Organization
//         OrganizationLib.verifyUserAsOwner(req.body)
//           .then((result) => {
//             if (result && !(result instanceof Error)) {
//               return next()
//             }
//             const response = responseHandler({ name: 'InvalidOrganization' }, context)
//             res.status(response.httpStatus).send(response)
//             return undefined
//           })
//           .catch((error) => {
//             const response = responseHandler(error, context)
//             res.status(response.httpStatus).send(response)
//           })
//       } else {
//         debug(`No organization found for this user ${req}`)
//         const response = responseHandler({ name: 'InvalidOrganization' }, context)
//         res.status(response.httpStatus).send(response)
//       }
//     })
//     .catch((error) => {
//       const response = responseHandler(error, context)
//       res.status(response.httpStatus).send(response)
//     })
// }


const checkEmployee = function (req, res, next) {
    // Request came from non-session
    jwt.verify(req.headers.token, config.secret, (error, employee) => {
      if (error) {
        debug(error)
        const response = responseHandler(error, context)
        res.status(response.httpStatus).send(response)
      } else {

        req.app.get('lib').Employee.getByIdForCredentials({ id: employee.id})
          .then((employeeInstance) => {
            debug(`${employeeInstance.firstName} was the user found`)
            req.body.employee = employeeInstance
            req.body.userToken = employee
            req.body.currentLocationId = employee.LocationId
            return next()
          })
          .catch((error) => {
            const response = responseHandler(error, context)
            res.status(response.httpStatus).send(response)
          })
      }
    })
  }

module.exports = {
  checkToken,
  checkApiKey,
  checkAdminApiKey,
  // checkOrganization,
  checkEmployee
  
}
