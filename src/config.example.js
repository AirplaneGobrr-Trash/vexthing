let fillers = {
    consistent: {
        values: [
            {name: "low", value:10},
            {name: "low-mid", value:20},
            {name: "low-high", value:30},
            {name: "mid-low", value:40},
            {name: "mid", value:50},
            {name: "mid-high", value:60},
            {name: "high-low", value:70},
            {name: "high-mid", value:80},
            {name: "high", value:90},
            {name: "god", value:100}
        ],
        type: "number"
    },
    speeds: {
        start: 50,
        end: 1200,
        step: 50,
        type: "number"
    }
}

for (let elm in fillers) {
    let info = fillers[elm]
    if (info.start && info.end && info.step) {
        info.values ??= []
        for (let index = info.start; index < info.end; index+=info.step) {
            info.values.push({ name: index, value: index })
        }
    }
}

console.log(JSON.stringify(fillers, null, 2))

module.exports = {
    sections: {
        DriveTrain: {
            elements: {
                speed: fillers.speeds
            }
        },
        Intake: {
            elements: {
                type: [
                    {name: "flex", value:1},
                    {name: "hooks", value:2}
                ],
                consistent: fillers.consistent,
                speed: fillers.speeds
            },
            type: "boolean"
        },
        "2Bar": {
            type: "boolean",
            elements: {
                speed: fillers.speeds,
                consistent: fillers.consistent
            }
        },
        Sweeper: {
            type: "boolean",
            elements: {
                consistent: fillers.consistent
            }
        },
        Hang: {
            type: "boolean",
            elements: {
                consistent: fillers.consistent,
                level: {
                    values: [
                        { name: "L1", value:1 },
                        { name: "L2", value:2 },
                        { name: "L3", value:3 }
                    ]
                }
            }
        }
    }
}