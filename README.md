# sqlite-polyfill

Use [sqlite3](https://www.npmjs.com/package/sqlite3) on Node.js and [sql.js](https://sql.js.org/#/?id=usage) on browser, through the same API.

## Installation

```sh
npm install -s @allnulled/sqlite-polyfill
```

## Load

**First, if you have doubts, take a look to the `test/test.js` file, which works on both environments, but see also `test/index.html` for the browser implementation. You'll see this explanation in action.**

So, despite the API is the same for both environments, there are some differences you must take care of on the load step.

In Node.js, with this conditional you can patch on browser, and set to global scope on node.js:

```js
if(typeof global !== "undefined") {
    require(__dirname + "/../sqlite-polyfill.js");
}
```

In browser, though, you have to load the polyfill as script tag, and the [sql.js](https://sql.js.org) with its **wasm** file like so:

```html
<script src="sqljs-wasm/sql-wasm.js"></script>
<script src="sqlite-polyfill/sqlite-polyfill.js"></script>
```

Then, you will have to copy the following files and integrate them in your HTML, in this same order:
- `test/sqljs-wasm/sql-wasm.js`
- `test/sqljs-wasm/sql-wasm.wasm` (not included by script, but by API `init` method)
- `test/sqlite-polyfill/sqlite-polyfill.js`


## Usage

The last conflictive point is the `init` function, which takes parameters for both environments.

```js
const db = new SQLitePolyfill();
// @ATTENTION!
//   - In browser, 1st parameter is the key in localStorage
//   - In node.js, 2nd parameter is ignored. See this path is relative to where you put the `test/sqljs-wasm/sql-wasm.wasm`
await db.init('example.db', "sqljs-wasm/$filename");

await db.run("CREATE TABLE IF NOT EXISTS test (id INTEGER PRIMARY KEY, name TEXT)");
await db.run("INSERT INTO test (name) VALUES (?)", ["Alice"]);

const rows = await db.all("SELECT * FROM test");
console.log(rows);

await db.close();
```

## Use cases

This library can be useful to create (1) cross-environment (2) database-oriented scripts (3) based on SQL/SQLite.

## Extra features

The polyfill comes with some extra advantages that the libraries may not come. For example:

- Persistence for both
   - patched using localStorage in browser
   - the localStorage ID is directly the same name of the file. For now I don't see any problem about this.