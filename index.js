
var ResultType = require('result-type')
var Result = require('result')
var failed = Result.failed
var read = Result.read

/**
 * decorate `ƒ` so it can receive Results as arguments
 *
 * @param {Function} ƒ
 * @return {Function}
 */

module.exports = function(ƒ){
	if (ƒ.prototype) decorated.prototype = ƒ.prototype
	decorated.plain = ƒ
	function decorated(){
		var i = arguments.length

		// scan for Results
		while (i--) if (arguments[i] instanceof ResultType) {
			var self = this
			var args = arguments
			var result = new Result
			var fail = function(e){
				result.error(e)
			}
			var next = function(value){
				args[i] = value
				if (i) return read(args[--i], next, fail)

				// run ƒ
				try { value = ƒ.apply(self, args) }
				catch (e) { return result.error(e)}

				if (value === undefined && self instanceof decorated) {
					result.write(self)
				} else if (value instanceof ResultType) {
					value.read(function(value){
						result.write(value)
					}, fail)
				} else {
					result.write(value)
				}
			}
			args[i].read(next, fail)
			return result
		}

		try { result = ƒ.apply(this, arguments) }
		catch (e) { return failed(e) }
		// used as a constructor
		return result === undefined && this instanceof decorated
			? this
			: result
	}
	return decorated
}