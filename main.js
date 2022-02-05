const fs = require("fs");
const ffmpeg = require('@ffmpeg-installer/ffmpeg');
const ffmpegs = require('fluent-ffmpeg');
ffmpegs.setFfmpegPath(ffmpeg.path);
const http = require('https'); // or 'https' for https:// URLs
const login = require("fca-unofficial");
const axios = require("axios");
var FormData = require('form-data');
const YoutubeMusicApi = require('youtube-music-api')
const ytdl = require('ytdl-core');
const musicApi = new YoutubeMusicApi();
const translate = require('@vitalets/google-translate-api');


async function mplay(query) {

    await musicApi.initalize();
 
    const musics = await musicApi.search(query);

    console.log('connecting to yt ' + query);
    try {
    if (musics.content.length == 0) {
        console.log(query + " ay wala sa YouTube Music")
        return [query + " ay wala sa YouTube Music", '']
    } else {
        if (musics.content[0].videoId === undefined) {
            console.log("Error diko ma i download itong " + query)
            return ["Error diko ma i download itong " + query]
        } else if (musics.content[0].duration > 4750000) {
            console.log("Sobrang haba ng Music na" + query)
            return ["Sobrang haba ng Music na " + query]
        } else {
            const info = await ytdl.getInfo('https://www.youtube.com/watch?v='+musics.content[0].videoId);
            var strm = ytdl('https://www.youtube.com/watch?v='+musics.content[0].videoId, {
                quality: "highestaudio"
            });
            return ['https://www.youtube.com/watch?v='+musics.content[0].videoId, strm, info.videoDetails.title];
        }
    } 
    ;
} catch {
    console.log("May Problema Pa Ulet")
    return ["may problem sa function ko pasensya na paki ulit nalang"];
}


}

async function jokes() {

    var options = {
        method: 'GET',
        url: 'https://jokeapi-v2.p.rapidapi.com/joke/Any',
        params: {
          format: 'json',
          contains: '',
          idRange: '0-319',
          blacklistFlags: 'racist'
        },
        headers: {
          'x-rapidapi-host': 'jokeapi-v2.p.rapidapi.com',
          'x-rapidapi-key': 'd1c29cb265mshf4cd9ef8ed662b3p10689bjsneb3695aa8e61'
        }
      };
      
      var out = axios.request(options).then(function (response) {

        console.log(response.data.type)
        if (response.data.type == "twopart") {

            return response.data.setup + '\n\n\n' + response.data.delivery
        } else {
            return response.data.joke

        }

      }).catch(function (err) {
          return 'error';
      });

      return out;
}

async function translator(query, lang) {

    
    let langs = lang.split("/");

    var out = translate(query, { from: langs[0], to: langs[1] }).then(res => {


        return res.text;

    }).catch(err => {
        console.error('TRANSLATE ERROR');
        return 'error';
    });
 
    return out;
}

async function mtsolver(query) {

    return "Math solver is not available please use your calculator at the moment"

}

async function enquotes() {

    var options = {
        method: 'GET',
        url: 'https://quotes15.p.rapidapi.com/quotes/random/',
        headers: {
            'x-rapidapi-host': 'quotes15.p.rapidapi.com',
            'x-rapidapi-key': 'd1c29cb265mshf4cd9ef8ed662b3p10689bjsneb3695aa8e61'
        }
    };

    var out = axios.request(options).then(function (response) {
        return response.data.content;
    }).catch(function (err) {
        return 'error';
    });
    return out


}


async function advices() {

 
    var options = {
        method: 'GET',
        url: 'https://api.adviceslip.com/advice'
    };

    var out = axios.request(options).then(function (response) {
        return response.data.slip.advice;
    }).catch(function (err) {
        return 'error';
    });
    return out
    
}

//=========================================================================================================================\\
var msgs = [];
var playcd =[];
let swt = 0;
let taggs = ["PENDING", "unread"];

