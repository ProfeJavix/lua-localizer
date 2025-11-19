import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

const luaMetaDirs = [
    "server/meta/3rd/lua",
    "meta/3rd/lua",
    "server/meta",
    "meta"
];

const funcRegex = /function\s+([A-Za-z_][A-Za-z0-9_]*(?:\.[A-Za-z_][A-Za-z0-9_]*)*)\s*\(/g;
const assignFuncRegex = /([A-Za-z_][A-Za-z0-9_]*(?:\.[A-Za-z_][A-Za-z0-9_]*)*)\s*=\s*function\s*\(/g;
const callRegex = /([A-Za-z_][A-Za-z0-9_]*(?:[.:][A-Za-z_][A-Za-z0-9_]*)*)\s*\(/g
const localizedRegex = /local\s+(\w+)\s*=\s*([\w\.]+)/g;
const regionRegex = /--#region Localizations[^\n]*([\s\S]*?)--#endregion[^\n]*/;

const getLuaExtensionPathsInDir = (dir: string, allPaths: string[]) => {
	for (const d of fs.readdirSync(dir)) {
		const full = path.join(dir, d)
		if (fs.statSync(full).isDirectory()){
			allPaths.push(full)
			getLuaExtensionPathsInDir(full, allPaths)
		}
	}
}

const getAllLuaExtensionPaths = async (arrFiles: string[]): Promise<boolean> => {
	const lua = vscode.extensions.getExtension("sumneko.lua");

	if (!lua) {
        vscode.window.showErrorMessage("Lua extension is not installed.");
        return false;
    }

	await lua.activate();

	let metaPath = null;
	for (const dir of luaMetaDirs){
		const p = path.join(lua.extensionPath, dir);
		if (fs.existsSync(p)){
			metaPath = p
			break;
		}
	}

	if (!metaPath) {
        vscode.window.showErrorMessage("Could not find Lua functions.");
        return false;
    }

	getLuaExtensionPathsInDir(metaPath, arrFiles)

	return true;
}

const getLocalizedFuncs = (regionContent: string): Map<string, string> => {
	const funcs = new Map<string, string>();

	let match;
	while ((match = localizedRegex.exec(regionContent))) {
		funcs.set(match[2], match[1])
	}

	return funcs
}

const getDefsFromFile = (content: string): Map<string, string> => {
	const map = new Map<string, string>();

	let match, fnStr;

	while ((match = funcRegex.exec(content))) {
		fnStr = match[1]
		map.set(fnStr, fnStr.split('.').pop() || fnStr)
	}

	while ((match = assignFuncRegex.exec(content))) {
		fnStr = match[1]
		map.set(fnStr, fnStr.split('.').pop() || fnStr)
	}

	return map
}


export function activate(context: vscode.ExtensionContext) {

	const disposable = vscode.commands.registerCommand('lua-localizer.localize', async () => {

		const editor = vscode.window.activeTextEditor;
		if (!editor || editor.document.languageId !== 'lua') {
			vscode.window.showErrorMessage('You must open a Lua file.');
			return;
		}

		const paths = vscode.workspace.getConfiguration("Lua").get<string[]>("workspace.library") || [];
		if (paths.length === 0) {
			vscode.window.showWarningMessage('No paths specified in: Settings → Lua → Workspace: Library.');
		}
		
		if (!(await getAllLuaExtensionPaths(paths))){
			return;
		}

		const doc = editor.document;
		let docText = doc.getText();

		let regionFound = regionRegex.exec(docText);

		const localizedCalls = regionFound ? getLocalizedFuncs(regionFound[1]) : new Map<string, string>();

		if (regionFound) {
			docText = docText.substring(0, regionFound.index) + docText.substring(regionFound.index + regionFound[0].length)
		}

		const defs = new Map<string, string>();
		for (let curPath of paths) {
			try {
				fs.readdirSync(curPath).forEach(file => {
					if (file.endsWith('.lua')) {
						getDefsFromFile(fs.readFileSync(path.join(curPath, file), "utf-8")).forEach((v, k) => {
							defs.set(k, v);
						})
					}
				})
			} catch (err) {
				vscode.window.showWarningMessage(`Couldn't read folder: ${curPath}`);
			}
		}

		const calls = new Set<string>();
		const selectedText = editor.selection.isEmpty? docText: editor.document.getText(editor.selection)

		let match;
		while ((match = callRegex.exec(selectedText))) {
			const call = match[1];
			if (defs.has(call)){
				calls.add(match[1]);
			}
		}

		if (calls.size === 0){
			vscode.window.showInformationMessage('No functions to localize.');
			return
		}

		await editor.edit(editBuilder => {

			docText = doc.getText()
			const replacements: any[] = [];

			calls.forEach(call => {

				if (localizedCalls.has(call))
					return

				let index = 0;

				while ((index = docText.indexOf(call, index)) !== -1) {
					replacements.push({
						range: new vscode.Range(doc.positionAt(index), doc.positionAt(index + call.length)),
						str: defs.get(call)
					});
					index += call.length;
				}
			})

			replacements.forEach(r => {
				editBuilder.replace(r.range, r.str);
			})

			vscode.window.showInformationMessage(`Localized functions: ${replacements.length}.`);
		});

		await editor.edit(editBuilder => {

			calls.forEach(call => {
				if (!localizedCalls.has(call)) {
					localizedCalls.set(call, defs.get(call) || call)
				}
			});

			const regionContent =
				'--#region Localizations ---------------------------------------------------------------------\n\n' +
				Array.from(localizedCalls)
					.map(([global, local]) => `local ${local} = ${global}`)
					.sort()
					.join('\n') +
				'\n\n--#endregion --------------------------------------------------------------------------------';

			docText = doc.getText();

			regionFound = regionRegex.exec(docText);
			if (regionFound) {
				editBuilder.replace(
					new vscode.Range(
						doc.positionAt(regionFound.index),
						doc.positionAt(regionFound.index + regionFound[0].length)
					),
					regionContent
				);
			} else {
				let index = 0
				while (index < doc.lineCount) {
					if (!doc.lineAt(index).text.startsWith('--')) {
						break
					}
					index++;
				}

				editBuilder.insert(new vscode.Position(index, 0), regionContent + '\n\n');
			}
		})
	})

	context.subscriptions.push(disposable);
}

export function deactivate() { }
