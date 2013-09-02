
var apply = global.implementation

module.exports = function(i){
	apply(1,2,3,add)
}

function add(a,b,c){
	return a + b + c
}