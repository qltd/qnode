
module.exports = {
  global: {
    default: 'Sorry! There was an error',
    notUnique: function(collectionField, fieldValue) {
      return collectionField + ': \'' + fieldValue + '\' already exists, please enter another';
    }
  },
  user: {
    username: {
      isNull: 'Username cannot be empty'
    },
    email: {
      notValid: 'Email address must be valid',
      isNull: 'Email address cannot be empty'
    },
    password: {
      isNull: 'Password cannot be empty'
    }
  }
}
