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
    console.log('hit s3 upload', req.file)

    if (!req.body || !req.body.file) {
        return res.status(400).send('No file provided');
    }

    console.log('file', req.body.file);

    const base64Data = req.body.file.replace(/^data:image\/png;base64,/, '');

    s3.putObject({
        Bucket: 'drawing-tool-dev',
        Key: 'test-file2.txt',
        Body: Buffer('this is a test text file')
    }, (error, success) => {
        if (error) {
            console.log(error)
        }

        console.log(success);
    
    })
};
