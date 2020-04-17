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

const where = ["in", "home"];
const what = "healthy";
morph("Stay {0[0]}, stay {0[1]}, stay {1}.", where, what);
// => Stay in, stay home, stay healthy.
```

## Format Rules Language
```
"{" [arg_index] ( "[" bracket_prop "]" | "." dot_prop )* "|" [align] [sign] [padding] ["." precision] [mod] "}"
```
Where:
* `arg_index`: A number specifying the index of the argument in the argument list.
* `bracket_prop`: A string of characters not including "]" to specify a property.
* `dot_prop`: A string of a valid JavaScript identifier to specify a property.
* `align`: Controls the alignment of the output when padding is specified.
   * `>`: Right aligns the output. Default for most types.
   * `<`: Left aligns the output. Default for numbers (integers and floats).
   * `^`: Center aligns the output. If specified `padding` is odd, the extra space is applied to the left.
* `sign`: Controls the placement of signs in numbers. Only valid for integer and float type modifiers.
   * `+`: Prepend a plus sign before positive numbers and a minus sign before negative numbers.
   * `-`: Don't prepend anything on positive numbers but prepend a minus sign before negative numbers. The default behavior.
   * <space>: Prepend a space before positive numbers and a minus sign before negative numbers.
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
| `s` | Modifies strings as is. The default when no modifier is specified and the argument is of string type. |

2. Integer type

A specified precision results in an error.

| Modifier | Description |
| -------- | ----------- |
| `i` | Modifies argument as is. The default when no modifier is specified and the argument is of integer type. |
| `c` | Interprets the argument as a UTF-16 code unit, and transforms it to the corresponding character. |
| `b` | Modifies argument to binary. |
| `o` | Modifies argument to octal. |
| `x` | Modifies argument to hexadecimal. Outputs letters in lowercase. |
| `X` | Same as `x`, but output letters as uppercase.  |

3. Float type

Float types support both floats and integers (which are transformed into floats).
Precision indicates the number of decimal digits after the dot. Default precision is 6.

| Modifier | Description |
| -------- | ----------- |
| `f` | Modifies float to fixed-point form. |
| `g` | Modifies float by a series of steps: the argument is transformed to scientific notation with precision "p" to get "exp", the exponent of the value. If `-4 <= exp < p`, format the original argument like with modifier `f` with precision "p". Else, format the argument like with modifier `e` with precision "p". In either case, the result is stripped off of insignificant trailing zeroes, and the decimal point if no digits follow it. The default when no modifier is specified and the argument is of float type. |
| `e` | Modifies float to scientific notation using _e_ as exponent indicator. |
| `E` | Same as `e` but use _E_ as exponent indicator. |
| `%` | Modifies float by multiplying by 100, transforming to fixed-point form, and appending a %. |

4. Any type

Any type accepts any valid JavaScript value. A specified precision results in a error.

| Modifier | Description |
| -------- | ----------- |
| `j` | Modifies argument to JSON. |

## Disclaimer
NodeJS already has a format function `format()` from module `util`, and if your aim is simple debugging, then `util.format` (used internally by `console.log`) can satisfy you in these circumstances. But when you want easy padding and the likes, then Morpeu is for you.

## Contributing
Morpeu is still in its early stages. It would be a lot of help to mention bugs and suggest features to <https://github.com/tnekent/morpeu>.
