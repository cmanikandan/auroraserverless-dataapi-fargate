const AWS = require('aws-sdk');
const express = require('express');
const os = require('os');
const process = require('process');
const uuid = require('uuid');

const DEFAULT_PORT = 80;
const DEFAULT_REGION = 'us-east-1';

const app = express();

app.enable('trust proxy')
app.use(express.json())

app.use(function(req, res, next) {
  console.log(`[${req.ip}] ${req.method} ${req.path}`);
  next();
});

app.get('/data', function(req, res, next) {

  if (!AWS.config.region) {
    AWS.config.update({
      region: 'us-east-1'
    });
  }

  var RDS = new AWS.RDSDataService();

  var params = {
   awsSecretStoreArn: 'arn:aws:secretsmanager:us-east-1:xxxxxxx:secret:test/dataapi/mysql1-BuztkC',
   dbClusterOrInstanceArn: 'arn:aws:rds:us-east-1:xxxxxxx:cluster:test-aurora-mysql-dataapi',
   sqlStatements: 'SELECT * FROM Pets',
   database: 'TESTDB'
  }

  RDS.executeSql(params,function(err, data) {
    res.setHeader('Content-Type', 'application/json');
    console.log(JSON.stringify(data,null,2));
    res.send(JSON.stringify(data, null, 2));
  });
  
});


app.get('/', function(req, res, next) {
  res.json({Hostname: os.hostname()});
});

app.use(function(err, req, res, next) {
  console.log(err.stack);
  res.status(500).json({Error: err.message}).end();
});

process.on('SIGINT', () => process.exit(0));
process.on('SIGTERM', () => process.exit(0));

app.listen(DEFAULT_PORT);
