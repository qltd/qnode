
module.exports = {

  /**
   * Model messages (CRUD, etc)
   */

  contact: {
    created: function (name) { return 'Thank you for contacting us, ' + name + '! We\'ll respond per your comments.' },
    deleted: function (name) { return 'Contact \'' + name + '\' was deleted'; },
    read: function (name) { return 'Contact \'' + name + ' \' was read'; },
    restored: function (title, version) { return 'Contact \'' + title + '\' was restored with data from version ' + version; },
    updated: function (name) { return 'Contact \'' + name + '\' was updated'; }
  },
  client: {
    created: function (title) { return 'Client \'' + title + '\' was created'; },
    deleted: function (title) { return 'Client \'' + title + '\' was deleted'; },
    read: function (title) { return 'Client \'' + title + ' \' was read'; },
    restored: function (title, version) { return 'Client \'' + title + '\' was restored with data from version ' + version; },
    updated: function (title) { return 'Client \'' + title + '\' was updated'; }
  },
  crew: {
    created: function (title) { return 'Crew \'' + title + '\' was created'; },
    deleted: function (title) { return 'Crew \'' + title + '\' was deleted'; },
    read: function (title) { return 'Crew \'' + title + ' \' was read'; },
    restored: function (title, version) { return 'Crew \'' + title + '\' was restored with data from version ' + version; },
    updated: function (title) { return 'Crew \'' + title + '\' was updated'; }
  },
  user: {
    adminRequired: function (path) { return 'You must be a site administrator to access ' + path; },
    authenticated:  function (username) { return 'Authenticated as \'' + username + '\''; },
    authenticationFailed: 'Username and/or password are not correct',
    authenticationRequired: function (path) { return 'You must be authenticated to access ' + path; },
    created: function (username) { return 'User \'' + username + '\' was created'; },
    deleted: function (username) { return 'User \'' + username + '\' was deleted'; },
    notFound: function (username, path) { return 'User \'' + username + '\' could not found while trying to respond to ' + path; },
    selfRequired: function (username, path) { return 'You must be user \'' + username + '\' to access ' + path; },
    read: function (username) { return 'User \'' + username + ' \' was read'; },
    restored: function (username, version) { return 'User \'' + username + '\' was restored with data from version ' + version; },
    updated: function (username) { return 'User \'' + username + '\' was updated'; }
  },
  panel: {
    created: function (title) { return 'Panel \'' + title + '\' was created'; },
    deleted: function (title) { return 'Panel \'' + title + '\' was deleted'; },
    read: function (title) { return 'Panel \'' + title + ' \' was read'; },
    restored: function (title, version) { return 'Panel \'' + title + '\' was restored with data from version ' + version; },
    updated: function (title) { return 'Panel \'' + title + '\' was updated'; }
  },
  project: {
    created: function (title) { return 'Project \'' + title + '\' was created'; },
    deleted: function (title) { return 'Project \'' + title + '\' was deleted'; },
    read: function (title) { return 'Project \'' + title + ' \' was read'; },
    restored: function (title, version) { return 'Project \'' + title + '\' was restored with data from version ' + version; },
    updated: function (title) { return 'Project \'' + title + '\' was updated'; }
  },
  service: {
    created: function (title) { return 'Service \'' + title + '\' was created'; },
    deleted: function (title) { return 'Service \'' + title + '\' was deleted'; },
    read: function (title) { return 'Service \'' + title + ' \' was read'; },
    restored: function (title, version) { return 'Service \'' + title + '\' was restored with data from version ' + version; },
    updated: function (title) { return 'Service \'' + title + '\' was updated'; }
  },

  /**
   * Unbound messages (CRUD, etc)
   */

  created: function (title) { return '\'' + title + '\' was created'; },
  deleted: function (title) { return '\'' + title + '\' was deleted'; },
  read: function (title) { return '\'' + title + ' \' was read'; },
  restored: function (title, version) { return '\'' + title + '\' was restored with data from version ' + version; },
  updated: function (title) { return '\'' + title + '\' was updated'; },
  
  /*
   * Field validation messages
   */

  body: {
    isNull: 'Body field cannot be empty' 
  },
  comments: {
    isNull: 'Comments cannot be empty'
  },
  email: {
    notEmail: 'Email address must be valid',
    isNull: 'Email address cannot be empty'
  },
  jobTitle: {
    isNull: 'Job title cannot be empty'
  },
  name: {
    first: {
      isNull: 'First name cannot be empty'
    },
    last: {
      isNull: 'Last name cannot be empty'
    }, 
    isNull: 'Name cannot be empty'
  },
  password: {
    isNull: 'Password cannot be empty'
  },
  position: {
    isNull: 'Position cannot be empty',
    notNumeric: 'Position must be numeric'
  },
  title: {
    isNull: 'Title cannot be empty'
  },
  url: {
    notUrl: 'Url must be valid'
  },
  username: {
    isNull: 'Username cannot be empty'
  },

  /**
   * Unbound validation messages
   */

  default: 'Sorry! There was an error',
  notUnique: function (collectionField, fieldValue) { return collectionField + ' \'' + fieldValue + '\' already exists, please enter another'; },

  /**
   * HTTP status code messages
   */

  status: {
    403: 'Forbidden! You are not authorized to view this page.',
    404: 'Oh, no! That page was not found.',
    500: 'Whoa! There was an error while processing your request.'
  }
  
}
