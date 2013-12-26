
module.exports = function(){
	return arguments[--arguments.length].apply(this, arguments)
}
