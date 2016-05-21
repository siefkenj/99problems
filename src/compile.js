#!/usr/bin/env node

'use strict';
var program = require('commander');
var stdin = require('get-stdin');
var fs = require('fs');
var jade = require('jade');

process.title = 'compile-99';


// --- Language processing features like name mangling, etc

var snakeCase = function(w) {
    return w.split(" ").join('_');
}

// mangle a name so it doesn't conflict with any language keywords.
// w is a string containting a function name.  If the function name
// is composed on multiple words (like "in string") each word is separated
// by a space.
var mangleForLanguage = function(w, language) {
    if (language == "XXX") {
        return "XXX";
    } else {
        // default is snake case with trailing "_"
        return snakeCase(w) + "_";
    }
}

var processProblemsForLanguage = function(problems, language) {
    for (var k in problems) {
        problems[k]['function-name'] = mangleForLanguage(problems[k]['function-name'], language);
        var mangledName = problems[k]['function-name'];

        var overrides;
        if ( overrides = (problems[k]['language-overrides'] || {})[language] ) {
            // replace "FN" in each example with the actual name of the function
            for (var i = 0; i < overrides.examples.length; i++) {
                overrides.examples[i].input = overrides.examples[i].input.replace("FN", mangledName);
                overrides.examples[i].output = overrides.examples[i].output.replace("FN", mangledName);
            }
        }
    }
}

// --------------------------------------------------------




global.contents = "";
var pkg = {
    description: "Compile a jade template for a particular programming language",
    version: "0.1"
}

program
    .description(pkg.description)
    .version(pkg.version)
    .usage('[options] <template file>')
    .option('-l, --language [language]', 'Target Language to compile for [haskell]', 'haskell')
    .option('-o, --outfile [outfile]', 'Outfile for complied HTML [output.html]', 'output.html')
    .option('-p, --problemlist [problemlist]', 'JSON file containing a list of problems [problemlist.json]', 'problemlist.json')
    .option('-t, --templatefile [templatefile]', 'jade/pug template file', String)
    .parse(process.argv);

function run(contents, file, probs, language, outfile) {
    var params = {
        pretty: '\t',
        globals: ['problems']
    };

    // Set these two global variables so our jade template has access to them.
    global.problems = {
        language: language,
        problemlist: probs
    }
    //global.language = {language: language};

    var output = jade.render(contents, params);
    //console.log(output);
    console.log("Rendering template to file ", outfile);
    fs.writeFileSync(outfile, output, 'utf8');
    process.exit(0);
}

if (!process.stdin.isTTY) {
    return stdin(function (contents) {
        global.contents = contents;
    });
}

// the first argument not consumed by argparsing
var file = program.templatefile || program.args[0];
if (!file && !global.contents) {
    console.log('A file is required');
    program.help();
    process.exit(1);
}
if (!global.contents) {
    contents = fs.readFileSync(file, 'utf8');
}
var problemlist = JSON.parse(fs.readFileSync(program.problemlist, 'utf8'));
// make sure all the names are pre-mangled and examples have the mangled names
processProblemsForLanguage(problemlist, program.language);

run(global.contents, file, problemlist, program.language, program.outfile);
