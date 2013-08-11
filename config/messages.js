
module.exports = {

  /**
   * Model CRUD messages
   */

  contact: {
    created: function (name) { return 'Thank you for contacting us, ' + name + '! We\'ll respond per your comments.' }
  },

  user: {
    authenticated:  function (username) { return 'Successfully authenticated as \'' + username + '\''; },
    created: function (username) { return 'User \'' + username + '\' was successfully created'; },
    updated: function (username) { return 'User \'' + username + '\' was successfully updated'; },
    error: 'Could not create user'
  },

  panel: {
    created: function (title) { return 'Panel \'' + title + '\' was successfully created'; },
    updated: function (title) { return 'Panel \'' + title + '\' was successfully updated'; },
    error: 'Could not create panel'
  },

  project: {
    created: function (title) { return 'Panel \'' + title + '\' was successfully created'; },
    error: 'Could not create project'
  },

  service: {
    created: function (title) { return 'Service \'' + title + '\' was successfully created'; },
    updated: function (title) { return 'Service \'' + title + '\' was successfully updated'; }
  },

  /**
   * Unbound CRUD messages
   */

  created: function (title) { return '\'' + title + '\' was successfully created'; },
  updated: function (title) { return '\'' + title + '\' was successfully updated'; },
  restored: function (title) { return '\'' + title + '\' was successfully restored'; },

  /*
   * Field validation messages
   */

  client: {
    isNull: 'Client cannot be empty'
  },
  email: {
    notEmail: 'Email address must be valid',
    isNull: 'Email address cannot be empty'
  },
  name: {
    isNull: 'Name cannot be empty'
  },
  password: {
    isNull: 'Password cannot be empty'
  },
  title: {
    isNull: 'Title cannot be empty'
  },
  username: {
    isNull: 'Username cannot be empty'
  },

  /**
   * Unbound validation messages
   */

  default: 'Sorry! There was an error',
  notUnique: function (collectionField, fieldValue) { return collectionField + ' \'' + fieldValue + '\' already exists, please enter another'; }
  
}
