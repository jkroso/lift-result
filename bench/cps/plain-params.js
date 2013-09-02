
var resultify = global.implementation
var fn = resultify(require('./.fn.js'))

module.exports = function(i, done){
	fn(1,2).read(done)
}