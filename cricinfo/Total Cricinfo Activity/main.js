let request=require("request");
let cheerio=require("cheerio");
let scoreCardObj=require("./scoreCard.js");
// myTeamname name venue date oppenentTeam result runs balls fours sixes sr
let url="https://www.espncricinfo.com/series/ipl-2020-21-1210595";
request(url,cb);
function cb(error,response,html) {
    if(error){
        console.log(error);
    }else if(response.statusCode ==404 ){
        console.log("Page not found");
    }else{
        // console.log(html);
        dataExtracter(html);
    }
}

function dataExtracter(html) {
    console.log("```````````````````````````");
    let searchTool=cheerio.load(html);
    let anchorrep=searchTool('a[data-hover="View All Results"]');
    let link=anchorrep.attr("href");
    // console.log("link",link);
    let fullAllmatchpageLink=`https://www.espncricinfo.com${link}`;
    console.log(fullAllmatchpageLink);
    request(fullAllmatchpageLink,allMathPageCb);
}
function allMathPageCb(error,response,html){
    if(error){
        console.log(error);
    }else if(response.statusCode ==404 ){
        console.log("Page not found");
    }else{
        // console.log(html);
        getAllScoreCardLink(html);
    }
}
function getAllScoreCardLink(html) {
    let searchtool = cheerio.load(html);
    let scorecardlinkArr = searchtool("a[data-hover='Scorecard']");
    console.log(scorecardlinkArr.length);
    for (let i = 0; i < scorecardlinkArr.length; i++) {
        let link = searchtool(scorecardlinkArr[i]).attr("href");
        let fullLink = "https://www.espncricinfo.com" + link;
        console.log(fullLink);
        scoreCardObj.psm(fullLink);
    }
    console.log("````````````````````````")
}