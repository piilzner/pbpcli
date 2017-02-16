#! /usr/bin/env node
var path = require('path');
var program = require('commander');
var chalk = require('chalk');
var repo = require('download-github-repo');
var fs = require('fs');
var axios = require('axios');
var treeify = require('treeify');
var mkdirp = require('mkdirp');

program.version('0.5.0')

program.command('list')
       .description('Lists availebel boilerplates')
       .action(list);

program.command('install <boilerplate> <name>')
       .description('Creates the scaffold file')
       .action(install);

program.command('generate <type> <name>')
       .description('Generates file from pbp.json')
       .action(generate);

//Empty for a space on --help
program.command('')
       .description('')
       .action(function(){});

program.command('l')
       .description('See list')
       .action(list);

program.command('i <boilerplate> <name>')
       .description('See install')
       .action(install);

program.command('g <type> <name>')
       .description('See generate')
       .action(generate);


function install(boilerplate, name){
    var dir = process.cwd() + "/" + name
    if (!fs.existsSync(dir)) {
        fs.mkdir(process.cwd() + "/" + name, function(){
            repo("piilzner/pbp#" + boilerplate, dir, function(a){
                success("Successfully created boilerplate: " + boilerplate);
                console.log("cd to " + name + " & npm install");                    
            });
        });
    }else{
        warning("Directory " + process.cwd() + "/" + name +" allready exists");
    }
}

function list(){
    var url = "https://piilzner.github.io/pbp/public/boilerplates.json";

    axios.get(url).then(function (res) {
        success("Available boilerplates");
        console.log(treeify.asTree(res.data));
    }).catch(function (error) {
        error("Can not do http call for available boilerplates, check your internet connection!");
    });
}

function generate(type, name){
    var dir = process.cwd();
    var pbpfile = dir + "/pbp.json";

    if (fs.existsSync(pbpfile)) {
        var pbpopts = JSON.parse(fs.readFileSync(pbpfile, "utf-8"));
        if(pbpopts[type]){
            mkdirp.sync(dir + pbpopts[type].path);
            if(!fs.existsSync(dir + pbpopts[type].path + name + pbpopts[type].nametemplate)){
                fs.writeFile(dir + pbpopts[type].path + name + pbpopts[type].nametemplate, createFileContents(pbpopts[type].contents, name), "utf-8", function(err){
                    if(err){
                        error("Culd not create file " + dir + pbpopts[type].path + name + pbpopts[type].nametemplate);
                    }else{
                        success("Successfully created " + type + " in " + dir + pbpopts[type].path + name + pbpopts[type].nametemplate);
                    }
                }); 
            }else{
                error("File: " + dir + pbpopts[type].path + name + pbpopts[type].nametemplate + " allready exists");  
            }
        }else{
            error("Culd not finde a skaffold of type: " + type)
        }
    }else{
        error("To generate files a pbp.json file is requierd. check documentation at: http://");
    }
}

function createFileContents(arr, name){
    var contents = "";
    for(var i = 0; i < arr.length; i++){
        contents = contents + arr[i] + "\n";
    }
    contents = contents.replace("#NAME#", name);
    return contents;
}

function warning(msg){
    console.log(chalk.yellow(msg));
}

function success(msg){
    console.log(chalk.green(msg));
}

function error(msg){
    console.log(chalk.red(msg));
}

program.parse(process.argv);