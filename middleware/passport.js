// load all the things we need
const LocalStrategy = require('passport-local').Strategy
const jwt = require('jsonwebtoken')
const config = require('../configuration/config.js')()
const debug = require('debug')('app:Passport')
const responseHandler = require('../helperFunctions/responseHandler')


// load the auth variables
// var configAuth = require('./auth'); // use this one for testing

module.exports = function (passport, db, lib) {
  // =========================================================================
  // passport session setup ==================================================
  // =========================================================================
  // required for persistent login sessions
  // passport needs ability to serialize and unserialize users out of session

  // used to serialize the user for the session

  passport.serializeUser((user, done) => {
    const token = jwt.sign({ userId: user.id }, config.secret, { expiresIn: '24h' })
    done(null, token)
  })

  // used to deserialize the user
  passport.deserializeUser((token, done) => {
    jwt.verify(token, config.secret, (error, user) => {
      if (error) {
        debug('Something wrong with verifing token.')
        return done(null, 'test')
      }
      return done(null, user)
    })
  })

  // =========================================================================
  // LOCAL User LOGIN =============================================================
  // =========================================================================
  passport.use('local-employee-login', new LocalStrategy(
    {
    // by default, local strategy uses username and password, we will override with email
      usernameField: 'email',
      passwordField: 'password',
      passReqToCallback: true, // allows us to pass in the req from our route (lets us check if a user is logged in or not)
      session: false,
    },
    ((req, email, password, done) => {
      const context = 'Employee authentication'

      // asynchronous
      process.nextTick(() => db.Employee.findOne({
        where:
          {
            email,
          },
          include: [{
            model: db.Location, attributes: ['id', 'name'],
          },
          { model: db.Organization, attributes: ['id'] },
          ],
          attributes: ['id', 'email', 'pinCode', 'imageURL', 'name'],
        // include: [{ model: db.Address,
        //   //  include: [{ model: db.Country },{model: db.State}] 
        //   }],

        attributes: ['id', 'email', 'password', 'verified','role'],
      }).then((employee) => {
        // if no employee is found, return the message
        if (!employee) {
          const response = responseHandler({ name: 'NotFound' }, context, 'Employee was not found')
          return done(null, response, req.flash('loginMessage', 'No Employee found.'))
        }
        if (!employee.Organization) {
          const response = responseHandler({ name: 'NotFound' }, context, 'Organization was not found. It may have been deleted or canceled by your admin. Please consult your company Admin.')
          return done(null, response, req.flash('loginMessage', 'No employee found.'))
        }

        return employee.validPassword(password)
          .then(async (valid) => {
            if (valid) {
              const response = responseHandler(false, context)
              const token = jwt.sign({ id: employee.id }, config.secret, { expiresIn: '24h' })
              delete employee.dataValues.password
              // Add any task waiting
              // TODO add organization task to this list
              response.data = {
                token,
                employee,
              }
              return done(null, response)
            }
            const response = responseHandler({ name: 'Unauthenticated' }, context, 'Employee password is invalid')
            return done(null, response, req.flash('loginMessage', 'Oops! Wrong password.'))
          })
          .catch((error) => {
            throw error
          })
      }).error(error => done(error)))
    }),
  ))
}
