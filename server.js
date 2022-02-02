const express = require("express")
const cors = require("cors")
const fs = require("fs")
const fileUpload = require("express-fileupload")

const {authorize} = require('./api/authAPI')
const {uploadFiles} = require('./api/actionsAPI')
const {bytesToMB, deleteFileFromUploads, clearServerUploadFolder} = require("./utils")

const app = express()
const PORT = process.env.PORT || 8000
const PATH_TO_PDF = `${__dirname}/uploads`

// const limitFileSize = 1.2 * 1024 * 1024 * 1024
const limitFileSize = 300 * 1024 * 1024

app.use(cors())
app.use(fileUpload({
   uploadTimeout: 30000,
   limits: {fileSize: limitFileSize}, // 41.94 MB
   abortOnLimit: true,
   responseOnLimit: `File is too big, max. size ${bytesToMB(limitFileSize)} MB`,
   debug: true
}))

app.post("/upload", (req, res) => {
   if (req.files === null) return res.status(400).json({msg: "No file uploaded!"})

   const file = req.files["pdf-file"]
   file.name = req.body.orderId

   file.mv(`${PATH_TO_PDF}/${file.name}.pdf`, err => {
      if (err) {
         console.log(err)
         return res.status(500).send(err)
      }
      res.status(200).json({
         fileName: file.name,
         filePath: `/uploads/${file.name}`
      })
   })
})

app.post("/save", (req, res) => {
   const orderId = req.body.orderId
   const responseToClient = response => {
      if (response.type === 'success') {
         res.status(200).send(response.message)
      }
      if (response.type === 'error') {
         res.status(500).send(response.message)
      }
   }

   fs.readFile("credentials.json", (err, content) => {
      if (err) return console.log("Error loading client secret file:", err)
      authorize(JSON.parse(content), (auth) => uploadFiles(auth, orderId, `${PATH_TO_PDF}/${orderId}.pdf`, responseToClient))
   })
})

app.post("/delete", (req, res) => {
   deleteFileFromUploads(`${req.body.orderId}.pdf`)
   res.status(200).send("File Deleted")
})

app.listen(PORT, () => {
   console.log(`Server running on port:${PORT}...`)
})

clearServerUploadFolder()