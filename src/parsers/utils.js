export default {
	getRegexGroup: function(str, regex, group) {
		let result = str.match(regex);

		if (result == null) {
			return null;
		}

		return result[group];
	}
};
