###
Specification class for the purpose of documenting the signatures and parameters of the callback utilized in the application framework.
@author Nathan Klick
@copyright QRef 2012
@abstract
###
class Callbacks
	###
	Standard callback used in the DB Manager utility classes for deeply populating a single object.
	@param err [Error] An error object if an error occurred or null otherwise.
	@param item [Object] The resulting deeply populated object.
	###
	managerExpandItemCallback: (err, item) ->
	###
	Standard callback used in the DB Manager utility class for deeply populating arrays of objects.
	@param err [Error] An error object if an error occurred or null otherwise.
	@param newArray [Array<Object>] The resulting deeply populated array of objects.
	###
	managerExpandArrayCallback: (err, newArray) ->
	###
	Standard callback used by the {UserAuth} security routines to return the status of a credential validation operation.
	@param err [Error] An error object if an error occurred or null otherwise.
	@param isValid [Boolean] An true/false value indicating if the credential was valid. True indicates a valid credential while false indicates failure or invalid credentials.
	###
	userAuthValidateCredentialCallback: (err, isValid) ->
	###
	Standard callback used by the {UserAuth#login} method to return the status and token from an authentication operation.
	@param err [Error] An error object if an error occurred or null otherwise.
	@param token [String] A valid token if successful otherwise null.
	@param isValid [Boolean] An true/false value indicating if the credential was valid. True indicates a valid credential while false indicates failure or invalid credentials.
	### 
	userAuthLoginCallback: (err, token, isValid) ->
	###
	Standard callback used by the {UserAuth#userFromToken} method to return the status and user from a lookup operation.
	@param err [Error] An error object if an error occurred or null otherwise.
	@param user [UserSchemaInternal] The user associated with the token or null if failed.
	###
	userAuthUserFromTokenCallback: (err, user) ->
	###
	Standard callback used by the {UserAuth#createAccount} method to return the status from a user creation operation.
	@param err [Error] An error object if an error occurred or null otherwise.
	@param success [Boolean] True if the operation was successful, false otherwise.
	@param errorCode [Number] A numeric errorCode indicating why the request failed or zero otherwise.
	###
	userAuthCreateAccountCallback: (err, success, errorCode) ->
module.exports = Callbacks