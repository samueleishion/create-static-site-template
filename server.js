const express = require('express');

let app = express();

app.use(express.static('static'));
app.get('/*');

app.listen(9999);
console.log('http://localhost:9999 running');
