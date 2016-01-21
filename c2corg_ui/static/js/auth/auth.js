goog.provide('app.AuthController');
goog.provide('app.authDirective');

goog.require('app');
goog.require('app.Alerts');
goog.require('app.Authentication');
goog.require('ngeo.Location');


/**
 * This directive is used to manage the login/register forms.
 *
 * @return {angular.Directive} The directive specs.
 * @ngInject
 */
app.authDirective = function() {
  return {
    restrict: 'A',
    scope: true,
    controller: 'appAuthController',
    controllerAs: 'authCtrl',
    bindToController: true
  };
};


app.module.directive('appAuth', app.authDirective);


/**
 * @param {angular.Scope} $scope Scope.
 * @param {angular.$http} $http
 * @param {string} apiUrl Base URL of the API.
 * @param {app.Authentication} appAuthentication
 * @param {ngeo.Location} ngeoLocation ngeo Location service.
 * @param {app.Alerts} appAlerts
 * @constructor
 * @export
 * @ngInject
 */
app.AuthController = function($scope, $http, apiUrl, appAuthentication,
    ngeoLocation, appAlerts) {

  /**
   * @type {angular.Scope}
   * @private
   */
  this.scope_ = $scope;

  /**
   * @type {angular.$http}
   * @private
   */
  this.http_ = $http;

  /**
   * @type {string}
   * @private
   */
  this.apiUrl_ = apiUrl;

  /**
   * @type {app.Authentication}
   * @private
   */
  this.appAuthentication_ = appAuthentication;

  /**
   * @type {ngeo.Location}
   * @private
   */
  this.ngeoLocation_ = ngeoLocation;

  /**
   * @type {app.Alerts}
   * @private
   */
  this.alerts_ = appAlerts;
};


/**
 * @export
 */
app.AuthController.prototype.login = function() {
  var login = this.scope_['login'];
  var remember = !!login['remember']; // a true boolean

  // Discourse SSO
  if (this.ngeoLocation_.hasParam('sso')) {
    login['sso'] = this.ngeoLocation_.getParam('sso');
    login['sig'] = this.ngeoLocation_.getParam('sig');
  }

  this.http_.post(this.buildUrl_('login'), login, {
    'headers': {
      'Content-Type': 'application/json; charset=UTF-8',
      'Accept': 'application/json'
    }
  }).then(
      this.successLogin_.bind(this, remember),
      this.errorLogin_.bind(this)
  );
};


/**
 * @param {boolean} remember whether to store the data in local storage.
 * @param {Object} response Response from the API server.
 * @private
 */
app.AuthController.prototype.successLogin_ = function(remember, response) {
  var data = /** @type {appx.AuthData} */ (response['data']);
  data.remember = remember;
  this.appAuthentication_.setUserData(data);

  // redirect to previous page or the page sent by the server
  var redirect = data.redirect;
  if (!redirect) {
    redirect = this.ngeoLocation_.hasParam('from') ?
        decodeURIComponent(this.ngeoLocation_.getParam('from')) : '/';
  }
  window.location.href = redirect;
};


/**
 * @param {Object} response Response from the API server.
 * @private
 */
app.AuthController.prototype.errorLogin_ = function(response) {
  this.alerts_.addError(response);
};


/**
 * @export
 */
app.AuthController.prototype.register = function() {
  this.http_.post(this.buildUrl_('register'), this.scope_['register'], {
    'headers': {
      'Content-Type': 'application/json; charset=UTF-8',
      'Accept': 'application/json'
    }
  }).then(
      this.successRegister_.bind(this),
      this.errorRegister_.bind(this)
  );
};


/**
 * @param {Object} response Response from the API server.
 * @private
 */
app.AuthController.prototype.successRegister_ = function(response) {
  this.alerts_.addSuccess('Register success');
};


/**
 * @param {Object} response Response from the API server.
 * @private
 */
app.AuthController.prototype.errorRegister_ = function(response) {
  this.alerts_.addError(response);
};


/**
 * @export
 */
app.AuthController.prototype.showNewPassForm = function() {
  alert('TODO');
};


/**
 * @param {string} action Action.
 * @return {string} URL.
 * @private
 */
app.AuthController.prototype.buildUrl_ = function(action) {
  return '{base}/users/{action}'
      .replace('{base}', this.apiUrl_)
      .replace('{action}', action);
};


app.module.controller('appAuthController', app.AuthController);
