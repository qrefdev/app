class AjaxResponse
	total: 0
	records: []
	success: true
	message: null
	mode: 'ajax'
	errorCode: 0
	constructor: () -> 
		@.reset()
	setTotal: (value) -> @total = value
	addRecord: (r) -> 
		@records.push(r)
		@records.length
	addRecords: (arr) ->
		@records = @records.concat(arr)
		@records.length
	reset: () ->
		@records = []
		@message = null
		@success = true
		@mode = 'ajax'
		@errorCode = 0
		@total = 0
		@records.length
	getLength: () -> @records.length
	failure: (reason, errorCode) -> 
		@message = reason
		@errorCode = errorCode
		@success = false
	