
var Result = require('result')
var http = require('http')
var lift = require('..')
var filter = lift(Function.call.bind([].filter))
var each = lift(Function.call.bind([].forEach))

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

var jkroso = filter(components, function(json){
	return json
		&& typeof json.repo == 'string'
		&& /jkroso\/(.+)/.test(json.repo)
})

each(jkroso, function(json){
	console.log(json.name)
})