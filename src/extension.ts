/*
Copyright (C) uib GmbH. All rights reserved.

Samples: https://github.com/microsoft/vscode-extension-samples/blob/main/completions-sample
*/

import * as vscode from 'vscode';
import * as path from 'path';

// This method is called when your extension is activated
export function activate(context: vscode.ExtensionContext) {

	console.log('Activating extension "opsi-script"');

	const tmlangFile = vscode.Uri.file(
		path.join(context.extensionPath, 'syntaxes', 'opsi-script.tmLanguage.json')
	);
	console.log(`Loading syntax highlighting from "${tmlangFile.path}"`);
	const tmLang = require(tmlangFile.path);

	let disposable = vscode.commands.registerCommand('opsi-script.testCommand', () => {
		vscode.window.showInformationMessage('Test from opsi-script');
	});
	context.subscriptions.push(disposable);

	const keywordCompletionProvider = vscode.languages.registerCompletionItemProvider('opsi-script', {

		provideCompletionItems(
			document: vscode.TextDocument,
			position: vscode.Position,
			token: vscode.CancellationToken,
			context: vscode.CompletionContext
		) {
			let completions:vscode.CompletionItem[] = [];
			let labels:string[] = [];

			let secondarySectionType = null;
			let range = new vscode.Range(0, 0, document.lineAt(position).lineNumber, 0);
			let text = document.getText(range);
			let matches = text.match(/^\s*\[[^\]]+\]\s*$/gm);

			if (matches) {
				let section = matches[matches.length-1].trim().toLowerCase().replace(/[\[\]]/g, "");
				if (['actions', 'aktionen', 'profileactions'].includes(section) || section.startsWith("sub")) {
					// primary section
				}
				else {
					secondarySectionType = "unhandled";
					for (let secType of [
						"files", "registry", "patches", "patchtextfile", "linkfolder",
						"opsiservicecall", "patchhost", "xml2", "ldapsearch"
					]) {
						if (section.startsWith(secType)) {
							secondarySectionType = secType;
							break;
						}
					}
				}
			}

			for (let pattern of tmLang["repository"]["literal-constant-percent"]["patterns"]) {
				if (!pattern["match"]) continue;
				for (let name of pattern["match"].replace(/.+\(%\)\(/, '').replace(/\)\(%\).*/, '').split('|')) {
					if (labels.includes(name)) continue;
					labels.push(name);
					let startChar = null;
					if (position.character > 1) {
						startChar = document.lineAt(position).text.substr(position.character-2, 1);
					}
					let completion = new vscode.CompletionItem(`%${name}%`, vscode.CompletionItemKind.Constant);
					completion.sortText = `4_${name}%`
					if (startChar == "%") {
						completion.insertText = `${name}%`;
					}
					else {
						completion.insertText = `%${name}%`;
					}
					completions.push(completion);
				}
			}

			for (let pattern of tmLang["repository"]["literal-constant-slash"]["patterns"]) {
				if (!pattern["match"]) continue;
				for (let name of pattern["match"].replace(/.+\(\/\)\(/, '').split('|')) {
					if (labels.includes(name)) continue;
					labels.push(name);
					let startChar = null;
					if (position.character > 1) {
						startChar = document.lineAt(position).text.substr(position.character-2, 1);
					}
					let completion = new vscode.CompletionItem(`/${name}`, vscode.CompletionItemKind.Constant);
					completion.sortText = `4_${name}`
					if (startChar == "/") {
						completion.insertText = `${name}`;
					}
					else {
						completion.insertText = `/${name}`;
					}
					completions.push(completion);
				}
			}

			let entries: { [kind: string]: string[] } = {
				Function: [],
				Constant: [],
				Keyword: []
			};

			console.log(`secondarySectionType: ${secondarySectionType}`)
			if (!secondarySectionType) {
				// In primary section
				let completion = new vscode.CompletionItem("[Registry_<identifier>]", vscode.CompletionItemKind.Snippet);
				completion.insertText = new vscode.SnippetString(
					'[Registry_${1}]\nOpenKey ["HKLM\\Software"]\nSet "var" = REG_DWORD:1\n'
				);
				completion.additionalTextEdits = [
					vscode.TextEdit.delete(document.lineAt(position).rangeIncludingLineBreak)
				];
				completions.push(completion);

				entries.Function.push("primary-section-functions");
				entries.Keyword.push("primary-section-keyword-storage");
			}
			else if (secondarySectionType == "registry") {
				entries.Function.push("secondary-section-registry");
				entries.Constant.push("secondary-section-registry-constants");
			}
			else if (secondarySectionType == "patches") {
				entries.Function.push("secondary-section-patches");
			}
			else if (secondarySectionType == "patchtextfile") {
				entries.Function.push("secondary-section-patch-text-file");
				entries.Constant.push("secondary-section-patch-text-file-constants");
			}
			else if (secondarySectionType == "linkfolder") {
				entries.Function.push("secondary-section-link-folder");
				entries.Constant.push("secondary-section-link-folder-constants");
				entries.Keyword.push("secondary-section-link-folder-attributes");
			}
			else if (secondarySectionType == "opsiservicecall") {
				entries.Function.push("secondary-section-opsi-service-call");
				entries.Constant.push("secondary-section-opsi-service-call-constants");
			}
			else if (secondarySectionType == "patchhost") {
				entries.Function.push("secondary-section-patch-host");
			}
			else if (secondarySectionType == "xml2") {
				entries.Function.push("secondary-section-xml2");
				entries.Constant.push("secondary-section-xml2-constants");
			}
			else if (secondarySectionType == "ldapsearch") {
				entries.Function.push("secondary-section-ldap-search");
				entries.Keyword.push("secondary-section-ldap-search-keywords");
			}

			for (let kindName in entries) {
				let kind;
				let sortPrefix = "";
				if (kindName == "Function") {
					kind = vscode.CompletionItemKind.Function;
					sortPrefix = "1_";
				}
				else if (kindName == "Keyword") {
					kind = vscode.CompletionItemKind.Keyword;
					sortPrefix = "2_";
				}
				else if (kindName == "Constant") {
					kind = vscode.CompletionItemKind.Constant;
					sortPrefix = "3_";
				}

				for (let entry of entries[kindName]) {
					//console.log(entry);
					for (let pattern of tmLang["repository"][entry]["patterns"]) {
						//console.log(pattern);
						if (!pattern["match"]) continue;
						for (let name of pattern["match"].replace(/^.+\\b\(/, '').replace(/\).*/, '').split('|')) {
							if (labels.includes(name)) continue;
							labels.push(name);
							let completion = new vscode.CompletionItem(name, kind);
							completion.sortText = `${sortPrefix}${name}`
							//completion.insertText = new vscode.SnippetString(name + '("${1}")');
							completions.push(completion);
						}
					}
				}
			}
			return completions;
		}
	});
	context.subscriptions.push(keywordCompletionProvider);
}

// This method is called when your extension is deactivated
export function deactivate() {
}
