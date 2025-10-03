
import path from "path";
import bunrest from "@airplanegobrr/bunrest"
export const staticRouter = bunrest().router()

staticRouter.get("/:type/:file", async (req, res) => {
    let filePath = path.join(__dirname, "..", "public", req.params?.type, req.params?.file);
    let bunFile = Bun.file(filePath);

    if (!await bunFile.exists()) return res.status(404).statusText("Not found").send("Not found.");

    res.setHeader("Content-Type", bunFile.type)
    res.send(await bunFile.text());
});
