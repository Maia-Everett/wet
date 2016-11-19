package org.lucidfox.questfiller.parser;

import static org.lucidfox.questfiller.parser.ParseUtils.getRegexGroup;

import java.util.Optional;
import java.util.stream.Stream;

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
	
	public static Optional<ParserType> detect(final Document html) {
		final String url = html.select("link[rel=canonical]").attr("href");
		// Get article type from canonical URL
		final String articleType = getRegexGroup(url, "/([a-z-]+)=[0-9]+/", 1).get();
		// Convert to enum constant name, e.g. quest -> QUEST, item-set -> ITEM_SET
		final String parserTypeName = articleType.replace('-', '_').toUpperCase();
		
		return Stream.of(values()).filter(parserType -> parserType.name().equals(parserTypeName)).findFirst();
	}
}
