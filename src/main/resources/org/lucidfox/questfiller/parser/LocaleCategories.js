// Assemble quest category IDs into map
mn_quests.forEach(function(element) {
	var sublist = element[3];
	
	if (Array.isArray(sublist)) {
		sublist.forEach(function(subelement) {
			// category ID and name
			questCategories.put(subelement[0], subelement[1]);
		});
	}
});

// Assemble mission threat IDs into map
mn_missionMechanics.forEach(function(element) {
	missionThreats.put(element[0], element[1][0]);
});
mn_missionThreats.forEach(function(element) {
	missionThreats.put(element[0], element[1][0]);
});
