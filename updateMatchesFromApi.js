/* updateMatchesFromApi.js
 *
 * Meant to be run as a daemon. Updates the dota database with new matches
 * from the Dota API, every [refresh_minutes] minutes. Doesn't actually get the JSON,
 * it uses the JSON that getMatchDetailsFromId.js gives */
var async = require('async'),
    fs = require('fs'),
    getMyLatestMatch = require('./getMyLatestMatchId'),
    matchDetails = require('./getMatchJSONFromId'),
    dotadb = require('./dotadb'),
    getDotaMatchCounts = require('./getDotaMatchCounts'),
    config = require('./config'),
    dota_json_filename = config.dota_match_counts_json_filename,
    refresh_minutes = config.refresh_minutes,
    interval_ms = refresh_minutes * 60 * 1000;

/* Updates match ID and hours since that match, every [refresh_minutes] 
 * Also updates index.html */
function grab() {
    // Grab the latest match ID and add to database.
    getMyLatestMatch(function(match_id) {
        id = match_id;

        console.log("Grabbing any new matches from the Dota API.");
        async.waterfall([
            function(callback) {
                matchDetails.getMatchDetailsFromId(id, function(match_json) {
                    json = match_json;
                    callback(null, match_json);
                });
            },
            function(match_json) {
            /* Get all the information to add to a single DB entry */
                var id = match_json.result.match_id;
                var start_time = match_json.result.start_time;
                var duration = match_json.result.duration;

                /* Add to the database */
                dotadb.addDotaMatch(id, start_time, duration);
            }
        ]);
    });

    // Grab the latest matches JSON and store it in local file.
    getDotaMatchCounts(config.days, function(json) {
        fs.writeFile(dota_json_filename, JSON.stringify(json), function(err) {
            if (err) {
                console.log('Error writing to ' + dota_json_filename + ': ' + err);
            } else {
                console.log('File written successfully!');
            }
        });
    });
}

function getLastUpdated() {
    console.log('all jobs done!');
}

function update() {

    async.series([
        grab(),
        getLastUpdated()
    ]);
    setTimeout(update, interval_ms);
}
/* Jump start update */
update();
