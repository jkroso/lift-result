
/**
 * decorating functions before you use them isn't always
 * practical. for example when creating functions on the fly as
 * arguments to higher order functions. For this case its sometimes
 * nicer to use `apply` or `apply.sexpr`. "sexpr" means s-expression
 * which are whats used in lisp. Unfortunatly that means your code
 * starts to look a bit like lisp but hey it a good option to have
 */

var filter = Function.call.bind([].filter)
var each = Function.call.bind([].forEach)
var Result = require('result')
var s = require('../sexpr')
var http = require('http')

var components = new Result

http.get('http://component.io/components/all', function(res){
	var json = ''
	res.on('readable', function(){
		json += res.read() || ''
	}).on('end', function(){
		try { json = JSON.parse(json) }
		catch (e) { return components.error(e) }
		components.write(json)
	})
})

var jkroso = s(filter, components, function(json){
	return json
		&& typeof json.repo == 'string'
		&& /jkroso\/(.+)/.test(json.repo)
})

s(each, jkroso, function(json){
	console.log(json.name)
})