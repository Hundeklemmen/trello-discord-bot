var Trello = require("trello");
const fs = require('fs-extra')
const Discord = require('discord.js');
const client = new Discord.Client();

var trello = new Trello("Api key", "Api Secret");
client.login('Discord Bot Token');

var discord_Channel = "532303694805336084" // ID
var trello_board = "NK2OQvxI" //ID

setInterval(() => {
    doCheck();
}, 90000);

function doCheck(){

    fs.readJson(__dirname+"/list.json", (err, listObject) => {
        if (err) console.error(err)

        trello.makeRequest('get', '/1/boards/'+trello_board+'/actions', { webhooks: true }).then((data) => {
            data = data.reverse();
            for (var card of data){
                //handleCard(card);
                if(card.data&&card.data.board){
                    fixBoard(card.data, function(board){
                        if(!listObject.includes(card.id)){
                            listObject.push(card.id)
                            if(card.type == "updateCard"){
                                if(board.listAfter&&board.listBefore){
                                    client.channels.get(discord_Channel).send("'"+board.card.name+"' Blev flyttet fra "+board.listBefore.name+" til "+board.listAfter.name)
                                }
                            } else if(card.type == "addMemberToCard"){
                                client.channels.get(discord_Channel).send("'"+board.member.name+"' Blev tilføjet til '"+board.card.name+"'")
                            } else if(card.type == "removeMemberFromCard"){
                                client.channels.get(discord_Channel).send("'"+board.member.name+"' Blev fjernet fra '"+board.card.name+"'")
                            } else if(card.type == "createCard"){
                                client.channels.get(discord_Channel).send("'"+board.card.name+"' blev oprettet i '"+board.list.name+"'")
                            }
                        }
                    })
                }
            }
            fs.writeJson(__dirname+"/list.json", listObject, err => {
                if (err) return console.error(err)
            })
        // console.log
        });
    });
}

function fixBoard(obj, cb){
    var fix = {};    
    for(var i in obj){
        fix[i] = obj[i]
    }
    cb(fix);
}


client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
  doCheck();
});
