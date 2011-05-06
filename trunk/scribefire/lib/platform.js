if (typeof opera != "undefined") {
	var platform = "presto";
	var browser = "opera";
}
else if (typeof Components != 'undefined') {
	var platform = "gecko";
	var browser = 'firefox';
}
else {
	var platform = "webkit";

	if (typeof chrome != 'undefined') {
		var browser = 'chrome';
	}
	else {
		var browser = 'safari';
	}
}

var SCRIBEFIRE_STRINGS = {
	"strings" : {},

	get : function (key, substitutions) {
		if (key in this.strings) {
			var bundle = this.strings[key];

			var message = this.strings[key].message;

			if ("placeholders" in bundle) {
				for (var i in bundle.placeholders) {
					var regex = new RegExp("\\$" + i + "\\$", "g");
					message = message.replace(regex, bundle.placeholders[i].content);
				}
			}
			
			if (typeof substitutions != 'undefined') {
				if (typeof substitutions != 'object') {
					substitutions = [ substitutions ];
				}
			}
			
			if (substitutions) {
				for (var i = 0, _len = substitutions.length; i < _len; i++) {
					var regex = new RegExp("\\$" + (i+1), "g");
					message = message.replace(regex, substitutions[i]);
				}
			}

			return message;
		}

		return "";
	}
};

function scribefire_string(key, substitutions) {
	if (typeof substitutions != 'undefined') {
		if (typeof substitutions != 'object') {
			substitutions = [ substitutions ];
		}
	}
	
	if (browser == 'chrome') {
		return chrome.i18n.getMessage(key, substitutions);
	}
	else {
		return SCRIBEFIRE_STRINGS.get(key, substitutions);
	}
}

var bodies = document.getElementsByTagName("body");
var heads = document.getElementsByTagName("head");

if (bodies.length > 0 && heads.length > 0) {
	var body = bodies[0];
	var head = heads[0];
	var level = body.getAttribute("level") || "./";
	
	var style = document.createElement("link");
	style.setAttribute("rel", "stylesheet");
	style.setAttribute("type", "text/css");
	style.setAttribute("href", level + "skin/platform." + platform + ".css");
	head.appendChild(style);
}

if (platform == 'gecko') {
	if (typeof console == 'undefined') {
		var console = {
			log : function (msg) {
				var consoleService = Components.classes["@mozilla.org/consoleservice;1"].getService(Components.interfaces.nsIConsoleService);
				consoleService.logStringMessage(msg);
			}
		};
	}
	
	(function (extension_namespace, string_object) {
		var localeOrder = ["en-US"];

		// Get the user's Firefox locale.
		var chromeRegService = Components.classes["@mozilla.org/chrome/chrome-registry;1"].getService();
		var xulChromeReg = chromeRegService.QueryInterface(Components.interfaces.nsIXULChromeRegistry);
		// The "official" locale, especially on Linux.
		var browserLocale = xulChromeReg.getSelectedLocale("global");

		if (browserLocale != localeOrder[0]) {
			localeOrder.push(browserLocale);
		}

		// The user-specified locale from prefs.
		var userLocale = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService).getBranch("general.useragent.").getCharPref("locale");

		if (userLocale != localeOrder[localeOrder.length - 1]) {
			localeOrder.push(userLocale);
		}

		var finalLocaleOrder = [];

		// Convert the locale codes to Chrome style.
		for (var i = 0, _len = localeOrder.length; i < _len; i++) {
			var localeParts = localeOrder[i].split("-");
			localeParts[0] = localeParts[0].toLowerCase();

			if (localeParts.length > 1) {
				localeParts[1] = localeParts[1].toUpperCase();

				// e.g., If the locale code is pt_BR, use pt as a backup.
				if (finalLocaleOrder.length == 0 || finalLocaleOrder[finalLocaleOrder.length - 1] != localeParts[0]) {
					finalLocaleOrder.push(localeParts[0]);
				}
			}

			var locale = localeParts.join("_");

			if (finalLocaleOrder.length == 0 || finalLocaleOrder[finalLocaleOrder.length - 1] != locale) {
				finalLocaleOrder.push(locale);
			}
		}

		function readNextLocale() {
			if (finalLocaleOrder.length > 0) {
				var locale = finalLocaleOrder.shift();

				var req = new XMLHttpRequest();
				req.open("GET", "chrome://" + extension_namespace + "/content/_locales/" + locale + "/messages.json", true);
				req.overrideMimeType("text/plain;charset=UTF-8");

				req.onload = function () {
					var messagesText = req.responseText;

					try {
						var messages = JSON.parse(messagesText);
					} catch (e) {
						// Invalid JSON.
						var messages = {};
					}

					for (var i in messages) {
						string_object[i] = messages[i];
					}

					readNextLocale();
				};

				req.onerror = function () {
					readNextLocale();
				};

				try {
					req.send(null);
				} catch (e) {
					// Most likely the file doesn't exist.
					readNextLocale();
				}
			}
			else {
				// Because this process is asynchronous, you'll want to re-run
				// any localization scripts now that you run on document load, since the document may
				// have finished loading before this function ran, and if it did, all of your
				// locale strings would have been empty during the first call to your localizing
				// function.
				
				$(document).ready(function () { SCRIBEFIRE.localize(document); });
			}
		}

		readNextLocale();
	})("scribefire-next", SCRIBEFIRE_STRINGS.strings);
}
else {
	if (browser == 'safari' || browser == 'opera') {
		// SCRIBEFIRE_MESSAGES is generated by the Safari and Opera build scripts.
		SCRIBEFIRE_STRINGS.strings = SCRIBEFIRE_MESSAGES;
	}
	
	$(document).ready(function () { SCRIBEFIRE.localize(document); });
}