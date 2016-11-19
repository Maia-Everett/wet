package org.lucidfox.questfiller.parser;

import static org.lucidfox.questfiller.parser.ParseUtils.getRegexGroup;

import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.lucidfox.questfiller.model.Mission;

final class MissionParser implements IParser<Mission> {
	//private final ParserContext context;
	
	MissionParser(final ParserContext context) {
		//this.context = context; 
	}
	
	public Mission parse(final Document html) {
		final Mission mission = new Mission();
		
		final String url = html.select("link[rel=canonical]").attr("href");
		final String idStr = getRegexGroup(url, "/mission=([0-9]+)/", 1).get();
		mission.setId(Integer.parseInt(idStr));
		
		//final Element mainContainer = html.select("#main-contents div.text").first();
		final Element missionName = html.select("h1.heading-size-1").first();
		mission.setName(missionName.text());
		
		// Stub
		return mission;
	}
}
