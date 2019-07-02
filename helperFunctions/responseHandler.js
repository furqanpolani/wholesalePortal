const debug = require('debug')('*')

module.exports = function (error, context, title) {
  const response = {
    code: '',
    status: '',
    context: (context) || new Error('No context given to the response handler'),
    title,
    httpStatus: '',
  }

  if (!error) {
    debug('No Errors')
    response.status = 'success'
    response.code = '000000'
    response.httpStatus = 200
  } else {
    // console.log(error.name)
    console.log(error)
    response.status = 'fail'
    switch (error.name) {
      case 'InvalidToken':
        response.code = '100001'
        response.httpStatus = 401
        response.message = 'Provided token is invalid or has expired.'
        break
      case 'Unauthenticated':
        response.code = '100002'
        response.httpStatus = 401
        response.message = 'Authentication has failed.'
        break
      case 'Unauthorized':
        response.code = '100003'
        response.httpStatus = 403
        response.message = 'Access to this resource is forbidden'
        break
      case 'NotFound':
        response.code = '100004'
        response.httpStatus = 404
        response.message = (error.message) ? error.message : 'Not found'
        break
      case 'Conflict':
        response.code = '100005'
        response.httpStatus = 409
        response.message = error.message
        break
      case 'NotMatching':
        response.code = '100006'
        response.httpStatus = 400
        response.message = error.message
        break
      case 'AddressRequired':
        response.code = '100007'
        response.httpStatus = 400
        response.message = error.message
        break
      case 'StartDateRequired':
        response.code = '100008'
        response.httpStatus = 400
        response.message = error.message
        break
      case 'TokenExpiredError':
        response.code = '100009'
        response.httpStatus = 401
        response.message = 'The token provided has expired.'
        break
      case 'JsonWebTokenError':
        response.code = '100010'
        response.httpStatus = 401
        response.message = 'The token provided was invalid.'
        break
      case 'EmailRequired':
        response.code = '100011'
        response.httpStatus = 400
        response.message = error.message
        break
      case 'AccountRequired':
        response.code = '100012'
        response.httpStatus = 400
        response.message = error.message
        break
      case 'InputRequired':
        response.code = '100013'
        response.httpStatus = 400
        response.message = error.message
        break
      case 'Unavailable':
        response.code = '100014'
        response.httpStatus = 400
        response.message = error.message
        break
      case 'InvalidInput':
        response.code = '100015'
        response.httpStatus = 400
        response.message = error.message
        break
      case 'InActiveAccount':
        response.code = '100016'
        response.httpStatus = 401
        response.message = error.message
        break
      case 'NotRegisteredToOrganization':
          response.code = '100017'
          response.httpStatus = 401
          response.message = "Employee Not Registered to any Organization"
        break
      case 'OrganizationIdNotProvided':
          response.code = '100018'
          response.httpStatus = 400
          response.message = "Please Provide Organization Id"
        break
      case 'OrganizationNotFound':
          response.code = '100019'
          response.httpStatus = 404
          response.message = "Organization Not Found"
        break
      case 'OrganizationNotActive':
          response.code = '100020'
          response.httpStatus = 400
          response.message = "Organization is not Active"
        break
      case 'LocationRestriction':
          response.code = '100021'
          response.httpStatus = 400
          response.message = "You are not allowed to access other Locations"
        break
      case 'PurchaseDetailNotProvided':
        response.code = '100022'
        response.httpStatus = 400
        response.message = "Purchase Details not provided"
        break
      case 'LocationNotProvided':
        response.code = '100023'
        response.httpStatus = 400
        response.message = "Location Not Provided"
        break
          
      case 'VendorNotFound':
          response.code = '100024'
          response.httpStatus = 404
          response.message = "Vendor Not Found"
        break
      case 'SequelizeDatabaseError':
        response.code = '180001'
        response.httpStatus = 400
        response.message = 'Database error due to invalid inputs. Please make sure you are sending the correct payload with the correct data types.'
        break
      case 'SequelizeValidationError':
        response.code = '180002'
        response.httpStatus = 400
        response.message = error.message
        if (error.errors) {
          response.message = ''
          error.errors.forEach((error) => {
            if (error.validatorKey) {
              switch (error.validatorKey) {
                case 'not_unique':
                  response.httpStatus = 409
                  response.message = 'Not a unique entry.'
                  break
                case 'is_null':
                  response.httpStatus = 400
                  response.message = error.message
                  break
                case 'notEmpty':
                  response.httpStatus = 400
                  response.message = error.message
                  break
                default:
                  response.message = error.validatorKey
              }
            }
          })
        }
        break
      case 'SequelizeForeignKeyConstraintError':
        response.code = '180003'
        response.httpStatus = 400
        response.message = `Invalid values within these fields: ${JSON.stringify(error.fields)}`
        break
      case 'SequelizeUniqueConstraintError':
        response.code = '180004'
        response.httpStatus = 409
        response.message = `Invalid values within these fields: ${JSON.stringify(error.fields)}`
        break
      case 'ReferenceError':
        response.code = '190001'
        response.httpStatus = 500
        response.message = 'Internal Error. Please contact company '
        break
      case 'InternalError':
        response.code = '199999'
        response.httpStatus = 500
        response.message = 'Something went wrong. Contact company '
        break
      default:
        if (error.name === 'Error') {
          console.log('HERE', error.message)
        }
        response.code = '100000'
        response.message = error.message
        response.httpStatus = 500

        // Multiple Error occured
        if (error.errors) {
          response.message = ''
          error.errors.forEach((error) => {
            if (error.validatorKey) {
              switch (error.validatorKey) {
                default:
                  response.message = error.validatorKey
              }
            }
          })
        }
    }
  }
  return response
}
