# Links

- https://code.visualstudio.com/api/language-extensions/syntax-highlight-guide
- https://www.apeth.com/nonblog/stories/textmatebundle.html
- https://macromates.com/manual/en/language_grammars
- https://code.visualstudio.com/api/working-with-extensions/publishing-extension

# Development
- Open folder in Visual Studio Code
- Install dependencies: `npm install -g js-yaml vsce && npm install`
- Convert TextMate yaml to json: `js-yaml syntaxes/opsi-script.tmLanguage.yaml > syntaxes/opsi-script.tmLanguage.json`
- Compile extension code: `tsc -p ./`
- Debug: <F5>
- Debug Syntax Highlighting: <F1> "Developer: Inspect Editor Tokens and Scopes"
- Package extension: `vsce package`

# ToDo
- OpsiServiceCall call parameters (/interactive, /opsiclientd, ...)
