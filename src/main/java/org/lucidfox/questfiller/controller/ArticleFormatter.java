package org.lucidfox.questfiller.controller;

import org.lucidfox.questfiller.model.Quest;

public final class ArticleFormatter {
	public String format(final Quest quest) {
		return quest.dump();
	}
}
