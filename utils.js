const fs = require("fs")
const moment = require("moment")
const {google} = require("googleapis")

const CLEAR_UPLOAD_FOLDER_INTERVAL_MS = 1800000 // 30min
const CLEAR_UPLOAD_FOLDER_FILE_AGE_MIN = 30
const PATH_TO_UPLOADS = `${__dirname}/uploads`

const bytesToMB = size => {
   return (size / 1000000).toFixed(2)
}

const deleteFileFromUploads = file => {
   fs.unlinkSync(`${PATH_TO_UPLOADS}/${file}`)
}

const clearServerUploadFolder = () => {
   setInterval(() => {
      console.log('Interval func started...')
      fs.readdir(`${PATH_TO_UPLOADS}`, (err, files) => {
         files.forEach(file => {
            const pdfFile = file.match(/.+\.pdf$/g)
            if (pdfFile) {
               console.log('Pdf file found.')
               fs.stat(`${PATH_TO_UPLOADS}/${pdfFile}`, (err, stats) => {
                  if (err) {
                     console.log(err)
                  }
                  const timeNow = moment(new Date())
                  const timePdfCreated = moment(stats.ctime)
                  const differenceInMinutes = moment.duration((timeNow.diff(timePdfCreated))).asMinutes()
                  if (differenceInMinutes > CLEAR_UPLOAD_FOLDER_FILE_AGE_MIN) {
                     deleteFileFromUploads(pdfFile)
                     console.log(`Files with age more than ${CLEAR_UPLOAD_FOLDER_FILE_AGE_MIN} min deleted.`)
                  } else {
                     console.log(`File age is less than ${CLEAR_UPLOAD_FOLDER_FILE_AGE_MIN} min.`)
                  }
               })
            }
         })
      })
   }, CLEAR_UPLOAD_FOLDER_INTERVAL_MS)
}

module.exports = {
   bytesToMB,
   deleteFileFromUploads,
   clearServerUploadFolder
}

// async function uploadFile(auth) {
//    const drive = google.drive({version: 'v3', auth});
//    try {
//       const response = await drive.files.create({
//          requestBody: {
//             mimeType: 'application/pdf',
//          },
//          media: {
//             mimeType: 'application/pdf',
//             body: fs.createReadStream(filePath)
//          }
//       })
//       console.log(response.data)
//    } catch (e) {
//       console.log(e)
//    }
// }