class ParserContext {
	constructor() {
		
	}
}

export default {
	create: function() {
		return Promise.resolve(new ParserContext());
	}
};
