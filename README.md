# Vex Scouting

This is an app that helps with scouting!

This app was built for the 2023-2024 Vex game (Over Under)

**KEEP IN MIND THIS APP HAS NO LOGIN PAGE AND IS DESIGNED TO BE DEPLOYED ON SITE**

As a more personal note: this is my last year (2024 - 2025) of Vex VRC. I am now a senior, I will try my best to keep this upto date with any changes and fixes

# Images

![Bla](docs/imgs/time.png)
![Bla](docs/imgs/teamInfo.png)


# Help!

[API Layout](/docs/apiRoutes.md)

[How to](/docs/howTo.md)

Better help docs will come soon!

# Plans

- [ ] Easier layout editor
  - [ ] New layout system
  - [ ] Backwards compatibility with old system
  - [ ] Many diff options for ONE key, EG, lets say We have an `Intake` option, we want to know what kinda Intake it is, how fast it is, etc
- [ ] JS Layout file support! [this](/src/config.example.js)
- [ ] Division selector
- [ ] Make diff database per game season
- [x] Make it so you can easily change the layout of the data (Will save to game database so you can switch between games)

# Issues

- If you have an Only a max of 2 options in a layout Object, The following WOULD work:
```json
{
    "Autons": {
        "Left": "Boolean",
        "Right": "Boolean"
    }
}
```
- The following **WOULDN'T** Work
```json
{
    "Autons": {
        "Left": "Boolean",
        "Right": "Boolean",
        "Right-WP": "Boolean"
    }
}
```
- This WILL be fixed with the release of the new layout system