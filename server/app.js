
const express = require('express');
const bodyParser = require('body-parser');

require('./database-setup.js');

let app = express();

console.log('process id', process.pid);


console.log('Database location', process.env.MY_DB_LOCATION);

app.use(express.static(__dirname + '/../client/public'));


app.use(bodyParser.json());

app.use('/api/jobs', require('./routes/job.routes.js'));

app.listen(3000, function doSomethingOnceServerIsUp() {
  console.log('Server is up!');
});
