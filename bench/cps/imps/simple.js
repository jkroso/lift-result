
var Result = require('result')
var read = Result.read

module.exports = function(fn){
	return function(){
		var result = new Result
		var i = arguments.length
		var args = arguments

		function fail(e){ result.error(e) }

		function cb(error, value){
			if (error) result.error(error)
			else result.write(value)
		}

		read(args[i], function next(value){
			args[i] = value
			if (i > 0) return read(args[--i], next, fail)
			args[args.length++] = cb
			try { fn.apply(null, args) }
			catch (e) { result.error(e) }
		}, fail)

		return result
	}
}
