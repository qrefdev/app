(function() {
  var RestfulResponse;

  RestfulResponse = (function() {

    RestfulResponse.prototype.total = 0;

    RestfulResponse.prototype.records = [];

    RestfulResponse.prototype.success = true;

    RestfulResponse.prototype.mode = 'rest';

    RestfulResponse.prototype.message = null;

    RestfulResponse.prototype.errorCode = 0;

    function RestfulResponse() {
      this.reset();
    }

    RestfulResponse.prototype.setTotal = function(value) {
      return this.total = value;
    };

    RestfulResponse.prototype.addRecord = function(r) {
      this.records.push(r);
      return this.records.length;
    };

    RestfulResponse.prototype.addRecords = function(arr) {
      this.records = this.records.concat(arr);
      return this.records.length;
    };

    RestfulResponse.prototype.reset = function() {
      this.records = [];
      this.message = null;
      this.success = true;
      this.mode = 'rest';
      this.total = 0;
      this.errorCode = 0;
      return this.records.length;
    };

    RestfulResponse.prototype.getLength = function() {
      return this.records.length;
    };

    RestfulResponse.prototype.failure = function(reason, errorCode) {
      this.message = reason;
      this.success = false;
      return this.errorCode = errorCode;
    };

    return RestfulResponse;

  })();

}).call(this);
