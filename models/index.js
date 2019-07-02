const fs = require('fs')
const path = require('path')
const Sequelize = require('sequelize')
const config = require('../configuration/config')()

const Op = Sequelize.Op
config.db.options.operatorsAliases = Op

const sequelize = new Sequelize(
  config.db.database,
  config.db.user,
  config.db.password,
  config.db.options,
)

let db = {}

function load(PATH) {
  fs
    .readdirSync(PATH)
    .filter(file => (file.indexOf('.') !== 0) && (file !== 'index.js'))
    .forEach((file) => {
      if (fs.statSync(path.join(PATH, file)).isDirectory()) {
        load(path.join(PATH, file))
      } else {
        sequelize.import(path.join(PATH, file))
      }
    })
}

load(__dirname)

Object.keys(sequelize.models).forEach((modelName) => {
  if ('associate' in sequelize.models[modelName]) {
    sequelize.models[modelName].associate(sequelize.models)
  }
  if ('triggers' in sequelize.models[modelName]) {
    sequelize.models[modelName].triggers(sequelize.models)
  }
})

db = sequelize.models

db.sequelize = sequelize
db.Sequelize = Sequelize
module.exports = db
