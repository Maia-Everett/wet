package org.lucidfox.questfiller.controller;

import java.io.IOException;
import java.io.InputStreamReader;
import java.io.Reader;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

import org.jsoup.nodes.Document;
import org.lucidfox.questfiller.QuestFillerApp;
import org.lucidfox.questfiller.parser.ParserContext;
import org.lucidfox.questfiller.parser.ParserType;

import com.samskivert.mustache.Mustache;
import com.samskivert.mustache.Template;

public final class ArticleFormatter {
	private static final Map<ParserType, Template> TEMPLATES = new ConcurrentHashMap<>();
	private static final String TEMPLATE_PACKAGE = "/" + QuestFillerApp.class.getPackage().getName().replace('.', '/')
			+ "/template";
	private static final Mustache.Compiler TEMPLATE_COMPILER = Mustache.compiler().escapeHTML(false).nullValue("");
	
	public String format(final Document html, final ParserContext parserContext) {
		final ParserType parserType = ParserType.detect(html).orElseThrow(
				() -> new RuntimeException("Unsupported Wowhead article type"));
		final Object data = parserType.parse(html, parserContext);
		final Map<String, Object> context = new HashMap<>();
		
		context.put(parserType.getTemplateObjectPrefix(), data);
		
		Template template = TEMPLATES.computeIfAbsent(parserType, this::createTemplate);
		return template.execute(context);
	}

	private Template createTemplate(final ParserType parserType) {
		final String templateFile = String.format("%s/%s.mustache", TEMPLATE_PACKAGE, parserType.name().toLowerCase());
		
		try (Reader reader = new InputStreamReader(
				ArticleFormatter.class.getResourceAsStream(templateFile), StandardCharsets.UTF_8)) {
			return TEMPLATE_COMPILER.compile(reader);
		} catch (final IOException e) {
			throw new AssertionError(e);
		}
	}
}
