
var call = Function.call

module.exports = function(fn){
	var ƒ = fn
	fn = this // variable declared in Arguments are magical
	return call.apply(ƒ, arguments)
}
