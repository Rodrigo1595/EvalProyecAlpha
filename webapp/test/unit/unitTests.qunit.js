/* global QUnit */
QUnit.config.autostart = false;

sap.ui.getCore().attachInit(function () {
	"use strict";

	sap.ui.require([
		"raccoon/devs/evalproyectos/test/unit/AllTests"
	], function () {
		QUnit.start();
	});
});
