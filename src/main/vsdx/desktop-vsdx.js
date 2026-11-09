/**
 * Turns VSDX export back on in the desktop app. Runs in the page after
 * VsdxExport.js and mxVsdxCanvas2D.js (see src/main/vsdx-export.js).
 */
(function()
{
	if (typeof EditorUi === 'undefined' || window.drawioDesktopVsdx)
	{
		return;
	}

	window.drawioDesktopVsdx = true;

	// Core only enables File > Export as > VSDX for the Atlassian build
	EditorUi.prototype.vsdxExportEnabled = function()
	{
		return typeof VsdxExport !== 'undefined';
	};

	// CLI export (--format vsdx): the main process sends the diagram to a
	// hidden editor window and waits for export-vsdx-finished
	if (window.Draw != null && typeof Draw.loadPlugin === 'function' &&
		window.electron != null)
	{
		Draw.loadPlugin(function(editorUi)
		{
			electron.registerMsgListener('export-vsdx', function(argsObj)
			{
				try
				{
					editorUi.fileLoaded(new LocalFile(editorUi, argsObj.xml, ''));

					editorUi.saveData = function(filename, format, data)
					{
						electron.sendMessage('export-vsdx-finished', data);
					};

					if (!new VsdxExport(editorUi).exportCurrentDiagrams())
					{
						electron.sendMessage('export-vsdx-finished', null);
					}
				}
				catch (e)
				{
					electron.sendMessage('export-vsdx-finished', null);
				}
			});
		});
	}
})();
