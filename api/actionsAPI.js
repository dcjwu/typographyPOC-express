const {google} = require("googleapis")
const fs = require("fs")

function uploadFiles(auth, fileName, filePath, callback) {
   const drive = google.drive({version: "v3", auth})
   const fileMetadata = {
      "name": fileName
   }
   const media = {
      mimeType: "application/pdf",
      body: fs.createReadStream(`${filePath}`).on("error", err => {
         console.log("Error on createReadStream method:", err)
         return callback({
            type: 'error',
            message: 'Error while reading the file'
         })
      })
   }
   drive.files.create({
      resource: fileMetadata,
      media,
      fields: "id"
   }, (err, file) => {
      if (err) {
         console.log("Error while creating file...", err)
         return callback({
            type: "error",
            message: "Error while creating the file"
         })
      }
      console.log("File uploaded:", file)
      return callback({
         type: "success",
         message: "File uploaded"
      })
   })
}

module.exports = {
   uploadFiles
}