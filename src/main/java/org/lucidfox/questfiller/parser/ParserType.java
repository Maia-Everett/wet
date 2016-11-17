package org.lucidfox.questfiller.parser;

import org.jsoup.nodes.Document;

public enum ParserType {
	QUEST("Quest", "q") {
		@Override
		public Object parse(final Document html, final ParserContext context) {
			return new QuestParser(context).parse(html);
		}
	};
	
	private final String name;
	private final String templateObjectPrefix;
	
	ParserType(final String name, final String templateObjectPrefix) {
		this.name = name;
		this.templateObjectPrefix = templateObjectPrefix;
	}
	
	public String getTemplateObjectPrefix() {
		return templateObjectPrefix;
	}
	
	@Override
	public String toString() {
		return name;
	}
	
	public abstract Object parse(Document html, ParserContext context);
}
