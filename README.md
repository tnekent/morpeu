# Morpeu
## Format strings like you're the boss
Python has `format()`, C languages have `printf()`, Go has `fmt.Printf()`, and it's time for JavaScript to join in too.

Morpeu aims to bring exceptional string formatting to JavaScript. It is inspired by Python's `format()`, but with additional tweaks and features to make it powerful and customizable.

## Example
```js
const morph = require("morpeu");

morph("This is {.name}.", { name: "Morpeu" }); // => This is Morpeu.
morph("Format {1} like a {0[like-what]}", { "like-what": "boss" }, "strings");
    // => Format strings like a boss
```

## Format Rules Language
```
"{" [arg_index] ( "[" bracket_prop "]" | "." dot_prop )* "|" [align] [padding] ["." precision] [mod] "}"
```
Where:
* `arg_index`: A number specifying the index of the argument in the argument list.
* `bracket_prop`: A string of characters not including "]" to specify a property.
* `dot_prop`: A string of a valid JavaScript identifier to specify a property.
* `align`: Controls the alignment of the output when padding is specified.
   * `>`: Right aligns the output. Default for most types.
   * `<`: Left aligns the output. Default for numbers (integers and floats).
   * `^`: Center aligns the output. If specified `padding` is odd, the extra space is applied to the left.
* `padding`: A positive number for specifying the padding amount to be applied.
* `precision`: A positive number for specifying the precision amount to be applied.
* `mod`: See [Modifiers](#Modifiers).
The delimiter pipe ("|") is similar to to the colon (:) of Python's.

## Modifiers
Modifiers has four types according to the argument they accept and modify.

1. String type

Precision indicates the length of the string.

| Modifier | Description |
| -------- | ----------- |
| `s` | Modifier for strings. The default when no modifier is specified and the argument is of string type. |

2. Integer type

A specified precision results in an error.

| Modifier | Description |
| -------- | ----------- |
| `i` | Modifier for integers. The default when no modifier is specified and the argument is of integer type. |
| `b` | Modifies integers to binary. |
| `o` | Modifies integers to octal. |
| `x` | Modifies integers to hexadecimal. Outputs letters in lowercase. |
| `X` | Same as `x`, but output letters as uppercase.  |

3. Float type

Precision indicates the number of decimal digits after the dot.

| Modifier | Description |
| -------- | ----------- |
| `f` | Modifier for floats. The default when no modifier is specified and the argument is of float type. |

4. Any type

Any type accepts any valid JavaScript value. A specified precision results in a error.

| Modifier | Description |
| -------- | ----------- |
| `j` | Modifies argument to JSON. |

## Disclaimer
NodeJS already has a format function `format()` from module `util`, and if your aim is simple debugging, then `util.format` (used internally by `console.log`) can satisfy you in these circumstances. But when you want easy padding and the likes, then Morpeu is for you.

## Contributing
Morpeu is still in its early stages. It would be a lot of help to mention bugs and suggest features to <https://github.com/tnekent/morpeu>.
