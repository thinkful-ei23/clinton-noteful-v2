'use strict';

// Sets value of `PORT` to either `process.env.PORT`
// (when hosting app on production server) or `8080`
// (when testing app in local dev environment)
exports.PORT = process.env.PORT || 8080;
