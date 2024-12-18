(async () => {
  if(typeof global !== "undefined") {
    require(__dirname + "/../sqlite-polyfill.js");
  }
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
})();