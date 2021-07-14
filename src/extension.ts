/*
Copyright (C) uib GmbH. All rights reserved.

Samples: https://github.com/microsoft/vscode-extension-samples/blob/main/completions-sample
*/

import * as vscode from 'vscode';

// This method is called when your extension is activated
export function activate(context: vscode.ExtensionContext) {

	console.log('Activating extension "opsi-script"');

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
			for (let cmd of ["ShellCall", "PowerShellCall"]) {
				let completion = new vscode.CompletionItem(cmd);
				completion.insertText = new vscode.SnippetString(cmd + '("${1}")');
				//completion.documentation = new vscode.MarkdownString(`Insert a ${cmd}.`);
				completions.push(completion);
			}

			let completion = new vscode.CompletionItem("[Registry_<identifier>]");
			completion.insertText = new vscode.SnippetString(
				'[Registry_${1}]\nOpenKey ["HKLM\\Software"]\nSet "var" = REG_DWORD:1\n'
			);
			completion.additionalTextEdits = [
				vscode.TextEdit.delete(document.lineAt(position).rangeIncludingLineBreak)
			];
			completions.push(completion);

			return completions;
		}
	});
	context.subscriptions.push(keywordCompletionProvider);
}

// This method is called when your extension is deactivated
export function deactivate() {
}
