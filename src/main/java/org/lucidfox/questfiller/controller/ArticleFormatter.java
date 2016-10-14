package org.lucidfox.questfiller.controller;

import java.io.IOException;
import java.io.InputStreamReader;
import java.io.Reader;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.Map;

import org.lucidfox.questfiller.model.Quest;

import com.samskivert.mustache.Mustache;
import com.samskivert.mustache.Template;

public final class ArticleFormatter {
	private static final Template TEMPLATE;
	
	static {
		try (final Reader reader = new InputStreamReader(
				ArticleFormatter.class.getResourceAsStream("ArticleFormatter.mustache"), StandardCharsets.UTF_8)) {
			TEMPLATE = Mustache.compiler()
					.escapeHTML(false)
					.nullValue("")
					.compile(reader);
		} catch (final IOException e) {
			throw new AssertionError(e);
		}
	}
	
	public String format(final Quest quest) {
		final Map<String, Object> context = new HashMap<>();
		context.put("q", quest);
		return TEMPLATE.execute(context);
	}
}
