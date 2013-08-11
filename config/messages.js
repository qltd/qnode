
module.exports = {

  contact: {
    name: {
      isNull: 'Name cannot be empty'
    },
    email: {
      isNull: 'Email address cannot be empty',
      notEmail: 'Email address must be valid'
    },
    company: {},
    comments: {},
    success: function (name) { return 'Thank you for contacting us, ' + name + '! We\'ll respond per your comments.' }
  },

  user: {
    username: {
      isNull: 'Username cannot be empty',
      notUnique: function (username) { return 'Username \'' + username + '\' already exists'; }
    },
    email: {
      notEmail: 'Email address must be valid',
      isNull: 'Email address cannot be empty'
    },
    password: {
      isNull: 'Password cannot be empty'
    },
    authenticated:  function (username) { return 'Successfully authenticated as \'' + username + '\''; },
    created: function (username) { return 'User \'' + username + '\' was successfully created'; },
    updated: function (username) { return 'User \'' + username + '\' was successfully updated'; },
    error: 'Could not create user'
  },

  panel: {
    title: {
      isNull: 'Title cannot be empty'
    },
    body: {
      isNull: 'Body cannot be empty'
    },
    created: function (title) { return 'Panel \'' + title + '\' was successfully created'; },
    updated: function (title) { return 'Panel \'' + title + '\' was successfully updated'; },
    error: 'Could not create panel'
  },

  project: {
    client: {
      isNull: 'Client cannot be empty'
    },
    created: function (title) { return 'Panel \'' + title + '\' was successfully created'; },
    error: 'Could not create panel'
  },

  // responses to specific fields
  title: {
      isNull: 'Title cannot be empty'
  },
  email: {
      notEmail: 'Email address must be valid',
      isNull: 'Email address cannot be empty'
  },

  default: 'Sorry! There was an error',
  
  created: function (title) { return '\'' + title + '\' was successfully created'; },
  updated: function (title) { return '\'' + title + '\' was successfully updated'; },
  restored: function (title) { return '\'' + title + '\' was successfully restored'; },

  notUnique: function (collectionField, fieldValue) { return collectionField + ' \'' + fieldValue + '\' already exists, please enter another'; }
}
