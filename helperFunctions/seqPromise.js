const sequence = require('promise-sequence')

module.exports = function (promises, options) {
  return sequence(promises)

  // return promises.reduce((promiseChain, currentTask) => {
  //   return promiseChain.then(chainResults =>
  //       currentTask.then(currentResult =>
  //           [ ...chainResults, currentResult ]
  //       )
  //       .catch(error=>{throw error})
  //   ).catch(error=>{
  //     throw error
  //   })
  // },
  // Promise.resolve([]))
  // .then(arrayOfResults => {
  //   return arrayOfResults
  // })
  // .catch(error=>{
  //   throw error
  // })
}
// /\︵-︵/\
// |(◉)(◉)|
// \ ︶V︶ /
//  /↺↺↺↺\
//  ↺↺↺↺↺|
//  \↺↺↺↺/
// ¯¯/\¯/\¯
