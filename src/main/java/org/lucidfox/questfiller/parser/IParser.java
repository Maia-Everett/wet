package org.lucidfox.questfiller.parser;

import org.jsoup.nodes.Document;
import org.lucidfox.questfiller.model.IDumpable;

interface IParser<T extends IDumpable> {
	T parse(Document html);
}
