// Generated by CoffeeScript 1.6.3
(function() {
  var controller;

  controller = function(scope, ParseCrud, ngTableParams, http, Alert) {
    var Users, onError, saveSuccess;
    scope.data = [];
    scope.selected = 'users';
    scope.entity = {};
    scope.files = {};
    Users = new ParseCrud('User');
    Users.list(function(d) {
      scope.data = d;
      return scope.tableParams.reload();
    });
    saveSuccess = function(e) {
      return scope.$apply(function() {
        scope.data.push(e);
        scope.tableParams.reload();
        scope.selected = 'list';
        return Alert.success('User information was saved successfully.');
      });
    };
    onError = function(e) {
      return scope.$apply(function() {
        console.log(e);
        return Alert.error('Error occured while saving user information.');
      });
    };
    scope.switchAdmin = function(user) {
      var query, roleSuccess;
      roleSuccess = function(role) {
        var adminRelation, queryAdmins;
        adminRelation = new Parse.Relation(role, "users");
        queryAdmins = adminRelation.query();
        queryAdmins.equalTo("objectId", user.id);
        return queryAdmins.first({
          success: function(isAdmin) {
            var roleACL;
            roleACL = role.getACL();
            roleACL.setReadAccess(user, !isAdmin);
            roleACL.setWriteAccess(user, !isAdmin);
            if (!isAdmin) {
              role.getUsers().add(user);
            } else {
              role.getUsers().remove(user);
            }
            return role.save({
              success: function() {
                Alert.success('Operation was successful.');
                return scope.$apply(function() {
                  return scope.tableParams.reload();
                });
              },
              error: function(obj, e) {
                return Alert.error(e.message);
              }
            });
          }
        });
      };
      query = new Parse.Query(Parse.Role);
      query.equalTo("name", "Administrator");
      return query.first({
        success: roleSuccess
      });
    };
    return scope.tableParams = new ngTableParams({
      page: 1,
      count: 10
    }, {
      total: function() {
        return scope.data.length;
      },
      getData: function($defer, params) {
        return $defer.resolve(scope.data.slice((params.page() - 1) * params.count(), params.page() * params.count()));
      }
    });
  };

  angular.module('wordsApp').controller('AdminCtrl', ['$scope', 'ParseCrud', 'ngTableParams', '$http', 'Alert', controller]);

}).call(this);

/*
//@ sourceMappingURL=admin.map
*/