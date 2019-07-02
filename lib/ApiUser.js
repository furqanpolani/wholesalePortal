module.exports = function (db, lib) {
    
    function create(obj) {
      const code = makeKey()
      return db.ApiUser.create({
        apiKey: code,
        clientName: obj.clientName,
      })
        .then(result => ({ code }))
        .catch((error) => {
          throw error
        })
    }

    function createCSPApiUser(obj) {
      const code = makeKey()
      const secret = makeKey()
      return db.ApiUser.create({
        apiKey: code,
        clientName: obj.clientName,
        CSPSecret: secret
      })
        .then(result => ({ code, secret }))
        .catch((error) => {
          throw error
        })
    }
    
  
    /**
     * Create a random string to be used for code
     */
    function makeKey() {
      let text = ''
      const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  
      for (let i = 0; i < 16; i++) { text += possible.charAt(Math.floor(Math.random() * possible.length)) }
  
      return text
    }
  
    function verifyKey(key) {
      return db.ApiUser
        .findOne({
          where: { apiKey: key },
        })
        .then((result) => {
          // console.log('result is :', result)
          if (result) {
            return true
          }
          return false
        })
        .catch(() => false)
    }

    function adminApiVerify (data) {
      return db.ApiUser.findOne({
        where: {
          apiKey: data.code,
          CSPSecret: data.companySecret
        }
      }).then(result =>{
        if (result){
          return true
        }
        return false
      }).catch(() => false)
    }
  
    return {
      create,
      verifyKey,
      adminApiVerify,
      createCSPApiUser
    }
  }
  