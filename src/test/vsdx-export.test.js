import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { buildVsdxScript } from '../main/vsdx-export.js';
import { validFormatRegExp } from '../main/args.js';

// Minimal stand-ins for the editor globals the injected script touches
function createPage(extra = {})
{
	function EditorUi() {};
	EditorUi.prototype.vsdxExportEnabled = function() { return false; };

	function mxAbstractCanvas2D() {};

	const plugins = [];
	const listeners = {};

	const window = Object.assign({
		EditorUi,
		mxAbstractCanvas2D,
		mxUtils: { extend: function(ctor, superCtor)
		{
			ctor.prototype = Object.create(superCtor.prototype);
			ctor.prototype.constructor = ctor;
		}},
		Draw: { loadPlugin: (cb) => plugins.push(cb) },
		electron: {
			registerMsgListener: (action, cb) => listeners[action] = cb,
			sendMessage: () => {}
		}
	}, extra);

	window.window = window;

	return { context: vm.createContext(window), plugins, listeners };
}

describe('vsdx export injection', () =>
{
	test('defines VsdxExport and enables the export menu', () =>
	{
		const page = createPage();
		vm.runInContext(buildVsdxScript(), page.context);

		assert.equal(typeof page.context.VsdxExport, 'function');
		assert.equal(typeof page.context.mxVsdxCanvas2D, 'function');
		assert.equal(new page.context.EditorUi().vsdxExportEnabled(), true);
	});

	test('registers the CLI export-vsdx listener once', () =>
	{
		const page = createPage();
		vm.runInContext(buildVsdxScript(), page.context);
		vm.runInContext(buildVsdxScript(), page.context);

		assert.equal(page.plugins.length, 1);
		page.plugins[0]({});
		assert.equal(typeof page.listeners['export-vsdx'], 'function');
	});

	test('keeps a VsdxExport already in the core bundle', () =>
	{
		function CoreVsdxExport() {};
		const page = createPage({ VsdxExport: CoreVsdxExport });
		vm.runInContext(buildVsdxScript(), page.context);

		assert.equal(page.context.VsdxExport, CoreVsdxExport);
	});

	test('vsdx is a valid CLI export format', () =>
	{
		assert.ok(validFormatRegExp.test('vsdx'));
	});
});
