
var resultify = global.implementation
var fn = resultify(require('./.fn.js'))
var Result = require('result')

module.exports = function(i, done){
	fn(delay(1), delay(2)).read(done)
}

function delay(value){
	var result = new Result
	setImmediate(function () {
		result.write(value)
	})
	return result
}