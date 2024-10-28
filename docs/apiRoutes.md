# API Layout

All APIs are under the `/api` route, there are NO api versions (for now)

TeamID: The team ID (EG: `139679`)

TeamNumber: The team number (EG: `6627Y`)


# /event

## /matches/(eventID)/(divID)

Type: GET

Returns: Matches of div at event

## /teams/(eventID)

Type: GET

Returns: Teams at event

# /team

## /events/(teamID)

Type: GET

Returns: events that the team has

## /data/(eventID)/(teamID)

Type: GET

Returns the picture (add `.png` to the end of the URL) OR the locally stored data about the team from the event

## /upload/(eventID)/(teamID)

Type: POST

Type: application/json
Data:
`TODO in 2.0.5` - sorry.

Updates data

OR
Type: multipart/form-data
Uploads picture

# /time

Doesn't do anything for now