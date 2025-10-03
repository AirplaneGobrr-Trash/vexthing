# Vex Scouting

An app designed to streamline scouting during a Vex robotics competitions!

- Server-Rendered HTML for "lightning-fast" speeds.
- Initially created during the 2023-2024 Vex game (Over Under) and **fully** compatible with the 2024-2025 game (High Stakes).
- Works Season after season without any* changes

⚠️ **Note: This app does not include a login page and is meant for on-site deployment only.**

🚀 *A public version with a login system is planned for release with version `2.5.0`.*

### Developer's Note
As a senior, this is my final year participating as a *Student* in Vex. However, I plan to remain involved and keep this project updated.


# 🔮 Futures

- Match View:
    - Streamlined interface for viewing matches.

- Note-Taking per Team:
    - Add and save notes specific to each team for better scouting and strategy planning.

- Custom Data Layout:
    - Flexibility to define and organize data layouts to suit preferences.

# 📷 Screenshots

![Main page picture](docs/imgs/main.png)
![Team page picture](docs/imgs/team.png)
![Match list picture](docs/imgs/time.png)
![Team info picture](docs/imgs/teamInfo.png)


# 📖 Help Resources

- [API Layout](/docs/apiRoutes.md)

- [How to](/docs/howTo.md)

- [Data Layout](/docs/layout.md)

- [Todo](/TODO.md)

# [🔖 Version History](./versions.md)

## 3.0.0 - WIP Rebuild

- **__WIP__**
- This is a whole rewrite using bun and typescript!
- This will have all futures said for v2+
- Switched to [bunorm](https://github.com/airplanegobrr/BunORM/) (my custom fork)
    - Q: There is no code changes!
    - A: The current [bunorm on NPM](https://www.npmjs.com/package/bunorm) is NOT the same code on the github- not sure why- the github code has lots of micro fixes
- Switched to [bunrest](https://github.com/airplaneGobrr/bunrest) (my custom fork)
    - Lots of tiny addons I feel are needed for the bunrest lib-
