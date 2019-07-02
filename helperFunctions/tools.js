module.exports = {
    randomString: function (size, caps) {
      let text = ''
      const possible = (caps) ? 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789' : 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  
      for (let i = 0; i < size; i++) { text += possible.charAt(Math.floor(Math.random() * possible.length)) }
  
      return text
    },
    randomNumeric: function (size, prefix, suffix) {
      let text = ''
      const possible = '0123456789'
  
      for (let i = 0; i < size; i++) { text += possible.charAt(Math.floor(Math.random() * possible.length)) }
      if (prefix) text = prefix + text
      if (suffix) text += suffix
  
      return text
    },
  }
  