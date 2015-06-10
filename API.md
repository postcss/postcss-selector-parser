# API Documentation

*Please use only this documented API when working with the parser. Methods
not documented here are subject to change at any point.*

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

## Node types

### `node.type`

A string representation of the selector type. It can be one of the following;
`attribute`, `class`, `combinator`, `comment`, `id`, `pseudo`, `root`,
`selector`, `tag`, or `universal`.

```js
parser.attribute({attribute: 'href'}).type;
// => 'attribute'
```

### `node.parent`

Returns the parent node.

```js
root.nodes[0].parent === root;
```

### `node.toString()`, `String(node)`, or `'' + node`

Returns a string representation of the node.

```js
var id = parser.id({value: 'search'});
console.log(String(id));
// => #search
```

### `node.next()` & `node.prev()`

Returns the next/previous child of the parent node.

```js
var next = id.next();
if (next && next.type !== 'combinator') {
    throw new Error('Qualified IDs are not allowed!');
}
```

### `node.removeSelf()`

Removes the node from its parent node.

```js
if (node.type === 'id') {
    node.removeSelf();
}
```


