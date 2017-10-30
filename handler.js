/*jslint esversion: 6*/
/*jslint node: true*/
'use strict';

const AWS = require('aws-sdk');
const s3 = new AWS.S3();
const sns = new AWS.SNS();

module.exports.updateStat = (event, context, callback) => {

  const data = JSON.parse(event.body);

  if (typeof data.status !== 'string' && (data.status != 'free' || data.status != 'busy')) {
    console.error('Validation Failed');
    callback(new Error('Couldn\'t update status because it was not a valid string.'));
    return;
  }

  const response = {
    statusCode: 200,
    body: JSON.stringify({
      message: 'Status has been updated successfully!',
      input: event,
    }),
  };

  s3.putObject({
    Bucket: process.env.BUCKET,
    Key: "status.json",
    Body: `{"status":"${data.status}"}`,
  }).promise();

  sns.publish({
    Message: JSON.stringify(`Michael is now ${data.status.toUpperCase()}.`), 
    TopicArn: process.env.TOPIC
  }).promise();
  
  console.log(`New status is ${data.status}`);
  callback(null, response);

};

module.exports.toggleStat = (event, context, callback) => {
  const response = {
    statusCode: 200,
    body: JSON.stringify({
      message: 'Status has been updated successfully!',
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

    let newStatus = 'unknown';

    if (statData.status == "busy") {
      s3.putObject({
        Bucket: process.env.BUCKET,
        Key: "status.json",
        Body: `{"status":"free"}`,
      }).promise();

      newStatus = 'free';
      console.log("New status is free");
      callback(null, response);
    }
    else {
      s3.putObject({
        Bucket: process.env.BUCKET,
        Key: "status.json",
        Body: `{"status":"busy"}`,
      }).promise();

      newStatus = 'busy';
      console.log("New status is busy");
      callback(null, response);
    }

    sns.publish({
      Message: JSON.stringify(`Michael is now ${newStatus.toUpperCase()}.`), 
      TopicArn: process.env.TOPIC
    }).promise();

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