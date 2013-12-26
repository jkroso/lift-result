
var call = Function.call

module.exports = function(){
	return call.apply(arguments[0], arguments)
}
