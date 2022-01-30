const SCOPES = [
   "https://www.googleapis.com/auth/drive",
   "https://www.googleapis.com/auth/drive.readonly",
   "https://www.googleapis.com/auth/drive.activity",
   "https://www.googleapis.com/auth/drive.activity.readonly",
   "https://www.googleapis.com/auth/drive.metadata",
   "https://www.googleapis.com/auth/drive.metadata.readonly"

]

const TOKEN_PATH = "token.json"

module.exports = {
   SCOPES,
   TOKEN_PATH
}