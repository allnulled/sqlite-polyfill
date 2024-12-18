(function (factory) {
  const mod = factory();
  if (typeof window !== 'undefined') {
    window["SQLitePolyfill"] = mod;
  }
  if (typeof global !== 'undefined') {
    global["SQLitePolyfill"] = mod;
  }
  if (typeof module !== 'undefined') {
    module.exports = mod;
  }
})(function () {

  class SQLitePolyfill {
    constructor() {
      this.db = null;
      this.isBrowser = typeof window !== 'undefined';
    }

    async init(dbName = ':memory:', wasm_path = "$filename") {
      if (this.isBrowser) {
        if (!window.initSqlJs) {
          throw new Error("sql.js is required in the browser. Make sure it's loaded.");
        }
        const SQL = await window.initSqlJs({
          locateFile: function (filename) {
            return wasm_path.replace("$filename", filename);
          }
        });
        this._loadFromLocalStorage(SQL);
      } else {
        const sqlite3 = require("sqlite3");
        this.db = new sqlite3.Database(dbName, (err) => {
          if (err) {
            throw new Error(`Failed to open database: ${err.message}`);
          }
        });
      }
    }

    run(query, params = []) {
      if (this.isBrowser) {
        this._ensureDbInitialized();
        const statement = this.db.prepare(query);
        statement.bind(params);
        while (statement.step()) {
          // No-op for run in browser
        }
        statement.free();
        return Promise.resolve();
      } else {
        return new Promise((resolve, reject) => {
          this.db.run(query, params, function (err) {
            if (err) {
              reject(err);
            } else {
              resolve(this);
            }
          });
        });
      }
    }

    all(query, params = []) {
      if (this.isBrowser) {
        this._ensureDbInitialized();
        const results = [];
        const statement = this.db.prepare(query);
        statement.bind(params);
        while (statement.step()) {
          results.push(statement.getAsObject());
        }
        statement.free();
        this._persistToLocalStorage();
        return Promise.resolve(results);
      } else {
        return new Promise((resolve, reject) => {
          this.db.all(query, params, (err, rows) => {
            if (err) {
              reject(err);
            } else {
              resolve(rows);
            }
          });
        });
      }
    }

    get(query, params = []) {
      if (this.isBrowser) {
        return this.all(query, params).then((results) => results[0] || null);
      } else {
        return new Promise((resolve, reject) => {
          this.db.get(query, params, (err, row) => {
            if (err) {
              reject(err);
            } else {
              resolve(row);
            }
          });
        });
      }
    }

    close() {
      if (this.isBrowser) {
        this._ensureDbInitialized();
        this.db.close();
        this.db = null;
        return Promise.resolve();
      } else {
        return new Promise((resolve, reject) => {
          this.db.close((err) => {
            if (err) {
              reject(err);
            } else {
              resolve();
            }
          });
        });
      }
    }

    _ensureDbInitialized() {
      if (!this.db) {
        throw new Error("Database is not initialized. Call 'init()' first.");
      }
    }

    // Método para cargar la base de datos desde localStorage
    _loadFromLocalStorage(SQL) {
      const savedDb = localStorage.getItem(this.localStorageKey);
      if (savedDb) {
        const buffer = Uint8Array.from(atob(savedDb), c => c.charCodeAt(0));
        this.db = new SQL.Database(buffer);
      } else {
        this.db = new SQL.Database();
      }
    }

    // Método para persistir la base de datos en localStorage
    _persistToLocalStorage() {
      const dbData = this.db.export();  // Exportar la base de datos
      const dbString = btoa(String.fromCharCode.apply(null, new Uint8Array(dbData)));  // Convertir a base64
      localStorage.setItem(this.localStorageKey, dbString);  // Guardar en localStorage
    }

  }

  return SQLitePolyfill;

});