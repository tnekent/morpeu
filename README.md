# Morpeu
## Format strings like you're the boss
Morpeu brings [Python's](https://www.python.org) `format()` function to JavaScript, with tweaks to make your expressions and intentions clearer.

## Example
```js
const morph = require("morpeu");

morph("This is {.name}", { name: "Morpeu" }); // => This is Morpeu
morph("--{1|2}{0}", "Bar", "Foo"); // => FooBar
morph("{|i} = {|f}", "Bar", "Foo"); // => FooBar
```

## Format Rules Language
```
"{" [arg_index] ( "[" bracket_prop "]" | "." dot_prop )* "|" [padding] ["." precision] [mod] "}"
```
Where:
* `arg_index`: A number specifying the index of the argument in the argument list.
* `bracket_prop`: A string of characters not including "]" to specify a property.
* `dot_prop`: A string of a valid JavaScript identifier to specify a property.
* `padding`: A positive number for specifying the padding amount to be applied.
* `precision`: A positive number for specifying the precision amount to be applied.
* `mod`: See [Modifiers](#Modifiers).
The delimiter pipe ("|") is similar to to the colon of Python's.

## Modifiers
| Modifier | Description |
| -------- | ----------- |
| `s` | Modifier for strings. A specified precision n slices the string to n characters. |
| `i` | Modifier for integers. Does not support precision. |
| `f` | Modifier for floats. Precision handles the amount of digits after the dot, putting 0 when necessary. Default precision is 6. |

## Contributing
Morpeu is still in its early stages. It would be a lot of help to mention bugs and suggest features to <https://github.com/tnekent/morpeu>.
