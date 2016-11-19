package org.lucidfox.questfiller.parser;

import static org.lucidfox.questfiller.parser.ParseUtils.getRegexGroup;

import java.io.IOException;
import java.util.Optional;
import java.util.function.Function;
import java.util.stream.Stream;

import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.lucidfox.questfiller.controller.ArticleFormatter;
import org.lucidfox.questfiller.model.IDumpable;

public enum ParserType {
	QUEST("Quest", "q", QuestParser::new),
	MISSION("Mission", "m", MissionParser::new);
	
	private final String name;
	private final String templateObjectPrefix;
	private final Function<ParserContext, IParser<?>> parserFactory;
	
	ParserType(final String name, final String templateObjectPrefix,
			final Function<ParserContext, IParser<?>> parserFactory) {
		this.name = name;
		this.templateObjectPrefix = templateObjectPrefix;
		this.parserFactory = parserFactory;
	}
	
	public String getTemplateObjectPrefix() {
		return templateObjectPrefix;
	}
	
	@Override
	public String toString() {
		return name;
	}
	
	public IDumpable parse(final Document html, final ParserContext context) {
		return parserFactory.apply(context).parse(html);
	}
	
	public static Optional<ParserType> detect(final Document html) {
		final String url = html.select("link[rel=canonical]").attr("href");
		// Get article type from canonical URL
		final String articleType = getRegexGroup(url, "/([a-z-]+)=[0-9]+/", 1).get();
		// Convert to enum constant name, e.g. quest -> QUEST, item-set -> ITEM_SET
		final String parserTypeName = articleType.replace('-', '_').toUpperCase();
		
		return Stream.of(values()).filter(parserType -> parserType.name().equals(parserTypeName)).findFirst();
	}

	// For debug purposes only
	public static void main(final String[] args) throws IOException {
		final ParserContext context = ParserContext.load();
		final String url = args[0];
		final Document doc = Jsoup.connect(url).get();
		final IDumpable obj = detect(doc).get().parse(doc, context);
		System.out.println(obj.dump());
		System.out.println();
		System.out.println(" ----------------------------------- ");
		System.out.println();
		System.out.println(new ArticleFormatter().format(doc, context));
	}
}
