
# lift-result

  lift functions so they can handle [results](//github.com/jkroso/result) as if they were plain values.

## Installation

_With [packin](//github.com/jkroso/packin) or [component](//github.com/component/component)_

	$ packin add jkroso/lift-result

then in your app:

```js
var lift = require('lift-result')
```

## API

### lift(fn)

  decorate `fn` so it can receive Results as arguments

```js
var add = lift(function(a, b){
  return a + b
})
add(1, 2) // => 3
add(Result.wrap(1), 2) // => Result(3)
```

### cps(fn)

  decorate a node function so it can reciece Results as arguments and will return a result rather than take a callback as its last argument.

```js
var readFile = resultify(fs.readFile)
readFile('/path/to/file.js', 'utf8').read(console.log)
```

### apply(..., fn)

  apply arguments to the last argument

### sexpr(fn, ...)

  apply rest of args to `fn`

## Running the tests

Just run `make` and navigate your browser to the test directory.
