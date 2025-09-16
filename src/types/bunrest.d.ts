import type { BunRequest } from "bunrest/src/server/request";
import type { BunResponse } from "bunrest/src/server/response";
import type { Handler } from "bunrest/src/server/request";
import type { Router } from "bunrest/src/router/router";
import type { BunServer } from "bunrest/src/server/server";


interface BunRequest extends BunRequest {}
interface BunResponse extends BunResponse {}
interface Handler extends Handler {}
interface Router extends Router {}
interface BunServer extends BunServer {}