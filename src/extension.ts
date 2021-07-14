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
			let completions = [];

			var secondarySectionType = null;
			let range = new vscode.Range(0, 0, document.lineAt(position).lineNumber, 0);
			let text = document.getText(range);
			var matches = text.match(/^\s*\[[^\]]+\]\s*$/gm);

			if (matches) {
				let section = matches[matches.length-1].trim().toLowerCase().replace(/[\[\]]/g, "");
				if (['actions', 'aktionen', 'profileactions'].includes(section) || section.startsWith("sub")) {
					// primary section
				}
				else {
					secondarySectionType = "unhandled";
					for (let secType of ["files", "registry"]) {
						if (section.startsWith(secType)) {
							secondarySectionType = secType;
							break;
						}
					}
				}
			}

			for (let pattern of tmLang["repository"]["literal-constant"]["patterns"]) {
				if (!pattern["match"]) continue;
				for (let name of pattern["match"].replace(/.+\(%\)\(/, '').replace(/\)\(%\).*/, '').split('|')) {
					let startChar = null;
					if (position.character > 1) {
						startChar = document.lineAt(position).text.substr(position.character-2, 1);
					}
					let completion = new vscode.CompletionItem(`%${name}%`);
					if (startChar == "%") {
						completion.insertText = `${name}%`;
					}
					else {
						completion.insertText = `%${name}%`;
					}
					completions.push(completion);
				}
			}

			let functionEntries = [];
			let keywordEntries = [];
			if (!secondarySectionType) {
				// In primary section
				let completion = new vscode.CompletionItem("[Registry_<identifier>]");
				completion.insertText = new vscode.SnippetString(
					'[Registry_${1}]\nOpenKey ["HKLM\\Software"]\nSet "var" = REG_DWORD:1\n'
				);
				completion.additionalTextEdits = [
					vscode.TextEdit.delete(document.lineAt(position).rangeIncludingLineBreak)
				];
				completions.push(completion);

				functionEntries.push("primary-section-functions");
				keywordEntries.push("primary-section-keyword-storage");
			}
			else if (secondarySectionType == "registry") {
				functionEntries.push("secondary-section-registry");
			}

			for (let functionEntry of functionEntries) {
				for (let pattern of tmLang["repository"][functionEntry]["patterns"]) {
					if (!pattern["match"]) continue;
					for (let name of pattern["match"].replace(/^.+\\b\(/, '').replace(/\).*/, '').split('|')) {
						let completion = new vscode.CompletionItem(name);
						//completion.insertText = new vscode.SnippetString(name + '("${1}")');
						completions.push(completion);
					}
				}
			}
			for (let keywordEntry of keywordEntries) {
				for (let pattern of tmLang["repository"][keywordEntry]["patterns"]) {
					if (!pattern["match"]) continue;
					for (let name of pattern["match"].replace(/^.+\\b\(/, '').replace(/\).*/, '').split('|')) {
						let completion = new vscode.CompletionItem(name);
						completions.push(completion);
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
