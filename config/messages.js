
module.exports = {
  global: {
    default: 'Sorry! There was an error.',
    notUnique: function(collectionField, fieldValue) {
      return collectionField + ': \'' + fieldValue + '\' already exists, please enter another.';
    }
  },
  user: {
    username: {
      notPresent: 'Username is a required field.'
    },
    email: {
      notPresent: 'Email is a required field.'
    },
    password: {
      notPresent: 'Password is a required field.'
    }
  }
}
