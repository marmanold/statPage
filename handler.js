'use strict';

const AWS = require('aws-sdk');
const s3 = new AWS.S3();

module.exports.updateStat = (event, context, callback) => {
  const response = {
    statusCode: 200,
    body: JSON.stringify({
      message: 'Status has been updated sucessfully!',
      input: event,
    }),
  };

  s3.getObject({
    Bucket: process.env.BUCKET, 
    Key: "status.json", 

  }, function(error, data) {
    if (error) {
      console.error(error);
      callback(new Error("status.json could not be read from the bucket."));
      return;
    }

    const statDataStr = data["Body"].toString();
    const statData = JSON.parse(statDataStr);

    console.log(`Current status is: ${statData.status}`);

    if (statData.status == "busy") {
      s3.putObject({
        Bucket: process.env.BUCKET,
        Key: "status.json",
        Body: `{"status":"free"}`,
      }).promise();
      console.log("New status is free");
      callback(null, response);
    }
    else {
      s3.putObject({
        Bucket: process.env.BUCKET,
        Key: "status.json",
        Body: `{"status":"busy"}`,
      }).promise();
      console.log("New status is busy");
      callback(null, response);
    }

  });
};

module.exports.currStat = (event, context, callback) => {

  s3.getObject({
    Bucket: process.env.BUCKET, 
    Key: "status.json", 

  }, function(error, data) {
    if (error) {
      console.error(error);
      callback(new Error("status.json could not be read from the bucket."));
      return;
    }

    const statDataStr = data["Body"].toString();
    const statData = JSON.parse(statDataStr);

    const currStatus = statData.status;
    console.log(`Current status is: ${currStatus}`);

    const html = `
      <html>
        <head>
          <title>Current Status: ${currStatus}</title>
          <meta http-equiv="refresh" content="60">
          <style>
            .busy {
              background-color: red;
            }
            .free {
              background-color: green;
            }
            p {
              color: white;
              font-family: "Helvetica", "Arial", sans-serif;
              font-size: 48pt;
              font-size: 25vw;
            }
            .center {
              position:absolute;
              top:50%;
              left:50%;
              padding:15px;
              -ms-transform: translateX(-50%) translateY(-50%);
              -webkit-transform: translate(-50%,-50%);
              transform: translate(-50%,-50%);
            }
          </style>
        </head>
        <body class="${currStatus}"><div class="center"><p>${currStatus}</p></div></body>
      </html>
    `;

    const response = {
      statusCode: 200,
      headers: {
        'Content-Type': 'text/html',
      },
      body: html,
    };

    callback(null, response);

  });
};