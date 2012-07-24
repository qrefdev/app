(function() {
  var AjaxResponse;

  AjaxResponse = (function() {

    AjaxResponse.prototype.total = 0;

    AjaxResponse.prototype.records = [];

    AjaxResponse.prototype.success = true;

    AjaxResponse.prototype.message = null;

    AjaxResponse.prototype.mode = 'ajax';

    AjaxResponse.prototype.errorCode = 0;

    function AjaxResponse() {
      this.reset();
    }

    AjaxResponse.prototype.setTotal = function(value) {
      return this.total = value;
    };

    AjaxResponse.prototype.addRecord = function(r) {
      this.records.push(r);
      return this.records.length;
    };

    AjaxResponse.prototype.addRecords = function(arr) {
      this.records = this.records.concat(arr);
      return this.records.length;
    };

    AjaxResponse.prototype.reset = function() {
      this.records = [];
      this.message = null;
      this.success = true;
      this.mode = 'ajax';
      this.errorCode = 0;
      this.total = 0;
      return this.records.length;
    };

    AjaxResponse.prototype.getLength = function() {
      return this.records.length;
    };

    AjaxResponse.prototype.failure = function(reason, errorCode) {
      this.message = reason;
      this.errorCode = errorCode;
      return this.success = false;
    };

    return AjaxResponse;

  })();

}).call(this);
