# Restored VSDX export

Upstream draw.io removed Visio (.vsdx) export from the open source build:

- `jgraph/drawio` deleted `mxVsdxCanvas2D.js` (29.2.9, Dec 2025) and
  `VsdxExport.js` (commit `2e967be4`, Jan 2026). The exporter now ships only
  in JGraph's internal build, and `EditorUi.vsdxExportEnabled()` returns true
  only for the Atlassian service, which hides File > Export as > VSDX.
- `jgraph/drawio-desktop` removed `--format vsdx` from the CLI (commit
  `e7b7b1b`, Mar 2025).

This folder has the last public versions of those files, from
`jgraph/drawio` (Apache License 2.0, Copyright (c) 2006-2026 JGraph Ltd):

| File | Source |
|------|--------|
| `mxVsdxCanvas2D.js` | `src/main/webapp/js/diagramly/vsdx/mxVsdxCanvas2D.js` at `f61234f5^` |
| `VsdxExport.js` | `src/main/webapp/js/diagramly/vsdx/VsdxExport.js` at `2e967be4^` |
| `desktop-vsdx.js` | New: enables the menu item and the CLI listener |

`VsdxExport.js` has one change: a current page only export passed `NaN` as
the page number for image relationships and counted every page.

`src/main/vsdx-export.js` injects these into each editor window when it
sends `app-load-finished`, so the `drawio` submodule stays untouched and can
be updated from upstream as usual. A core bundle that already defines
`VsdxExport` keeps its own.
