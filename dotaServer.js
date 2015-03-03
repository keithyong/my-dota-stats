var fs = require('fs'),
    express = require('express'),
    path = require('path'),
    port = 8888,
    mainRouter = require("./routes/mainRouter")
    PORT = process.env.PORT || 8080;

var app = express();
app.disable('etag');
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use('/', mainRouter);
app.use(express.static(path.join(__dirname, 'public')));

// Start the server.
app.listen(PORT);
