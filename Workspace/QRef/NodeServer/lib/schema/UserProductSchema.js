(function() {
  var ObjectId, Schema, UserProductSchema, UserProductSchemaInternal, mongoose;

  mongoose = require('mongoose');

  Schema = mongoose.Schema;

  ObjectId = Schema.ObjectId;

  /*
  Schema representing the relationship between an individual user and a product which they have permission to access.
  @example MongoDB Collection
    db.user.products
  @example MongoDB Indexes
    db.user.products.ensureIndex({ user: 1, product: 1 }, { unique: true })
  @author Nathan Klick
  @copyright QRef 2012
  @abstract
  */


  UserProductSchemaInternal = (function() {

    function UserProductSchemaInternal() {}

    /*
    	@property [ObjectId] (Required) The id of the user owning this product.
    	@see UserSchemaInternal
    */


    UserProductSchemaInternal.prototype.user = {
      type: ObjectId,
      required: true,
      ref: 'users'
    };

    /*
    	@property [ObjectId] (Required) The id of the product which the user owns.
    	@see ProductSchemaInternal
    */


    UserProductSchemaInternal.prototype.product = {
      type: ObjectId,
      required: true,
      ref: 'products'
    };

    return UserProductSchemaInternal;

  })();

  UserProductSchema = new Schema(new UserProductSchemaInternal());

  UserProductSchema.index({
    user: 1,
    product: 1
  }, {
    unique: true
  });

  module.exports = UserProductSchema;

}).call(this);
