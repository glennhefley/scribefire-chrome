jQuery.fn.persist = function (property) {
	return this.each(function () {
		var url = document.location.href;
		var id = $(this).attr("id");
		
		var persistenceString = localStorage["persist"];

		var persistence = {};

		if (persistenceString) {
			try {
				persistence = JSON.parse(persistenceString);
			} catch (e) {
				persistence = {};
			}
		}
	
		if (!(id in persistence)) {
			persistence[id] = {};
		}
	
		persistence[id][property] = $(this).attr(property);
	
		localStorage["persist"] = JSON.stringify(persistence);
	});
};

jQuery(document).ready(function () {
	var url = document.location.href;
	
	var persistenceString = localStorage["persist"];
	
	var persistence = {};
	
	if (persistenceString) {
		try {
			persistence = JSON.parse(persistenceString);
		} catch (e) {
			persistence = {};
		}
	}
	
	for (var id in persistence) {
		for (var property in persistence[id]) {
			$("#" + id).attr(property, persistence[id][property]);
		}
	}
});