
module.exports = function(){
	switch (arguments.length) {
		case 2: return arguments[arguments.length - 1](arguments[0])
		case 3: return arguments[arguments.length - 1](arguments[0], arguments[1])
		case 4: return arguments[arguments.length - 1](arguments[0], arguments[1], arguments[2])
		default:return arguments[--arguments.length].apply(null, arguments)
	}
}
