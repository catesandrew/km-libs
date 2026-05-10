# km-libs

Shared Node.js utility library for [Keyboard Maestro](https://www.keyboardmaestro.com/) macros on macOS. Migrated from TextExpander JavaScript snippet libraries.

## Setup

```bash
cd ~/.km-libs
npm install
```

## Usage

In a Keyboard Maestro **Execute Shell Script** action:

```bash
#!/bin/bash
pbpaste | node <<'KMSCRIPT'
const te = require(process.env.HOME + '/.km-libs/te-utils');
const _ = te._;
const input = te.readStdin().trim();

// Transform the input
const result = _.kebabCase(input);
process.stdout.write(result);
KMSCRIPT
```

Set the action's output to **Paste** to replace selected text with the result.

## Exported Functions

### Lodash

- `te._` — Full [lodash](https://lodash.com/docs) library (`_.kebabCase`, `_.snakeCase`, `_.camelCase`, `_.deburr`, `_.trim`, etc.)

### String Case Conversion

| Function | Description | Example |
|----------|-------------|---------|
| `decamelize(str, sep)` | camelCase to separated | `"fooBar"` → `"foo_bar"` |
| `humanizeString(str)` | Machine string to human | `"foo_bar"` → `"Foo bar"` |
| `toTitleCase(str)` | Strict title case | `"the quick fox"` → `"The Quick Fox"` |
| `toLaxTitleCase(str)` | Lax title case (more prepositions kept lowercase) | `"the fox in the hat"` → `"The Fox in the Hat"` |
| `camelize(str, decap)` | To camelCase | `"foo-bar"` → `"fooBar"` |
| `dasherize(str)` | CamelCase to kebab | `"FooBar"` → `"foo-bar"` |
| `underbarize(str)` | CamelCase to UPPER_SNAKE | `"FooBar"` → `"FOO_BAR"` |
| `titlecase(str, cap)` | Words to title spacing | `"foo_bar"` → `"Foo Bar"` |

### String Utilities

| Function | Description |
|----------|-------------|
| `capitalizeFn(str)` | Capitalize first character |
| `decapitalizeFn(str)` | Lowercase first character |
| `makeStringFn(obj)` | Safely convert to string |
| `unescapeHbs(str)` | Unescape Handlebars special chars |

### Clipboard / IO

| Function | Description |
|----------|-------------|
| `readStdin()` | Read stdin (for piped input via `pbpaste \|`) |
| `getClipboard()` | Read macOS clipboard directly via `pbpaste` |

### Date Helpers

| Function | Description |
|----------|-------------|
| `getNextDay(day, reset)` | Get next occurrence of a weekday (`"mon"`, `"fri"`, etc.) |
| `Date.prototype.strftime(fmt)` | C-style strftime formatting (`%Y-%m-%d %H:%M`) |

### Miscellaneous

| Function | Description |
|----------|-------------|
| `plur(str, count)` | Simple English pluralization |
| `parseMs(ms)` | Parse milliseconds into `{days, hours, minutes, seconds}` |
| `uid(len)` | Generate random alphanumeric ID |

## Origin

These utilities were originally embedded as JavaScript snippets inside TextExpander (circa 2015-2020), using TextExpander's `%snippet:javascriptXxx%` system to share code across macros. They've been consolidated into this single module for use with Keyboard Maestro's shell script actions.

## License

MIT
