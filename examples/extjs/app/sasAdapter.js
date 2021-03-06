/* global Ext, h54s, serverData */
Ext.define('h54sExample.sasAdapter', {
  alternateClassName: 'sasAdapter',
  singleton: true,

  constructor: function() {
    this._adapter = new h54s({
      hostUrl: serverData.url
    });
  },

  login: function(user, pass, callback) {
    try {
      this._adapter.login(user, pass, function(status) {
        if(status === -1) {
          callback('Wrong username or password');
        } else {
          callback();
        }
      });
    } catch (e) {
      callback(e.message);
    }
  },

  call: function(sasProgram, tables, callback) {
    try {
      this._adapter.call(sasProgram, tables, function(err, res) {
        if(err && (err.type === 'notLoggedinError' || err.type === 'loginError')) {
          var loginWindow = Ext.create('h54sExample.view.LoginWindow');
          loginWindow.show();
        } else {
          callback(err, res);
        }
      });
    } catch(e) {
      callback(e.message);
    }
  },

  createTable: function(table, macro) {
    return new h54s.Tables(table, macro);
  },

  setDebugMode: function() {
    this._adapter.setDebugMode();
  },

  unsetDebugMode: function() {
    this._adapter.unsetDebugMode();
  },

  getDebugMode: function() {
    return this._adapter.debug;
  },

  getSasErrors: function() {
    return this._adapter.getSasErrors();
  },

  getDebugData: function() {
    return this._adapter.getDebugData();
  },

  getApplicationLogs: function() {
    return this._adapter.getApplicationLogs();
  },

  getFailedRequests: function() {
    return this._adapter.getFailedRequests();
  },

  clearApplicationLogs: function() {
    this._adapter.clearApplicationLogs();
  },

  clearDebugData: function() {
    this._adapter.clearDebugData();
  },

  clearSasErrors: function() {
    this._adapter.clearSasErrors();
  },

  clearFailedRequests: function() {
    this._adapter.clearFailedRequests();
  }
});
