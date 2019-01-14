const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");

const app = express();

//middleware for body-parser
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Serve static resources
app.use(express.static("../client/dist"));

app
  .get("/*", function(req, res) {
    res.sendFile(path.join(__dirname, "../client/dist/index.html"), function(
      err
    ) {
      if (err) {
        res.status(500).send(err);
      }
    });
  })
  .listen(5000);
