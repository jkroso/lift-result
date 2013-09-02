
var resultify = global.implementation
var fn = resultify(require('./.fn.js'))
var Result = require('result')
var wrap = Result.wrap

module.exports = function(i, done){
	fn(wrap(1), wrap(2)).read(done)
}