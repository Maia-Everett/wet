package org.lucidfox.questfiller.parser;

import static org.lucidfox.questfiller.parser.ParseUtils.getRegexGroup;

import java.util.List;
import java.util.Optional;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.jsoup.select.Elements;
import org.lucidfox.questfiller.model.npc.CreatureType;
import org.lucidfox.questfiller.model.npc.NPC;
import org.lucidfox.questfiller.model.npc.Reaction;

final class NPCParser implements IParser<NPC> {
	// private final ParserContext context;
	
	NPCParser(final ParserContext context) {
		// this.context = context;
	}
	
	public NPC parse(final Document html) {
		final NPC npc = new NPC();
		
		final String url = html.select("link[rel=canonical]").attr("href");
		final String idStr = getRegexGroup(url, "/npc=([0-9]+)/", 1).get();
		npc.setId(Integer.parseInt(idStr));
		
		final Element mainContainer = html.select("#main-contents div.text").first();
		final String npcName = mainContainer.select("h1.heading-size-1").first().text();
		
		npc.setName(npcName.replaceAll("<.*>", "").trim());
		
		// If we have a title
		getRegexGroup(npcName, "<(.*)>", 1).ifPresent(title -> {
			npc.setTitle(title);
		});
		
		parseCreatureType(npc, html);
		parseLocation(npc, mainContainer);
		parseQuotes(npc, mainContainer);
		parseHealth(npc, html);
		parseInfobox(npc, html);
		return npc;
	}
	
	private void parseCreatureType(final NPC npc, final Document html) {
		final int[] categoryIds = ParseUtils.getCategoryIds(html);
		// third number in list is the creature type id
		final int creatureTypeId = categoryIds[2];
		npc.setCreatureType(CreatureType.getById(creatureTypeId));
	}
	
	private void parseLocation(final NPC npc, final Element mainContainer) {
		final Elements locationLinks = mainContainer.select("#locations a");
		
		if (!locationLinks.isEmpty()) {
			npc.setLocation(locationLinks.first().text());
		}
	}
	
	private void parseQuotes(final NPC npc, final Element mainContainer) {
		final Optional<Element> quotesDiv = mainContainer.select("a.disclosure-off")
				.stream()
				.filter(link -> link.text().contains("Quotes"))
				.findFirst()
				.map(Element::parent) // step from a to its parent h2
				.flatMap(quotesEl -> ParseUtils.findNextElementSibling(quotesEl, el -> "div".equals(el.tagName())));
		
		quotesDiv.ifPresent(div -> {
			npc.setQuotes(div.select("span.s2")
					.stream()
					.map(Element::text)
					.map(quote -> quote.replaceAll("^.+ says: ", ""))
					.collect(Collectors.toList()));
		});
	}
	
	private void parseHealth(final NPC npc, final Document html) {
		html.getElementsByTag("script")
				.stream()
				.map(Element::data)
				.filter(data -> data.contains("Health: "))
				.findFirst()
				.flatMap(data -> getRegexGroup(data, "Health: ([0-9,]+)", 1))
				.ifPresent(health -> {
					npc.setHealth(Long.parseLong(health.replace(",", "")));
				});
	}

	private void parseInfobox(final NPC npc, final Document html) {
		// Infobox section
		final List<String> infoboxLines = ParseUtils.getInfoboxLines(html, false);
		
		// Pattern-match each infobox line
		for (final String infoboxLine : infoboxLines) {
			getRegexGroup(infoboxLine, "Level: (.+)", 1).ifPresent(levelStr -> {
				final Pattern levelRegex = Pattern.compile("([^ ]+)(?: - ([0-9]+))?");
				final Matcher matcher = levelRegex.matcher(levelStr);
				
				if (matcher.find()) {
					npc.setLevelLow(matcher.group(1));
					npc.setLevelHigh(matcher.group(2));
				}
			});
			
			getRegexGroup(infoboxLine, "Classification: (.+)", 1).ifPresent(levelClassification -> {
				npc.setLevelClassification(levelClassification);
			});

			getRegexGroup(infoboxLine, "React: (.+)", 1).ifPresent(reaction -> {
				getRegexGroup(reaction, "<q([^>]*)>A", 1).ifPresent(colorId -> {
					npc.setAllianceReaction(Reaction.getByColor(colorId));
				});

				getRegexGroup(reaction, "<q([^>]*)>H", 1).ifPresent(colorId -> {
					npc.setHordeReaction(Reaction.getByColor(colorId));
				});
			});
			
			getRegexGroup(infoboxLine, "Faction: (.+)", 1).ifPresent(repFaction -> {
				npc.setRepFaction(repFaction);
			});
			
			getRegexGroup(infoboxLine, "Tameable \\((.+)\\)", 1).ifPresent(petFamily -> {
				npc.setPetFamily(petFamily);
			});

			getRegexGroup(infoboxLine, "Added in patch ([0-9]+.[0-9]+.[0-9]+)", 1).ifPresent(patch -> {
				npc.setPatchAdded(Substitutions.getCanonicalPatchVersion(patch));
			});
		}
	}
}
