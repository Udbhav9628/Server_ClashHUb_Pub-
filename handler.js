"use strict";
const app = require("./server.js");
const serverless = require("serverless-http");
module.exports.hello = serverless(app);
