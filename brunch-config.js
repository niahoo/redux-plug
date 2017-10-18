

exports.paths = {
  'public': 'dist',
  'watched': ['src']
},

exports.files = {
  javascripts: {
    joinTo: process.env.NODE_ENV === 'production' ? {
      'redux-plug.min.js': /.+/
    } : {
      'redux-plug.js': /.+/
    }
  }
},

exports.plugins = {
  babel: {presets: ['env']},
}

exports.npm = {
  compilers: ['babel-brunch']
}

