import type { BunRequest } from "@airplanegobrr/bunrest/src/server/request";
import type { BunResponse } from "@airplanegobrr/bunrest/src/server/response";
import type { Handler } from "@airplanegobrr/bunrest/src/server/request";
import type { Router } from "@airplanegobrr/bunrest/src/router/router";
import type { BunServer } from "@airplanegobrr/bunrest/src/server/server";


interface BunRequest extends BunRequest {}
interface BunResponse extends BunResponse {}
interface Handler extends Handler {}
interface Router extends Router {}
interface BunServer extends BunServer {}