package org.lucidfox.questfiller.controller;

import org.jsoup.nodes.Document;
import org.lucidfox.questfiller.model.Quest;

public final class WowheadParser {
	public Quest parse(final Document html) {
		final Quest quest = new Quest();
		quest.text = html.outerHtml();
		return quest;
	}
}
