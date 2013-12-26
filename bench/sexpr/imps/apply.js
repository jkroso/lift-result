
var call = Function.call

module.exports = function(){
	var fn = arguments[0]
	arguments[0] = this
	return call.apply(fn, arguments)
}
