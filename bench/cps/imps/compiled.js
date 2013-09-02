
var ResType = require('result-type')
var Result = require('result')
var when = Result.read

module.exports = function(fn){
	var args = 'abcdefgh'
		.split('')
		.slice(0, fn.length - 1)
		.join(', ')

	var ƒ = decorated.toString()
		.replace(/decorated/, 'resultified_' + fn.name)
		.replace('()', '(' + args + ')')
		.replace(/params/g, 'self, '+ args + ', cb')

	return eval('(' + ƒ + ')')

	function decorated(){
		var result = new Result
		var i = arguments.length

		// scan for Result parameters
		while (i--) if (arguments[i] instanceof ResType) {
			var args = arguments
			var fail = function(e){
				result.error(e)
			}
			var self = this
			var next = function(value){
				args[i] = value
				if (i > 0) return when(args[--i], next, fail)
				try { fn.call(params) }
				catch (e) { result.error(e) }
			}
			args[i].read(next, fail)
			return result
		}

		try { fn.call(params) }
		catch (e) { result.error(e) }

		function cb(error, value){
			if (error) result.error(error)
			else result.write(value)
		}

		return result
	}
}