'use strict';

const AWS = require('aws-sdk');

let s3 = new AWS.S3({
    region: 'us-east-2',
    accessKeyId: 'AKIA3RE7SQY6UA7UJZ77',
    secretAccessKey: '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'
});

// Create a Mongoose model for file uploads
// const File = mongoose.model('File', new mongoose.Schema({
//   filename: String,
//   originalname: String,
//   encoding: String,
//   mimetype: String,
// }));


exports.createData = (req, res) => {
    if (!req.files[0]) {
        return res.status(400).send('No file provided');
    }

    const file = req.files[0];

    const params = {
        Bucket: 'drawing-tool-dev',
        Key: file.originalname,
        Body: file.buffer,
        ContentType: file.mimetype
      };

    s3.putObject(params, (error, success) => {
        if (error) {
            console.log(error)
        }

        console.log(success);
    
    })
};
