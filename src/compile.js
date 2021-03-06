#!/usr/bin/env node

'use strict';
var program = require('commander');
var stdin = require('get-stdin');
var fs = require('fs');
var jade = require('jade');

process.title = 'compile-99';


// --- Language processing features like name mangling, etc


/*! litejs.com/MIT-LICENSE.txt */
var naturalCompare=function(g,h){function f(b,c,a){if(a){for(d=c;a=f(b,d),76>a&&65<a;)++d;return+b.slice(c-1,d)}a=m&&m.indexOf(b.charAt(c));return-1<a?a+76:(a=b.charCodeAt(c)||0,45>a||127<a)?a:46>a?65:48>a?a-1:58>a?a+18:65>a?a-11:91>a?a+11:97>a?a-37:123>a?a+5:a-63}var d,c,b=1,k=0,l=0,m=String.alphabet;if((g+="")!=(h+=""))for(;b;)if(c=f(g,k++),b=f(h,l++),76>c&&76>b&&66<c&&66<b&&(c=f(g,k,k),b=f(h,l,k=d),l=d),c!=b)return c<b?-1:1;return 0};
try{module.exports=naturalCompare}catch(e){String.naturalCompare=naturalCompare};


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

var commentForLanguage = function(w, language) {
    // we can figure out multiline another time.
    if (w.match("\n")) {
        return w.split("\n").map(function(x){ return commentForLanguage(x, language); }).join("\n");
    }
    switch (language) {
        case "haskell":
            return "-- " + w;
        case "prolog":
            return "% " + w;
        case "python":
            return "# " + w;
        case "javascript":
            return "// " + w;
        default:
            return w;
    }
}

var getLanguageExtension = function(language) {
    switch (language) {
        case "haskell":
            return "hs";
        case "prolog":
            return "pl";
        case "python":
            return "py";
        case "javascript":
            return "js";
        default: 
            return "hs";
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
    .option('-o, --outfile [outfile]', 'Outfile for complied HTML', String)
    .option('-s, --outstubfile [outstubfile]', 'Outfile to be filled with comments, one for each problem', String)
    .option('-p, --problemlist [problemlist]', 'JSON file containing a list of problems', String)
    .option('-t, --templatefile [templatefile]', 'jade/pug template file', String)
    .parse(process.argv);


function render_stub_page(probs, language, outfile) {
    var comment = function(x) { return commentForLanguage(x, language); };
    var outarray = [comment("99 Problems in " + language), comment("autogenerated stub file with function names"), comment("on "+(new Date).toDateString()), "", ""];
    for (var p of Object.keys(probs).sort(naturalCompare)) {
        var prob = probs[p]
        outarray.push(comment("Problem " + p));
        outarray.push(comment("  " + prob['function-name']));
        outarray.push("");
        outarray.push("");
    }
    
    console.log("Rendering problems to file ", outfile);
    fs.writeFileSync(outfile, outarray.join("\n"), 'utf8');
}

function render_problems_page(contents, file, probs, language, outfile) {
    var params = {
        pretty: '\t',
        globals: ['problems']
    };

    // Set these two global variables so our jade template has access to them.
    global.problems = {
        language: language,
        problemlist: probs,
        language_extension: getLanguageExtension(language)
    }
    //global.language = {language: language};

    var output = jade.render(contents, params);
    //console.log(output);
    console.log("Rendering template to file ", outfile);
    fs.writeFileSync(outfile, output, 'utf8');
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
    global.contents = fs.readFileSync(file, 'utf8');
}

if (program.outfile) {
    var problemlist = JSON.parse(fs.readFileSync(program.problemlist, 'utf8'));
    // make sure all the names are pre-mangled and examples have the mangled names
    processProblemsForLanguage(problemlist, program.language);

    render_problems_page(global.contents, file, problemlist, program.language, program.outfile);
}
if (program.outstubfile) {
    var problemlist = JSON.parse(fs.readFileSync(program.problemlist, 'utf8'));
    // make sure all the names are pre-mangled and examples have the mangled names
    processProblemsForLanguage(problemlist, program.language);
    
    render_stub_page(problemlist, program.language, program.outstubfile);
}
process.exit(0);
