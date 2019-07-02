const  express = require('express')
const path = require('path')
const cookieParser = require('cookie-parser')
const bodyParser = require('body-parser')
const cors = require('cors')
const flash = require('connect-flash')
const passport = require('passport')
const logger = require('morgan')
const session = require('express-session')
const interceptor = require('express-interceptor')
const toobusy = require('toobusy-js')
const requestIp = require('request-ip')
const debug = require('debug')('app:app') // eslint-disable-line
// const mysql = require('mysql')
const config = require('./configuration/config')()
const db = require('./models')

const app = express();
app.use(requestIp.mw())

if (!config.testing) {
  toobusy.maxLag(1000)
  toobusy.onLag((currentLag) => {
    console.log(`Event loop lag detected! Latency: ${currentLag} ms`)
  })
  app.use((req, res, next) => {
    if (toobusy()) {
      res.status(503).send("I'm busy right now, sorry.")
    } else {
      next()
    }
  })
}

app.set('views', path.join(__dirname, 'views'))


if (!process.env.TESTING) {
  app.use(logger((tokens, req, res) => {
    return [
      req.clientIp,
      tokens.method(req, res),
      tokens.url(req, res),
      tokens.status(req, res),
      tokens.res(req, res, 'content-length'), '-',
      tokens['response-time'](req, res), 'ms',
    ].join(' ')
  }))
}

app.use(bodyParser.json({ limit: '50mb' }))
app.use(bodyParser.urlencoded({ extended: false, limit: '50mb' }))
app.use(cookieParser())

// Session settings
app.use(session({
  secret: 'ilovescotchscotchyscotchscotch',
  resave: true,
  saveUninitialized: true,
})) // session secret
app.use(flash()) // use connect-flash for flash messages stored in session
app.use(passport.initialize())
app.use(passport.session()) // persistent login sessions

// Loading Libraries
const lib =require("./lib")(app, db);

// Passport Auth
app.set('passport', passport)
require('./middleware/Passport.js')(passport, db, lib)

app.set('lib', lib);
app.set('db', db);

const responseInterceptor = interceptor((req, res) => ({
  isInterceptable() {
    return res.status !== null
  },
  intercept(body, send) {
    const newBody = require('./helperFunctions/exitResponse')(body)
    send(newBody)
  },
}))

app.use(responseInterceptor)
app.responseHandler = require('./helperFunctions/responseHandler')

const employee = require('./routes/employee')(express, app, db, lib);
const admin = require('./routes/admin')(express, app, db, lib);
const api = require('./routes/api')(express, app, db, lib);

app.use('/api', api)
app.use('/admin', admin)
app.use('/', employee)



// const db = mysql.createConnection({
//     host: "localhost",
//     user: "root",
//     password:"",
//     database: "wholesale"

// })
// db.connect(error =>{
//     if (error){
//         throw error 
//     }
//     console.log("Connected to database")
// })


// app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')))







// Database stuff

// const sync = config.db.sync
// const force = config.db.reset // Will Delete everything
// const loadData = config.db.loadData // Will add fixtures, may cause error if user data already exist, just ignore, issue is with password being encrypted

// debug(`Syncing database. Force is ${force}`)
// if (!loadData)debug('Data adding is turned off')
// if (sync) {
//   db.sequelize
//     .query(`SET FOREIGN_KEY_CHECKS = ${(force) ? 0 : 1}`, { raw: true })
//     .then((results) => {
//       db.sequelize
//         .sync({ force })
//         .then(() => {
//           if (loadData) {
//             const fixtures = require('./dummyData')()
//             debug('Data is loaded. Now going to add it to database')
//             sequelizeFixtures.loadFixtures(fixtures, db.sequelize.models).then(() => {
//               debug('Data successfully added to database')
//             })
//           }
//           console.log('Sever has started on port', config.port)
//         })
//         .catch((error) => {
//           debug(error)
//           throw error
//         })
//     })
// } else {
//   console.log('Sever has started on port', config.port)
// }

db.sequelize
  .sync()
  .then(() => {
    console.log(`Sever has started on port ${config.port || '3000'}.`)
  })


// console.log(`Sever has started on port ${config.port || '3000'}.`)
module.exports = app;