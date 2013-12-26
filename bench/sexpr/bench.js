
var s = global.implementation

module.exports = function(i){
	s(add,1,2,3)
}

function add(a,b,c){
	return a + b + c
}