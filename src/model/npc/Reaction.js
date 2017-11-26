let Reaction = {
	HOSTILE: -1,
	NEUTRAL: 0,
	FRIENDLY: 1,

	/**
	 * 
	 * @param {string} colorId 
	 */
	getByColor: function(colorId) {
		switch (colorId) {
			case "":
				return Reaction.NEUTRAL;
			case "2":
				return Reaction.FRIENDLY;
			case "10":
				return Reaction.HOSTILE;
			default:
				throw new Error();
			}
	}
};

export default Reaction;