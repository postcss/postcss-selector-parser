# API Documentation

## `parser` function

This is the module's main entry point.

```js
var parser = require('postcss-selector-parser');
```

### `parser(transform)`

```js
var transform = function (selectors) {
    selectors.eachUniversal(function (selector) {
        selector.removeSelf();
    });
};

var result = parser(transform).process('*.class').result;
// => .class
```

Arguments:

* `transform (function)`: Provide a function to work with the parsed AST.

### `parser.attribute([props])`

Creates a new attribute selector.

```js
parser.attribute({attribute: 'href'});
// => [href]
```

Arguments:

* `props (object)`: The new node's properties.

### `parser.className([props])`

Creates a new class selector.

```js
parser.className({value: 'button'});
// => .button
```

Arguments:

* `props (object)`: The new node's properties.

### `parser.combinator([props])`

Creates a new selector combinator.

```js
parser.combinator({value: '+'});
// => +
```

Arguments:

* `props (object)`: The new node's properties.

### `parser.comment([props])`

Creates a new comment.

```js
parser.comment({value: '/* Affirmative, Dave. I read you. */'});
// => /* Affirmative, Dave. I read you. */
```

Arguments:

* `props (object)`: The new node's properties.

### `parser.id([props])`

Creates a new id selector.

```js
parser.id({value: 'search'});
// => #search
```

Arguments:

* `props (object)`: The new node's properties.

### `parser.pseudo([props])`

Creates a new pseudo selector.

```js
parser.pseudo({value: '::before'});
// => ::before
```

Arguments:

* `props (object)`: The new node's properties.

### `parser.root([props])`

Creates a new root node.

```js
parser.root();
// => (empty)
```

Arguments:

* `props (object)`: The new node's properties.

### `parser.selector([props])`

Creates a new selector node.

```js
parser.selector();
// => (empty)
```

Arguments:

* `props (object)`: The new node's properties.

### `parser.tag([props])`

Creates a new tag selector.

```js
parser.tag({value: 'button'});
// => button
```

Arguments:

* `props (object)`: The new node's properties.

### `parser.universal([props])`

Creates a new universal selector.

```js
parser.universal();
// => *
```

Arguments:

* `props (object)`: The new node's properties.
