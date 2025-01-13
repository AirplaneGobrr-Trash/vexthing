# Versions

## 2.2.0

### 🌟 Enhancements
- ⭐ Added div selector! ⭐
- Renamed `times` to `matches` as it makes more sense
- Main page will now show `Team` and `Event` buttons
    - Plans coming to make the `Event` page a search page
    - Plans coming to make the `Team` page have a search
- Search Parameters:
    - Reformatted the team URL to use search parameters for cleaner links.
    - Added `div`, `shift`, and `team` as search parameters.
- Better Version notes
- Moved old [Versions](./versions.md)

### 🐞 Bug Fixes
- Fixed matches that are unscored showing a winning team
- Fixed the `Shift time` not working in the match viewer (done via the `shift` search param)


### 🛠️ Code Improvements
- Moved `/team` and `/event` to there own router files
- Added `User-Agent` to the axios request

### 🚧 Work in Progress
- Session System (login system)

## 2.1.0

- Table editor now works!
- Scout sheet now auto saves!
- Using socket.io to sync table editor and team editor
    - You can edit team data at the same time across people!
- The "Save" button is still in place if you get knocked offline for a second, if you have a stable connection then this isn't needed
- Docs for the [Data Layout](/docs/layout.md) are done!

## 2.0.0

2.0.0 is out! After along time of dreading, I did it!

**this breaks the 1.0.0 layouts! Old data will not load/work!**

- Replaced knex with quick.db (downgrade ngl)
- Remade data layout to be better and more expandable
- SSR (Server-Side-Rendering) is now being worked on, it's only used for the teams matches preview where SSR is used
- JS files can now be used for layouts
- A new `Table editor` is in the works! (planed to be done in `2.1.0`!)