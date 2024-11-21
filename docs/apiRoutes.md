# API Layout

All APIs are under the `/api` route, there are NO api versions (for now)

TeamID: The team ID (EG: `139679`)

TeamNumber: The team number (EG: `6627Y`)


# /event

## /matches/(eventID)/(divID)

Type: `GET`

Returns: Matches of div at event

## /teams/(eventID)

Type: `GET`

Returns: Teams at event

# /team

## /events/(teamID)

Type: `GET`

Returns: events that the team has

## /data/(eventID)/(teamID)

Type: `GET`

Returns the picture (add `.png` to the end of the URL) OR the locally stored data about the team from the event

## /upload/(eventID)/(teamID)

Type: `POST`

Type: `application/json`
Data:
This is a json object and uses the layout you have in the `layouts` folder

```json
{
    "<Section Name>-<option value>": true
}
```

The `<Section Name>` is the name of the section you have in the `layout` file

The `<option value>` is the value of the option you have in the `layout` file

Make sure you have the `-`! They are required!

Updates data

OR
Type: `multipart/form-data`
Uploads picture

# /time

Doesn't do anything for now



# Socket IO

## update

This is the `update` event! This is used to sync data between the clients on both the table editor and the team editor

The layout it uses is as follows:

```json
{
    "teamID": "<team ID>",
    "eventID": "<event ID>",
    "update": {},
}
```

The `update` object follows the same data format `/upload/(eventID)/(teamID)` does.

The `teamID` and `eventID` are REQUIRED.

This will also WRITE this data to the database!