// index.js:
const { app, express, http, io, server, twing } = require('./web')
const api = require("./api")

app.get('/', (req, res) => {
    twing.render("team.html", {}).then(out=>res.send(out))
});

let cache = null

app.get("/data", async (req, res)=>{
    if (!cache) cache = await api.getMatches(53579, 1, [139679])
    res.send(cache)
})

server.listen(3000, () => {
  console.log('listening on *:3000');
});
//<script src='/socket.io/socket.io.js'></script>