package org.lucidfox.questfiller.controller;

import java.io.IOException;
import java.io.InputStreamReader;
import java.io.Reader;
import java.util.HashMap;
import java.util.Map;

import org.lucidfox.questfiller.model.Quest;

import com.samskivert.mustache.Mustache;
import com.samskivert.mustache.Template;

public final class ArticleFormatter {
	private final Template template;
	
	public ArticleFormatter() {
		try (final Reader reader = new InputStreamReader(getClass().getResourceAsStream("ArticleFormatter.mustache"))) {
			template = Mustache.compiler()
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
		return template.execute(context);
	}
}
