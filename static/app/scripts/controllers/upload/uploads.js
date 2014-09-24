// Generated by CoffeeScript 1.7.1
(function() {
  'use strict';
  var controller;

  controller = function(scope, ParseCrud, http, ngTableParams, Alert) {
    var DocumentUpload, Documents, documentSaveSuccess, removeFile, saveError, saveSuccess, uploader;
    scope.text = '';
    scope.entity = {};
    scope.data = [];
    scope.selected = 'upload';
    Documents = new ParseCrud('Documents');
    DocumentUpload = new ParseCrud('DocumentUpload');
    DocumentUpload.list(function(d) {
      scope.data = d;
      return scope.tableParams.reload();
    });
    removeFile = function(name) {
      var h, params;
      params = {
        method: 'POST',
        url: '/removeupload',
        data: {
          filename: name
        }
      };
      h = http(params);
      h.success(function(d) {
        Alert.success('Removed successfully.');
        return scope.tableParams.reload();
      });
      return h.error(function(e) {
        console.log(e);
        return Alert.error("Error removing uploaded file.");
      });
    };
    scope.remove = function(e) {
      var filename, removeSuccess;
      if (!scope.hasWriteAccess(e)) {
        return;
      }
      filename = e.get('uploadname');
      removeSuccess = function(e) {
        scope.data = _.filter(scope.data, function(d) {
          return d.id !== e.id;
        });
        return removeFile(filename);
      };
      return DocumentUpload.remove(e, removeSuccess);
    };
    scope.tableParams = new ngTableParams({
      page: 1,
      count: 10
    }, {
      total: function() {
        return scope.data.length;
      },
      getData: function($defer, params) {
        var end, start;
        start = (params.page() - 1) * params.count();
        end = params.page() * params.count();
        return $defer.resolve(scope.data.slice(start, end));
      }
    });
    uploader = new plupload.Uploader({
      browse_button: "browse",
      url: "/upload",
      filters: {
        mime_types: [
          {
            title: "Text files",
            extensions: "txt"
          }
        ]
      }
    });
    uploader.init();
    scope.filesAdded = [];
    uploader.bind("FilesAdded", function(up, files) {
      return scope.$apply(function() {
        return plupload.each(files, function(file) {
          return scope.filesAdded.push(file);
        });
      });
    });
    scope.hasWriteAccess = function(obj) {
      var acl;
      if (!obj) {
        return false;
      }
      acl = obj.getACL();
      return acl.getWriteAccess(scope.$root.user);
    };
    documentSaveSuccess = function(e) {
      return function(doc) {
        return scope.$apply(function() {
          scope.data.push(e);
          scope.tableParams.reload();
          scope.selected = 'uploaded';
          return Alert.success("File was uploaded successfully.");
        });
      };
    };
    saveSuccess = function(e) {
      if (!scope.$root.isAdmin) {
        return Documents.save({
          name: e.get('name'),
          uploadedDocument: e
        }, documentSaveSuccess(e), saveError);
      } else {
        return scope.$apply(function() {
          scope.data.push(e);
          scope.tableParams.reload();
          scope.selected = 'uploaded';
          return Alert.success("File was uploaded successfully.");
        });
      }
    };
    saveError = function(e) {
      return scope.$apply(function() {
        console.log(e);
        return Alert.error("Error occured while saving upload info.");
      });
    };
    uploader.bind('FileUploaded', function(up, file, xhr) {
      var obj, res;
      res = JSON.parse(xhr.response);
      obj = {
        name: scope.name,
        filename: file.name,
        uploadname: res.result
      };
      console.log("Saving Object ");
      return DocumentUpload.save(obj, saveSuccess, saveError);
    });
    uploader.bind('UploadComplete', function(up, file) {
      return scope.$apply(function() {
        scope.filesAdded.length = 0;
        return scope.name = '';
      });
    });
    uploader.bind('UploadProgress', function(up, file) {
      return scope.$apply(function() {
        var matches;
        matches = _.filter(scope.filesAdded, function(f) {
          return f.id === file.id;
        });
        return matches[0].percent = file.percent;
      });
    });
    uploader.bind('Error', function(up, err) {
      return scope.$apply(function() {
        console.log(err);
        return Alert.error("Error uploading the file.");
      });
    });
    return scope.upload = function() {
      Alert.clear();
      return uploader.start();
    };
  };

  angular.module('wordsApp').controller('UploadsUploadsCtrl', ['$scope', 'ParseCrud', '$http', 'ngTableParams', 'Alert', controller]);

}).call(this);
