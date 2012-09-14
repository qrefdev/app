(function() {
  var ObjectId, RoleSchema, RoleSchemaInternal, Schema, mongoose;

  mongoose = require('mongoose');

  Schema = mongoose.Schema;

  ObjectId = Schema.ObjectId;

  /*
  Schema representing a system-wide role used to control access levels of individual users.
  @example MongoDB Collection
    db.user.roles
  @example MongoDB Indexes
    db.user.roles.ensureIndex({ roleName: 1 }, { unique: true })
  @author Nathan Klick
  @copyright QRef 2012
  @abstract
  */


  RoleSchemaInternal = (function() {

    function RoleSchemaInternal() {}

    /*
    	@property [String] (Required) A unique name for the specific role.
    */


    RoleSchemaInternal.prototype.roleName = {
      type: String,
      required: true,
      unique: true
    };

    /*
    	@property [String] (Optional) A detailed description of this role.
    */


    RoleSchemaInternal.prototype.description = {
      type: String,
      required: false
    };

    return RoleSchemaInternal;

  })();

  RoleSchema = new Schema(new RoleSchemaInternal());

  module.exports = RoleSchema;

}).call(this);
