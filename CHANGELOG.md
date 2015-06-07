# *current*

* Tidy up redundant duplication.
* Fixes a bug where the parser would loop infinitely on universal selectors
  inside pseudo selectors.
* Adds `length` getter and `eachInside`, `map`, `reduce` to the container class.
* When a selector has been removed from the tree, the root node will no longer
  cast it to a string.
* Adds node type iterators to the container class (e.g. `eachComment`).
* Adds filter function to the container class.

---

# 0.0.3

* Adds `next` and `prev` to the node class.
* Adds `first` and `last` getters to the container class.
* Adds `every` and `some` iterators to the container class.
* Add `empty` alias for `removeAll`.
* Combinators are now types of node.
* Fixes the at method so that it is not an alias for `index`.
* Tidy up creation of new nodes in the parser.
* Refactors how namespaces are handled for consistency & less redundant code.
* Refactors AST to use `nodes` exclusively, and eliminates excessive nesting.
* Fixes nested pseudo parsing.
* Fixes whitespace parsing.

# 0.0.2

* Adds support for namespace selectors.
* Adds support for selectors joined by escaped spaces - such as `.\31\ 0`.

# 0.0.1

* Initial release.
