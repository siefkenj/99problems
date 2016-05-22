# 99problems
99 Problems for various programming languages

Inspired by 99 Prolog Problems, 99 Lisp Problems, 99 Haskell Problems, *99problems*
is an attempt to unify the various problem lists so they can be practiced in may different
languages.

For the source websites, see
* [99 Prolog](https://prof.ti.bfh.ch/hew1/informatik3/prolog/p-99/)
* [99 Haskell](https://wiki.haskell.org/H-99:_Ninety-Nine_Haskell_Problems)
* [99 Lisp](http://www.ic.unicamp.br/~meidanis/courses/mc336/2006s2/funcional/L-99_Ninety-Nine_Lisp_Problems.html)


## Compiling

To compile 99 problems, you need *Node.js* with the `jade`, `get-stdin`, and `commander` packages.
(`npm install <package name>` to install them yourself.)  Possibly-outdated versions of these
packages are in the `node_modules` directory.

`src/compile.js` will process a `jade/pug` template and render an html file for the language of 
your choice.  For example, to render the file for Haskell, you would execute

	./src/compile.js -t src/problem_template.jade -p src/problemlist.json -l haskell -o dist/haskell_problems.html

from the `99problems` directory.  You can then view `dist/haskell_problems.html` in your webbrowser.

## Notes

99 Problems uses MathJax to render mathematical formulas.  Most webbrowsers prevent loading
non-local content if you are viewing a local file.  Therefore, to see 99 Problems locally,
you must serve it up with a web server.  If you have `python2` installed, you start a temporary
web server with

	cd dist
	python2 -m SimpleHTTPServer

and then view 99 Problems by visiting `localhost:8000/` in your webbrowser.

## Contributing

If you'd like to add a language to 99 Problems, just edit `src/problemlist.json` and
add `language-overrides` for your favorite language.  Then file a pull request!
