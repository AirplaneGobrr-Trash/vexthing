# Vex Scouting

This is an app that helps with scouting!

This app was built for the 2023-2024 Vex game (Over Under)


# Plans

- [ ] Division selector
- [ ] Make diff database per game season
- [ ] Make it so you can easily change the layout of the data (Will save to game database so you can switch between games)

Example: ```json
{
    "Intake": Boolean,
    "Cata": [
        "Arm", "Flywheel", "Other"
    ],
    "Auton": {
        "Far": Boolean,
        "Close": Boolean
    },
    "Hang": {
        "Passive": Boolean,
        "Break": Boolean
    },
    "Notes": String
}
```

(The Cata is in an array, this would make it a drop down menu, if its in an object (like the hang and auton) means that it will make checkboxes)