#!/usr/bin/env node

var action = null;
var actionArgs = [];
for( i = 1 ; i < process.argv.length ; ++i ) {
    if( action ) {
        actionArgs.push(process.argv[i]);
    } else if( process.argv[i] == "play" ) {
        action = "play";
    } else if( process.argv[i] == "design" ) {
        action = "design";
    } else if( process.argv[i] == "test" ) {
        action = "test";
    } else if( process.argv[i] == "tads" ) {
        action = "tads";
    }
}
if( action ) {
    if( action == "design" || action == "play" ) {
        if( actionArgs.length > 0 ) {
            var readline = require('readline');
            var rl = readline.createInterface( process.stdin, process.stdout );            
            var SpellChecker = require('simple-spellchecker');
            var gDict = null;
            SpellChecker.getDictionary("en-US", function(err, dictionary) {
                gDict = dictionary;
            });
            var ltbl = require("ltbl-if")({ filename : actionArgs[0] , action : action , spellCorrect : function(word) { 
                if( gDict ) {
                    var misspelled = !gDict.spellCheck(word);
                    if(misspelled) {
                        var suggestions = gDict.getSuggestions(word);
                        return suggestions;
                    }
                }
                return []; 
            } });

            var commandHandle = function(command) {
                if( ltbl.parseCommand(command) ) {
                    rl.question('>', commandHandle );
                } else {
                    rl.close();
                }
            };

            var i;

            ltbl.loadGame(function(err) {
                ltbl.describe();
                rl.question('>', commandHandle );
            });
        } else {
            console.log("error: design requires a file");
        }
    } else if( action == "test" ) {
        if( actionArgs.length > 1 ) {
            var fs = require('fs');
            fs.readFile(actionArgs[0],"utf8",function(err,data ) {
                if( err ) {
                    console.log("Error opening test input file "+err);
                } else {
                    var lines = data.split("\n");
                    var index = 0;
                    var settings = { filename : "noexist-"+actionArgs[1] , action : "design" , spellCorrect : function(word) { 
                        return []; 
                    } };
                    var ltbl = require("ltbl-if")(settings);
                    ltbl.loadGame(function(err) {
                        settings.filename = actionArgs[1];
                        ltbl.describe();
                        for( var i = 0 ; i < lines.length ; ++i ) {
                            console.log(">"+lines[i]);
                            if( !ltbl.parseCommand(lines[i]) ) {
                                break;
                            }
                        }
                    });
                }
            }); 
        } else {
            console.log("error: test requires an input file and an output file");
        }
    } else if( action == "tads" ) {
        if( actionArgs.length > 1 ) {
            var ltbl = require("ltbl-if")({ filename : actionArgs[0]});
            ltbl.loadGame(function(err) {
                ltbl.exportTads(actionArgs[1]);                
            });
        } else {
            console.log("error: tads requires a file and an output folder");
        }
    }
} else {
    console.log(["usage:","ltbl-if play <filename>","ltbl-if design <filename>","ltbl-if test <input> <output>","ltbl-if tads <filename> <folder> "].join("\n"));
}