login({appState: JSON.parse(fs.readFileSync('appstate.json', 'utf8'))}, (err, api) => {
    if(err) return console.error(err);
    api.setOptions({
        listenEvents: true,
        logLevel: "silent",
        autoMarkRead: true
    });
    function getThread(){
        
        try {
            if (swt == 1) {
            swt = 0;
            let taggs = ["PENDING", "unread"];
            swt
            } else {
            swt = 1;
            let taggs = ["OTHER", "unread"];
            }
        
            console.log('THREAD UPDATED');
            api.getThreadList(1, null, taggs, (err, list) => {
                if (err) return console.error(err);
                if (list.length != 0) {
        
                        api.handleMessageRequest(list[0]['threadID'], true, (err) => {
                            if (err) return console.error("HANDLE MESSAGE REQUEST ERROR");
            
                            api.sendMessage("Hello I am ACE a Facebook BOT", list[0]['threadID']);
        
                            api.changeNickname("ツACEツ", list[0]['threadID'], "100078060693618", (err) => {
                                if (err) return console.error("CHANGE NICKNAME ERROR");
                            });
            
                        });
                }

            }); 
        } catch {

            // catch thread list
        }

    }
    var x = setInterval(getThread, 60000);
    const listenEmitter = api.listen((err, event) => {
        if(err) return console.error(err);
        let msgid = event.messageID;
        let sdrid = event.senderID;
        let input = event.body;
        let trid = event.threadID;
        switch(event.type) {
            case "message_reply":
                api.setMessageReaction("🤩", event.messageID, (err) => {
                }, true);
                msgs[msgid] = input;
                // message reply
            break;
            
            case "message_unsend":
                let datas = msgs[msgid];
                api.getUserInfo(sdrid, (err, data) => {
                    if (err) return console.error(err);
                    if(typeof (datas) == "object") {
                    if (datas[0] == "photo") {
                        var files = fs.createWriteStream("files.jpg");
                        var datarequest = http.get(datas[1], function (dataresponse) {
                            dataresponse.pipe(files);
                            files.on('finish', function () {
                                console.log('finished downloading files..');
                                var message = {
                                    body: data[sdrid]['name'] + " unsent this photo: \n",
                                    attachment: fs.createReadStream(__dirname + '/files.jpg')
                                    .on("end", async () => {
                                        if (fs.existsSync(__dirname + '/files.jpg')) {
                                            fs.unlink(__dirname + '/files.jpg', function (err) {
                                                if (err) console.log(err);
                                                console.log(__dirname + '/files.jpg is deleted');  
                                            })
                                        }
                                    })
                                }
                                api.sendMessage(message, trid);
                            });
                        });
                    }
                    else if (datas[0] == "video") {
                        var files = fs.createWriteStream("files.mp4");
                        var datarequest = http.get(datas[1], function (dataresponse) {
                            dataresponse.pipe(files);
                            files.on('finish', function () {
                                console.log('finished downloading files..');
                                var message = {
                                    body: data[sdrid]['name'] + " unsent this video: \n",
                                    attachment: fs.createReadStream(__dirname + '/files.mp4')
                                    .on("end", async () => {
                                        if (fs.existsSync(__dirname + '/files.mp4')) {
                                            fs.unlink(__dirname + '/files.mp4', function (err) {
                                                if (err) console.log(err);
                                                console.log(__dirname + '/files.mp4 is deleted');  
                                            })
                                        }
                                    })
                                }
                                api.sendMessage(message, trid);
                            });
                        });
                    }
                    else if (datas[0] == "sticker") {
                        var files = fs.createWriteStream("files.png");
                        var datarequest = http.get(datas[1], function (dataresponse) {
                            dataresponse.pipe(files);
                            files.on('finish', function () {
                                console.log('finished downloading files..');
                                var message = {
                                    body: data[sdrid]['name'] + " unsent this sticker: \n",
                                    attachment: fs.createReadStream(__dirname + '/files.png')
                                    .on("end", async () => {
                                        if (fs.existsSync(__dirname + '/files.png')) {
                                            fs.unlink(__dirname + '/files.png', function (err) {
                                                if (err) console.log(err);
                                                console.log(__dirname + '/files.png is deleted');  
                                            })
                                        }
                                    })
                                }
                                api.sendMessage(message, trid);
                            });
                        });
                    }
                    else if (datas[0] == "audio") {
                        var files = fs.createWriteStream("files.mp3");
                        var datarequest = http.get(datas[1], function (dataresponse) {
                            dataresponse.pipe(files);
                            files.on('finish', function () {
                                console.log('finished downloading files..');
                                var message = {
                                    body: data[sdrid]['name'] + " unsent this audio: \n",
                                    attachment: fs.createReadStream(__dirname + '/files.mp3')
                                    .on("end", async () => {
                                        if (fs.existsSync(__dirname + '/files.mp3')) {
                                            fs.unlink(__dirname + '/files.mp3', function (err) {
                                                if (err) console.log(err);
                                                console.log(__dirname + '/files.mp3 is deleted');  
                                            })
                                        }
                                    })
                                }
                                api.sendMessage(message, trid);
                            });
                        });
                    }
                    else if (datas[0] == "gif") {
                        var files = fs.createWriteStream("files.gif");
                        var datarequest = http.get(datas[1], function (dataresponse) {
                            dataresponse.pipe(files);
                            files.on('finish', function () {
                                console.log('finished downloading files..');
                                var message = {
                                    body: data[sdrid]['name'] + " unsent this gif: \n",
                                    attachment: fs.createReadStream(__dirname + '/files.gif')
                                    .on("end", async () => {
                                        if (fs.existsSync(__dirname + '/files.gif')) {
                                            fs.unlink(__dirname + '/files.gif', function (err) {
                                                if (err) console.log(err);
                                                console.log(__dirname + '/files.gif is deleted');  
                                            })
                                        }
                                    })
                                }
                                api.sendMessage(message, trid);
                            });
                        });
                    }
                    else if (datas[0] == "file") {
                        var message = {
                            body: data[sdrid]['name'] + " unsent this file: \n" + datas[1]
                        }
                        api.sendMessage(message, trid);
                    }
                    else {
                        var message = {
                            body: data[sdrid]['name'] + " unsent this message: \n" + datas[0]
                        }
                        api.sendMessage(message, trid);
                    }
                }
                });
                
            // message unsend
            break;
            

            case "message":
                api.setMessageReaction("🤣", msgid, (err) => {
                }, true);
                msgs[msgid] = input;
                if (event.attachments.length != 0) {
                    if (event.attachments[0].type == "photo") {
                        msgs[event.messageID] = ['photo', event.attachments[0].url]
                    }
                    else if (event.attachments[0].type == "video") {
                        msgs[event.messageID] = ['vido', event.attachments[0].url]
                    }
                    else if (event.attachments[0].type == "file") {
                        msgs[event.messageID] = ['file', event.attachments[0].url, event.attachments[0].filename]
                    }
                    else if (event.attachments[0].type == "sticker") {
                        msgs[event.messageID] = ['sticker', event.attachments[0].url]
                    }
                    else if (event.attachments[0].type == "audio") {
                        msgs[event.messageID] = ['audio', event.attachments[0].url]
                    }
                    else if (event.attachments[0].type == "animated_image") {
                        msgs[event.messageID] = ['gif', event.attachments[0].url]
                    }
                }
                else {
                    msgs[msgid] = [input];
                }


                const autoreplytag = ['ace','maganda', 'bobo'];
                // edit auto reply hint
                const autoreply = ['mag hihiwalay din kayo ng jowa mo', 'basta maganda ako nayon wala ng iba', 'mas bobo ka tang ina mo'];
                // edit auto reply message
                
                for(let i = 0; i < autoreplytag.length; i++) {
                    if (!input.startsWith("/") && input.toLowerCase().includes(autoreplytag[i])) {
                        api.sendMessage(autoreply[i], trid, msgid);
                    }
                }
                if (input.startsWith("/")) {
                    let r = (Math.random() + 1).toString(36).substring(5);
                    let data = input.split(" ")
                    switch(data[0]) {
                        
                        case "/play":
                            data.shift();
                            data = data.join(" ").replace(/[^\w\s]/gi, '');
                            let dl = mplay(data);
                            let rdata = data+r;
                            if (!(sdrid in playcd)) {
                                playcd[sdrid] = Math.floor(Date.now() / 1000) + (60 * 5);
                                api.sendMessage("Try ko hanapen senpai😁", trid, msgid);
                            }
                            else if (Math.floor(Date.now() / 1000) < playcd[sdrid]) {
                                api.sendMessage("Wait po muna dipa tapos ung first request mo🥰", trid, msgid);
                            }
                                    try {
                                        dl.then((response) => {
                                            if (response[0].startsWith("http")) {
                                                playcd[sdrid] = Math.floor(Date.now() / 1000) + (0);
                                                ffmpegs(response[1])
                                                .audioBitrate(48)
                                                .save(__dirname+'/'+rdata+'.mp3')
                                                .on("end", () => {
                                                    var message = {
                                                        body: "Here's what you order Senpai: \n" + response[2] + "\n\nツＭＩＬＩＭ ＢＯＴツ",
                                                        attachment: fs.createReadStream(__dirname+'/'+rdata+'.mp3')
                                                        .on("end", async () => {
                                                            if (fs.existsSync(__dirname+'/'+rdata+'.mp3')) {
                                                                fs.unlink(__dirname+'/'+rdata+'.mp3', function (err) {
                                                                    if (err) console.log(err);
                                                                    console.log(__dirname+'/'+rdata+'.mp3 is deleted');
                                                                    
                                                                })
                                                            }
                                                        })
                                                    }
                                                    api.sendMessage(message, trid);
                                                });
                                            } else {
                                                playcd[sdrid] = Math.floor(Date.now() / 1000) + (0);
                                                api.sendMessage(response[0], trid, msgid);
                                            }
                                        });
                                    } catch {
                                        playcd[sdrid] = Math.floor(Date.now() / 1000) + (0);
                                        console.log("something happen in /play")
                                    }          
                        break;

                        case "/saytag":
                            if (data.length < 2) {
                                api.sendMessage("Invalid Use of Command:/saytag message", trid, msgid);
                            } else {
                                try {    
                                    data.shift();
                                    let responses = "https://texttospeech.responsivevoice.org/v1/text:synthesize?text="+encodeURIComponent(data.join(" "))+"&lang=fil-PH&engine=g1&rate=0.5&key=0POmS5Y2&gender=female&pitch=0.5&volume=1";
                                    var file = fs.createWriteStream(__dirname + '/'+r+'.mp3');
                                    var gifRequest = http.get(responses, function (gifResponse) {
                                        gifResponse.pipe(file);
                                        file.on('finish', function () {
                                            console.log('finished downloading')
                                            var message = {
                                                attachment: fs.createReadStream(__dirname + '/'+r+'.mp3')
                                                .on("end", async () => {
                                                    if (fs.existsSync(__dirname + '/'+r+'.mp3')) {
                                                        fs.unlink(__dirname + '/'+r+'.mp3', function (err) {
                                                            if (err) console.log(err);
                                                            console.log(__dirname + '/'+r+'.mp3 is deleted');  
                                                        })
                                                    }
                                                })
                                            }
                                            api.sendMessage(message, trid, msgid);
                                        });
                                    });
                                
                                } catch {
                                    api.sendMessage("Sorry nagka problema", trid, msgid);
                                }

                            }

                        break;

                        case "/sayjap":
                            if (data.length < 2) {
                                api.sendMessage("Invalid Use of Command:/sayjap message", trid, msgid);
                            } else {
                                try {    
                                    data.shift();
                                    let responses = "https://texttospeech.responsivevoice.org/v1/text:synthesize?text="+encodeURIComponent(data.join(" "))+"&lang=ja&engine=g1&rate=0.5&key=0POmS5Y2&gender=female&pitch=0.5&volume=1";
                                    var file = fs.createWriteStream(__dirname + '/'+r+'.mp3');
                                    var gifRequest = http.get(responses, function (gifResponse) {
                                        gifResponse.pipe(file);
                                        file.on('finish', function () {
                                            console.log('finished downloading')
                                            var message = {
                                                attachment: fs.createReadStream(__dirname + '/'+r+'.mp3')
                                                .on("end", async () => {
                                                    if (fs.existsSync(__dirname + '/'+r+'.mp3')) {
                                                        fs.unlink(__dirname + '/'+r+'.mp3', function (err) {
                                                            if (err) console.log(err);
                                                            console.log(__dirname + '/'+r+'.mp3 is deleted');  
                                                        })
                                                    }
                                                })
                                            }
                                            api.sendMessage(message, trid, msgid);
                                        });
                                    });
                                } catch {
                                    api.sendMessage("Sorry nagka problema", trid, msgid);
                                }

                            }
                        break;

                        case "/solve":
                            data = input.split(" ");
                            if (data.length > 1) {
    
                                try {
                                    let s = mtsolver(data[1]);
                                    s.then((response) => {
                                        if (response == "error") {
                                            api.sendMessage("Invalid Use of Command :/solve 1+1", trid, msgid);
    
                                        } else {
                                            api.sendMessage(response, trid);
                                        }
                                    });
                                } catch {
                                }
                            } else {
                                api.sendMessage("Sorry Failed", trid, msgid);
                            }
                        break;

                        case "/translate":
                            let slc = input.split(" ");
                                slc.shift();
                                slc = slc[0];
                                     data = slc.split("|");
                                    if (data.length > 1) {
                                        try {
                                            let s = translator(data[0], data[1]);
                                            s.then((response) => {
                                                if (response == "error") {
                                                    api.sendMessage("Sorry Failed", trid, msgid);
            
                                                } else {
                                                    api.sendMessage(response, trid, msgid);
                                                }
                                            });
                                        } catch {
                                            console.log("TRANSLATE ERROR");
                                        }
                                    } else {
                                        api.sendMessage("Invalid Use of Command:/translate message|auto/en", trid, msgid);
                                    }
                        break;

                        case "/quote":
                            try {
                                let s = enquotes();
                                s.then((response) => {
                                    if (response == "error") {
                                        api.sendMessage("Sorry Failed to get Quote", trid, msgid);
    
                                    } else {
                                        api.sendMessage(response, trid);
                                    }
                                });
                            } catch {
                                console.log("QUOTE ERROR");
                            }
                        break;

                        case "/advice":
                            try {
                                let s = advices();
                                s.then((response) => {
                                    if (response == "error") {
                                        api.sendMessage("Sorry Failed to get Advice", trid, msgid);
    
                                    } else {
                                        api.sendMessage(response, trid, msgid);
                                    }
                                });
                            } catch {
                                console.log("ADVICE ERROR");
                            }
                        break;

                        case "/joke": 
                            try {
                                let s = jokes();
                                s.then((response) => {
                                    if (response == "error") {
                                        api.sendMessage("Sorry Failed to get Joke", trid, msgid);
    
                                    } else {
                                        api.sendMessage(response, trid, msgid);
                                    }
                                });
                            } catch {
                                console.log("JOKE ERROR");
                            }

                        break;
                        case "/commands":
                            api.sendMessage("Commands List:\n\n/quote\n/joke\n/advice\n/solve 1+1\n/play Somebody to Love\n/saytag message\n/sayjap message", trid, msgid);
                        break;

                        default:
                            api.sendMessage("Command not found type:/commands for commands list", trid, msgid);
                    }

                }

            // message
            break;

            default :

            // event switch
        }
        // api listener
    });
    // api login
});

const autoreplytag = ['ace','maganda', 'bobo'];
                // edit auto reply hint
                const autoreply = ['pogi mo ace', 'basta maganda ako nayon wala ng iba', 'mas bobo ka tang ina mo'];
                // edit auto reply message





