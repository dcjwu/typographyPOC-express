const {google} = require("googleapis")
const fs = require("fs")
const {deleteFileFromUploads} = require("../utils")

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
         deleteFileFromUploads(`${fileName}.pdf`)
         return callback({
            type: "error",
            message: "Error while creating the file"
         })
      }
      console.log("File uploaded:", file)
      deleteFileFromUploads(`${fileName}.pdf`)
      return callback({
         type: "success",
         message: "File uploaded"
      })
   })
}

function getFileUrl(auth, fileName, callback) {
   const drive = google.drive({version: "v3", auth})
   drive.files.list({
      fields: 'nextPageToken, files(id, name)',
   }, (err, res) => {
      if (err) return console.log('The API returned an error: ' + err);
      const files = res.data.files;
      if (files.length) {
         files.map((file) => {
            if (file.name === fileName) {
               drive.permissions.create({
                  fileId: file.id,
                  requestBody: {
                     role: 'reader',
                     type: 'anyone'
                  }
               })
               drive.files.get({
                  fileId: file.id,
                  fields: "webViewLink, webContentLink",
               })
                  .then(res => {
                     callback({
                        type: 'success',
                        data: res.data.webViewLink
                     })
                  })
                  .catch(err => {
                     callback({
                        type: 'error',
                        data: err
                     })
                  })
            }
         });
      } else {
         callback({
            type: 'error',
            data: 'No files found...'
         })
      }
   });
}

module.exports = {
   uploadFiles,
   getFileUrl
}