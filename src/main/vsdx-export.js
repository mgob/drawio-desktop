import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const vsdxDir = path.join(path.dirname(fileURLToPath(import.meta.url)), 'vsdx');

let script = null;

// The VSDX exporter was removed from the public drawio core (it is only in the
// internal build since 2026). The last Apache 2.0 sources live in
// src/main/vsdx and are injected into each editor window once its app has
// loaded. A core that already defines VsdxExport keeps its own.
export function buildVsdxScript(dir = vsdxDir)
{
	const read = (name) => fs.readFileSync(path.join(dir, name), 'utf-8');

	return 'if (typeof window.VsdxExport === \'undefined\')\n' +
		'{\n(function()\n{\n' +
		read('mxVsdxCanvas2D.js') + '\n' +
		read('VsdxExport.js') + '\n' +
		'window.mxVsdxCanvas2D = mxVsdxCanvas2D;\n' +
		'window.VsdxExport = VsdxExport;\n' +
		'})();\n}\n' +
		read('desktop-vsdx.js');
}

export function getVsdxScript()
{
	if (script == null)
	{
		script = buildVsdxScript();
	}

	return script;
}

// Idempotent: desktop-vsdx.js guards against running twice in a page
export function injectVsdxExport(webContents)
{
	return webContents.executeJavaScript(getVsdxScript(), false).catch((e) =>
	{
		console.error('VSDX export injection failed:', e);
	});
}
