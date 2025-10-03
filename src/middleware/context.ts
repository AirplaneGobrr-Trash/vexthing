import type { Handler } from "../types/bunrest";
import Handlebars from "express-handlebars";

import path from "path";

const hbs = new Handlebars.ExpressHandlebars({
    helpers: {
        "gt": (a: number,b: number, options: any)=>{
            // console.log(a,b, a > b)
            return (a > b) ? options.fn(this) : options.inverse(this);
        },
        "timeTill": (a: string) => {
            return (((new Date(a).valueOf() - new Date().valueOf()) / 1000) / 60).toFixed(2);
        }
    }
});

// This is the best thing EVER!
export const contextAdder: Handler = async (req, res, next) => {
    req.revTime = performance.now();

    const originalSend = res.send;

    res.send = function (body: any): any {
        const elapsed = performance.now() - req.revTime;
        console.log(`Response (${req.originalUrl}) time:`, elapsed, "ms");

        // keep res context intact
        return originalSend.call(this, body);
    };

    res.renderRaw = async (sheet, options = {}) => {
        let renderView = await hbs.render(path.join(__dirname, "..", "views", `${sheet}.handlebars`), {
            ...res.locals,
            ...options
        })

        return renderView;
    };

    res.render = async (sheet, options = {}) => {
        res.setHeader("Content-Type", "text/html");
        let renderView = await res.renderRaw(sheet, options);
        res.send(renderView);
    };
    
    req.added = true;
    res.locals = {};
    next?.();
}