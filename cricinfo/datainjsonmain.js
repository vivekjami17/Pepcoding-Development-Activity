
let request = require('request');
let cheerio = require('cheerio');
let fs = require('fs');
let path = require('path');

let rootUrl = "https://www.espncricinfo.com";
let mainUrl = "https://www.espncricinfo.com/series/ipl-2020-21-1210595";

let rootDir = path.join(process.cwd(), "cricinfo");
if (fs.existsSync(rootDir)) {
    console.log("cricinfo folder Exists")
    fs.rmdirSync(rootDir, { recursive: true });
    console.log("Deleting")
}

fs.mkdirSync(rootDir);

request(mainUrl, function (err, response, body) {
    if (err) {
        console.log("Oops! Error😓")
    }
    if (response.statusCode == 404) {
        console.log("Page Not Found🌌")
    } else {
        let mainPage = cheerio.load(body);
        let allResultsTag = mainPage(".widget-items.cta-link a");
        let allResultsUrl = allResultsTag.attr('href');
        let matchResultsUrl = rootUrl + allResultsUrl
        console.log(matchResultsUrl);
        request(matchResultsUrl, matchResults);
    }
});

//matchresults page callback
function matchResults(err, res, body) {
    if (err) {
        console.log("Oops! Error in Match Results😓")
    } if (res.statusCode == 404) {
        console.log("Match Results Page Not Found🌌")
    } else {
        let matchResults = cheerio.load(body);
        let scoresContainer = matchResults(".league-scores-container a[data-hover=Scorecard]");
        console.log(scoresContainer.length);
        for (let i = 0; i < scoresContainer.length; i++) {
            let scoreCardUrl = matchResults(scoresContainer[i]).attr('href');
            console.log(scoreCardUrl);
            request(rootUrl + scoreCardUrl, scoreCard);
        }
    }
}

function scoreCard(err, res, body) {
    if (err) {
        console.log("Oops! Error in ScoreCard😓")
    } if (res.statusCode == 404) {
        console.log("Score Card Page Not Found🌌")
    } else {
        let scoreCardPage = cheerio.load(body);
        let teamNames = scoreCardPage('.match-info-MATCH-half-width .name');
        let matchStatus = scoreCardPage('.match-info-MATCH-half-width .status-text');
        let matchDescrip = scoreCardPage('.match-info-MATCH-half-width .description');
        let scoreCardTables = scoreCardPage('.match-scorecard-table .batsman');
        matchDescrip = matchDescrip.text().split(",");
        let matchVenue = matchDescrip[1].trim();
        let matchDate = matchDescrip[2].trim();

        let team1 = scoreCardPage(teamNames[0]).text();
        let team2 = scoreCardPage(teamNames[1]).text();

        let team1ScoreTable = scoreCardPage(scoreCardTables[0]).find('tbody tr');
        let team2ScoreTable = scoreCardPage(scoreCardTables[1]).find('tbody tr');
        console.log("******************" + team1 + " " + team2 + "******************");
        let team1Path = path.join(rootDir, team1);
        if (!(fs.existsSync(team1Path))) {
            fs.mkdirSync(team1Path);
        }
        let team2Path = path.join(rootDir, team2);
        if (!(fs.existsSync(team2Path))) {
            fs.mkdirSync(team2Path);
        }

        for (let i = 0; i < team1ScoreTable.length - 1; i += 2) {
            let cols = scoreCardPage(team1ScoreTable[i]).find('td');
            let playerName = scoreCardPage(cols[0]).text().trim();
            playerName = playerName.split(" ");
            playerName = playerName[0] + " " + playerName[1];
            let runs = scoreCardPage(cols[2]).text();
            let balls = scoreCardPage(cols[3]).text();
            let r4s = scoreCardPage(cols[5]).text();
            let r6s = scoreCardPage(cols[6]).text();
            let sr = scoreCardPage(cols[7]).text();
            let filePath = path.join(team1Path, playerName + ".json");

            var playerDetails = {};
            playerDetails.myTeamName = team1;
            playerDetails.name = playerName;
            playerDetails.venue = matchVenue;
            playerDetails.date = matchDate;
            playerDetails.opponentTeamName = team2;
            playerDetails.result = matchStatus.text();
            playerDetails.runs = runs;
            playerDetails.balls = balls;
            playerDetails.fours = r4s;
            playerDetails.sixes = r6s;
            playerDetails.sr = sr;

            console.log(playerDetails);

            if (fs.existsSync(filePath)) {
                let plArr = JSON.parse(fs.readFileSync(filePath));
                plArr.push(playerDetails);
                let jsonStr = JSON.stringify(plArr);
                fs.writeFileSync(filePath, jsonStr);
            } else {
                let plArr = [];
                plArr.push(playerDetails);
                let jsonStr = JSON.stringify(plArr);
                fs.writeFileSync(filePath, jsonStr);
            }
        }

        //for team 2
        for (let i = 0; i < team2ScoreTable.length - 1; i += 2) {
            let cols = scoreCardPage(team2ScoreTable[i]).find('td');
            let playerName = scoreCardPage(cols[0]).text().trim();
            playerName = playerName.split(" ");
            playerName = playerName[0] + " " + playerName[1];
            let runs = scoreCardPage(cols[2]).text();
            let balls = scoreCardPage(cols[3]).text();
            let r4s = scoreCardPage(cols[5]).text();
            let r6s = scoreCardPage(cols[6]).text();
            let sr = scoreCardPage(cols[7]).text();
            let filePath = path.join(team2Path, playerName + ".json");

            var playerDetails = {};
            playerDetails.myTeamName = team2;
            playerDetails.name = playerName;
            playerDetails.venue = matchVenue;
            playerDetails.date = matchDate;
            playerDetails.opponentTeamName = team1;
            playerDetails.result = matchStatus.text();
            playerDetails.runs = runs;
            playerDetails.balls = balls;
            playerDetails.fours = r4s;
            playerDetails.sixes = r6s;
            playerDetails.sr = sr;

            console.log(playerDetails);

            if (fs.existsSync(filePath)) {
                let plArr = JSON.parse(fs.readFileSync(filePath));
                plArr.push(playerDetails);
                let jsonStr = JSON.stringify(plArr);
                fs.writeFileSync(filePath, jsonStr);
            } else {
                let plArr = [];
                plArr.push(playerDetails);
                let jsonStr = JSON.stringify(plArr);
                fs.writeFileSync(filePath, jsonStr);
            }
        }


    }
}