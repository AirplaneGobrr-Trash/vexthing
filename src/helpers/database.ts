import { BunORM } from "bunorm";

const db = new BunORM("db.sqlite", {
  tables: {
    roles: {
      columns: {
        name: {
          type: "TEXT",
        },
      },
    },
    users: {
      columns: {
        username: {
          type: "TEXT",
        },
        password: {
          type: "TEXT",
        },
        lastOnline: {
          type: "JSON",
          // Value doesn't matter since we only need
          // it to infer the type
          customDataType: {} as Date,
        },
        roles: {
          type: "REL",
          table: "roles",
        },
      },
      mw: {
        get: [
          (item: any) =>
            Object.assign(item, { lastOnline: new Date(item.lastOnline) }),
        ],
      },
      fx: {
        checkPassword: (item: any, pw: string) => "123" + pw === item.password,
        hashPassword: (item: any) => {
          // Please use bcrypt or something similar instead of this
          // This code is made just for this example and should not be used
          // since it's super unsafe
          item.password = "123" + item.password;
          return item;
        },
      },
    },
  },
});