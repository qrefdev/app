mongoose = require('mongoose')
QRefDatabase = require('../db/QRefDatabase')
async = require('async')
class RecordFilter
	token: null
	user: null
	roles: null
	constructor: (token) ->
		@token = token
	filter: (arrRecords, callback) ->
		arrFilteredRecords = []
		async.forEach(arrRecords,
			(item, cb) =>
				@.retrieve(item, 
					(err, include, rec) ->
						if err?
							cb(err)
							return
						
						if include
							arrFilteredRecords.push(rec)
						
						cb(null)
				)
			,(err) ->
				if err?
					callback(err, [])
					return
				callback(null, arrFilteredRecords)
		)
	retrieve: (record, callback) ->
		callback(null, true, record)
	create: (callback) ->
		callback(null, true)
	update: (record, callback) ->
		callback(null, true, record)
	delete: (record, callback) ->
		callback(null, true, record)
	constrainQuery: (query, callback) ->
		callback(null, query)
	getToken: () -> @token
	getRoles: () -> @roles
	getUser: () -> @user
	isInRole: (roleName) ->
		if not @roles
			return false
			
		return true for r in @roles when r is roleName
		return false
	resolve: (callback) =>
		db = QRefDatabase.instance()
		@roles = []		
		db.AuthToken.where('token')
				.equals(@token)
				.populate('user')
				.findOne((err, tk) =>
					if err?
						callback(err)
						return
					
					if not tk?
						callback(new Error('Token not found'))
						return
					
					@user = tk.user
					
					async.forEach(tk.user.roles, 
						(item, cb) =>
							db.Role.findById(item, 
								(err, role) =>
									if err?
										cb(err)
										return
									
									if not role?
										cb(new Error('Role not found'))
										return
										
									@roles.push(role.roleName)
									cb(null)
							)
						,(err) ->
							if err?
								callback(err)
								return
								
							callback(null)
					)						
					
				)
module.exports = RecordFilter