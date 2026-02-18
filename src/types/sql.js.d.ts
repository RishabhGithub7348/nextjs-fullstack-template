/* eslint-disable @typescript-eslint/no-explicit-any */
declare module "sql.js" {
  interface Database {
    run(sql: string, params?: unknown[]): Database;
    exec(sql: string, params?: unknown[]): QueryExecResult[];
    export(): Uint8Array;
    close(): void;
  }

  interface QueryExecResult {
    columns: string[];
    values: unknown[][];
  }

  interface SqlJsStatic {
    Database: new (data?: ArrayLike<number> | Buffer | null) => Database;
  }

  export type { Database, SqlJsStatic, QueryExecResult };

  export default function initSqlJs(
    config?: Record<string, unknown>
  ): Promise<SqlJsStatic>;
}
