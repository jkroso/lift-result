
var ResType = require('result-type')
var Result = require('result')
var when = Result.read

module.exports = function(fn){
	return function () {
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
				// call `fn` (apply is slow)
				try { switch (args.length) {
					case 0: fn.call(self, cb); break;
					case 1: fn.call(self, args[0], cb); break;
					case 2: fn.call(self, args[0], args[1], cb); break;
					case 3: fn.call(self, args[0], args[1], args[2], cb); break;
					default:
						args[args.length++] = cb
						fn.apply(self, args)
				} } catch (e) { result.error(e) }
			}
			args[i].read(next, fail)
			return result
		}

		// call `fn` (apply is slow)
		try { switch (arguments.length) {
			case 0: fn.call(this, cb); break;
			case 1: fn.call(this, arguments[0], cb); break;
			case 2: fn.call(this, arguments[0], arguments[1], cb); break;
			case 3: fn.call(this, arguments[0], arguments[1], arguments[2], cb); break;
			default:
				arguments[arguments.length++] = cb
				fn.apply(this, arguments)
		} } catch (e) { result.error (e) }

		function cb(error, value){
			if (error) result.error(error)
			else result.write(value)
		}

		return result
	}
}