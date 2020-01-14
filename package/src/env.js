let Drupal = {
  behaviors: {},
  t: (str, args = {}) => {
    for (let key in args) {
      str = str.replace(key, args[key])
    }
    return str
  }
}

window.Drupal = Drupal
