
//import module
var restify = require("restify");
var builder = require("botbuilder");

//setup web server
var server = restify.createServer();
var fs = require("fs")
server.listen(3978,function(){
    console.log("%s listening to %s", server.name, server.url);
});

//create chat connector for communicating with the Bot Service
var connector = new builder.ChatConnector({
    appId: "",
    appPassword:"",
});

//listen for messages from users
server.post("/api/messages", connector.listen());

//create your bot with a function to receive messages from the user
var infoJson = require("./info.json");
var bot = new builder.UniversalBot(connector, [ 
    function(session){
        session.beginDialog("info")
    }
]);

bot.dialog("info",[
    function(session){
        builder.Prompts.text(session, "請輸入股票代號查詢")
    },
    function(session, results){
        var stockcode = session.dialogData.sc = results.response;
        var msgResponse = "";

        for(var i = 0; i < infoJson.length; i++){
            if(infoJson[i].證券代號 == stockcode){
                var title = infoJson[i].證券名稱;
                var close = infoJson[i].收盤價;
                var compare = infoJson[i]['漲跌(+/-)'] + infoJson[i].漲跌價差;
                var volume = (parseFloat(infoJson[i].成交股數.replace(/,/g, '')) / 1000).toFixed(0);
                msgResponse = `${title}<br/>收盤價：${close}<br/>漲跌價：${compare}<br/>成交股數：${volume}張`

                break;
            }            
        }
       
        if(msgResponse == ""){
            session.send("找不到該代號");
        }
        else{
            session.send("您查詢的股票資訊如下<br/>%s", msgResponse);
        }                   
    }
]);
