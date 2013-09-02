
var Result = require('result')
var chai = require('./chai')
var wrap = Result.wrap
var sentinel = {}

describe('lift(ƒ)', function(){
	var lift = require('..')
	var ƒ
	beforeEach(function(){
		ƒ = chai.spy(function(num, string, fn){
			num.should.be.a('number')
			string.should.be.a('string')
			fn.should.be.a('function')
		})
	})

	it('should only return Results if it has to', function(){
		lift(Math.pow)(2, 3).should.equal(8)
	})

	it('should resolve arguments before calling `ƒ`', function(){
		lift(ƒ)(
			Result.wrap(4),
			Result.wrap('hello'),
			Result.wrap(function(){}))
		ƒ.should.have.been.called(1)
	})

	it('should handle delayed results', function(done){
		lift(ƒ)(
			delay(4),
			delay('hello'),
			delay(function(){})
		).node(done)
	})

	it('should handle mixed results and values', function(done){
		lift(ƒ)(
			delay(4),
			new Result().write('hello'),
			function(){}
		).node(done)
	})

	describe('correct return value', function(){
		var retValue = {}
		it('when sync', function(){
			lift(identity)(retValue).should.equal(retValue)
		})
		
		it('when delayed', function(done){
			lift(identity)(delay(retValue)).then(function(val){
				val.should.equal(retValue)
			}).node(done)
		})
	})

	describe('with constructors', function(){
		var File = lift(file)
		function file(path, txt){
			this.path = path
			this.text = txt
		}
		function isFile(file){
			file.should.be.an.instanceOf(File)
			file.should.have.property('path', 'a')
			file.should.have.property('text', 'b')
		}
		it('delayed parameters', function(done){
			new File('a', delay('b')).then(isFile).node(done)
		})

		it('normal parameters', function(){
			isFile(new File('a', 'b'))
		})

		it('should share prototypes', function(){
			file.prototype.should.equal(File.prototype)
		})
	})

	describe('Result returning `ƒ`', function(){
		function fun(err, val){
			if (err) return delay(err)
			return delay(null, val)
		}
		it('should be able to lift a Result returning `ƒ`', function(done){
			lift(function(a, b){
				return delay([a, b])
			})(
				delay(1),
				new Result().write('hello')
			).then(function(val){
				val.should.eql([1, 'hello'])
			}).node(done)
		})
	})

	describe('error handling', function(){
		it('should catch synchronous errors', function(done){
			lift(function(){
				throw new Error('fail')
			})().then(null, function(e){
				expect(e).to.have.property('message', 'fail')
				done()
			})
		})

		it('should catch synchronous errors after a delay', function(done){
			lift(function(){
				throw new Error('fail')
			})(delay(1)).then(null, function(e){
				expect(e).to.have.property('message', 'fail')
				done()
			})
		})

		it('should catch async errors', function(done){
			lift(function(){
				return delay(new Error('fail'))
			})().then(null, function(e){
				expect(e).to.have.property('message', 'fail')
				done()
			})
		})

		it('should catch failing arguments', function(done){
			lift(function(a, b){})(
				delay(new Error('fail')),
				delay(4),
				function(){}
			).then(null, function(e){
				expect(e).to.have.property('message', 'fail')
				done()
			})
		})
	})
})

describe('lift-cps(ƒ)', function(){
	var lift = require('../cps')
	it('should write the second arg', function(done){
		lift(function(cb){
			cb(null, sentinel)
		})().then(function(val){
			val.should.equal(sentinel)
		}).node(done)
	})

	it('should error if there is a first arg', function(done){
		lift(function(cb){
			cb(sentinel, sentinel)
		})().then(null, function(err){
			err.should.equal(sentinel)
			done()
		})
	})

	it('should pass arguments as normal', function(done){
		lift(function(a,b,c,cb){
			a.should.equal(1)
			b.should.equal(2)
			c.should.equal(3)
			cb(null, sentinel)
		})(1,2,3).then(function(val){
			val.should.equal(sentinel)
		}).node(done)
	})

	it('should still be able to manipulate the context of the function', function(done){
		lift(function(cb){
			sentinel.should.equal(this)
			cb()
		}).call(sentinel).node(done)
	})

	var fn = lift(function(a,b,c,d,cb){
		a.should.equal(1)
		b.should.equal(2)
		c.should.equal(3)
		d.should.equal(4)
		cb(null, sentinel)
	})

	it('should handle more than 3 args', function(done){
		fn(1,2,3,4).then(function(val){
			val.should.equal(sentinel)
		}).node(done)
	})

	it('should catch sync errors', function(){
		var error = new Error(this.test.title)
		lift(function(){
			throw error
		})().then(null, function(e){
			e.should.equal(error)
		})
	})

	describe('with Result parameter', function(){
		it('should await their value', function(done){
			fn(delay(1), delay(2), 3, delay(4)).then(function(val){
				val.should.equal(sentinel)
			}).node(done)
		})

		it('catch failing parameters', function(done){
			var error = new Error(this.test.title)
			fn(delay(error), delay(2), delay(3), 4).then(null, function(e){
				e.should.equal(error)
				done()
			})
		})

		it('should handle completed results', function(done){
			fn(delay(1), wrap(2), 3, wrap(4)).then(function(val){
				val.should.equal(sentinel)
			}).node(done)
		})
	})
})

describe('decorating expressions', function(){
	var apply = require('../apply')
	var sexpr = require('../sexpr')
	function fn(a,b,c){
		a.should.equal(1)
		b.should.equal(2)
		c.should.equal(3)
	}

	describe('apply', function(){
		var arr = [1,2,3]

		it('should apply arguments to `fn`', function(){
			apply.plain(1,2,3,fn)
			apply(1,2,3,fn)
		})

		it('should maintain `this`', function(done){
			var context = {}
			apply.call(context,1,2,3,function(){
				this.should.equal(context)
				fn.apply(null, arguments)
				done()
			})
		})

		it('should handle Result parameters', function(done){
			apply(delay(1),delay(2),Result.wrap(3),fn).node(done)
		})
	})

	describe('sexpr', function(){
		it('should apply arguments to `fn`', function(){
			sexpr(fn,1,2,3)
		})

		it('should maintain `this`', function(done){
			var context = {}
			sexpr.call(context, function(){
				this.should.equal(context)
				fn.apply(null, arguments)
				done()
			},1,2,3)
		})

		it('should handle Result parameters', function(done){
			sexpr(fn, delay(1), delay(2), Result.wrap(3)).node(done)
		})
	})
})

// don't run in the browser
if (typeof window == 'undefined') describe('fs', function(){
	var fs = require('../fs')
	it('should have all the functions', function(){
		fs.should.have.keys(Object.keys(require('fs')))
	})
	
	it('should special case `fs.exists`', function(done){
		fs.exists(__filename).read(function(yes){
			yes.should.be.true
			done()
		})
	})

	describe('async functions', function(){
		it('success case', function(done){
			fs.stat(__filename).read(function(stat){
				stat.should.be.a('object')
				done()
			})
		})

		it('fail case', function(done){
			fs.stat(__filename + '.nope').read(null, function(e){
				e.should.be.an.instanceOf(Error)
				done()
			})
		})
	})
})

function delay(value){
	var result = new Result
	setTimeout(function () {
		if (value instanceof Error) result.error(value)
		else result.write(value)
	}, Math.random() * 10)
	return result
}

function identity(x){
	return x
}