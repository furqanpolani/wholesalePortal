/**
 * Requires all library files and passes in the db and the lib object as parameters
 * All libraries will have access to the rest of the library through lib
 * @param {*} app
 * @param {*} db
 * @returns {Libs}
 */
module.exports = function (app, db) {
    const lib = {}
    const fs = require('fs')
  
    // lib.IO = app.io
  
    fs
      .readdirSync(__dirname)
      .filter(file => (file.indexOf('.') !== 0) && (file !== 'index.js'))
      .forEach((file) => {
        const cd = file.replace('.js', '')
        lib[cd] = require(`./${file}`)(db, lib)
    })
  
    return lib
}
  