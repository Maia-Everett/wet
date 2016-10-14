package org.lucidfox.questfiller.controller;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;
import java.util.stream.Stream;

import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.jsoup.nodes.Node;
import org.jsoup.nodes.TextNode;
import org.jsoup.select.Elements;
import org.jsoup.select.NodeTraversor;
import org.jsoup.select.NodeVisitor;
import org.lucidfox.questfiller.model.Quest;

public final class WowheadParser {
	public Quest parse(final Document html) {
		final Quest quest = new Quest();
		
		final String url = html.select("link[rel=canonical]").attr("href");
		final String idStr = getRegexGroup("/quest=([0-9]+)/", url, 1);
		quest.setId(Integer.parseInt(idStr));
		
		final Element mainContainer = html.select("#main-contents div.text").first();
		final Element questName = html.select("h1.heading-size-1").first();
		quest.setName(questName.text());
		
		// Objectives section
		Node objectivesNode = questName.nextSibling();
		
		while (!(objectivesNode instanceof TextNode)) {
			objectivesNode = objectivesNode.nextSibling();
		}
		
		quest.setObjectives(((TextNode) objectivesNode).text());
		
		// Objective completion stages
		final Element stagesTable = mainContainer.select("table.iconlist").first();
		
		if (stagesTable != null) {
			// Remove any subtables
			stagesTable.select("table.iconlist").remove();
			
			for (final Element stageLink : stagesTable.getElementsByTag("a")) {
				// Find the innermost td element enclosing the a, and add its whole text
				Element parent = stageLink.parent();
				
				while (!parent.tagName().equals("td")) {
					parent = parent.parent();
				}
				
				quest.getStages().add(parent.text());
			}
		}
		
		// Description is messy
		final Elements headingsSize3 = mainContainer.select("h2.heading-size-3");
		final Element descriptionHeading = headingsSize3.stream()
				.filter(el -> el.text().equals("Description")).findFirst().get();
		
		final StringBuilder description = new StringBuilder();
		
		for (Node node = descriptionHeading.nextSibling();
				!(node instanceof Element && ((Element) node).tagName().equals("h2"));
				node = node.nextSibling()) {
			if (node instanceof TextNode) {
				description.append(((TextNode) node).text());
			} else if (node instanceof Element && ((Element) node).tagName().equals("br")) {
				description.append("\n");
			}
		}
		
		quest.setDescription(description.toString().trim());
		
		// Progress section
		final Element progressHeading = html.getElementById("lknlksndgg-progress");
		
		if (progressHeading != null) {
			quest.setProgress(textOf(progressHeading));
		}
		
		// Completion section
		final Element completionHeading = html.getElementById("lknlksndgg-completion");
		
		if (completionHeading != null) {
			quest.setCompletion(textOf(completionHeading));
		}
		
		// Money rewards
		final List<Element> allMoneyElements = new ArrayList<Element>();
		allMoneyElements.addAll(mainContainer.select("span.moneygold"));
		allMoneyElements.addAll(mainContainer.select("span.moneysilver"));
		allMoneyElements.addAll(mainContainer.select("span.moneycopper"));
		
		// Find the leftmost money element (so we parse only the first group - second group is max level rewards)
		if (!allMoneyElements.isEmpty()) {
			int money = 0;
			Element leftEl = null;
			
			for (final Element el: allMoneyElements) {
				if (leftEl == null || el.siblingIndex() < leftEl.siblingIndex()) {
					leftEl = el;
				}
			}
			
			// Parse all directly adjacent span nodes, possibly with whitespace in between
			for (Node node = leftEl;
					(node instanceof Element && ((Element) node).tagName().equals("span"))
						|| (node instanceof TextNode && ((TextNode) node).text().trim().isEmpty());
					node = node.nextSibling()) {
				if (!(node instanceof Element)) {
					continue;
				}
				
				final Element el = (Element) node;
				
				if (el.hasClass("moneygold")) {
					money += Integer.parseInt(el.ownText()) * 10000;
				} else if (el.hasClass("moneysilver")) {
					money += Integer.parseInt(el.ownText()) * 100;
				} else if (el.hasClass("moneycopper")) {
					money += Integer.parseInt(el.ownText());
				}
			}
			
			quest.setMoney(money);
		}
		
		// Non-money rewards
		final Elements icontabs = mainContainer.select("table.icontab.icontab-box");
		
		for (final Element icontab : icontabs) {
			final Node prevNode = icontab.previousSibling();
			final List<String> rewardList;
			
			if (icontab.id().equals("dynamic-rewards")) {
				rewardList = quest.getChoiceRewards();
			} else if (prevNode instanceof TextNode) {
				final String prevText = ((TextNode) prevNode).text();
				
				if (prevText.contains("You will receive:") || prevText.contains("You will also receive:")) {
					rewardList = quest.getNonChoiceRewards();
				} else if (prevText.contains("You will be able to choose one of these rewards:")) {
					rewardList = quest.getChoiceRewards();
				} else if (prevText.contains("You will learn:")) {
					rewardList = quest.getAbilityRewards();
				} else if (prevText.contains("The following spell will be cast on you:")) {
					rewardList = quest.getBuffRewards();
				} else {
					continue; // unknown icontab type
				}
			} else {
				continue; // unknown icontab type
			}
			
			// Parse the icontab
			for (final Element link : icontab.getElementsByTag("a")) {
				rewardList.add(link.ownText());
			}
		}
		
		// Gains section
		final Optional<Element> gains = headingsSize3.stream()
				.filter(el -> el.text().equals("Gains")).findFirst();
		
		if (gains.isPresent()) {
			Node gainsData = gains.get().nextSibling();
			
			while (!(gainsData instanceof Element && ((Element) gainsData).tagName().equals("ul"))) {
				gainsData = gainsData.nextSibling();
			}
			
			Elements divs = ((Element) gainsData).getElementsByTag("div");
			int firstReputationDiv;
			
			if (divs.first().ownText().contains("experience")) {
				firstReputationDiv = 1;
				final String xpValue = getRegexGroup("([0-9,]*) experience", divs.first().ownText(), 1);
				quest.setExperience(Integer.parseInt(xpValue.replace(",", "")));
			} else {
				firstReputationDiv = 0;
			}
			
			for (int i = firstReputationDiv; i < divs.size(); i++) {
				final Element div = divs.get(i);
				final String repValue = div.getElementsByTag("span").first().ownText();
				final String faction = div.getElementsByTag("a").first().ownText();
				
				quest.getReputationGains().put(faction, Integer.parseInt(repValue.replace(",", "")));
			}
		}
		
		// Infobox section
		final Optional<String> infoboxData = html.getElementsByTag("script")
				.stream()
				.map(Element::data)
				.filter(data -> data.contains("Markup.printHtml"))
				.findFirst();
		
		if (!infoboxData.isPresent()) {
			return quest;
		}
		
		final String infoboxMarkup = getRegexGroup("Markup\\.printHtml\\('([^']*)'", infoboxData.get(), 1);
		final List<String> infoboxLines = unescapeInfoboxMarkup(infoboxMarkup);
		infoboxLines.forEach(System.out::println);
		
		return quest;
	}
	
	private List<String> unescapeInfoboxMarkup(final String infoboxMarkup) {
		// Convert \xNN escape sequences to their corresponding characters
		final Matcher matcher = Pattern.compile("\\\\x([0-9A-Z]{2})").matcher(infoboxMarkup);
		final StringBuffer sb = new StringBuffer();
		
		while (matcher.find()) {
			final String hex = matcher.group(1);
			matcher.appendReplacement(sb, Character.toString((char) Integer.parseInt(hex, 16)));
		}
		
		matcher.appendTail(sb);
		
		// We'll get BBCode, convert it to a list of plain text lines
		return Stream.of(sb.toString().split(Pattern.quote("[/li][li]")))
				.map(line -> line.replaceAll("\\[class=([0-9]+)\\]", "$1")) // replace [class=X] with X
				.map(line -> line.replaceAll("\\[[^\\]]+\\]", ""))          // remove all square bracket tags
				.collect(Collectors.toList());
	}

	private String getRegexGroup(final String regex, final String str, final int group) {
		final Matcher matcher = Pattern.compile(regex).matcher(str);
		matcher.find();
		return matcher.group(group);
	}
	
	private String textOf(final Element el) {
		final StringBuilder accum = new StringBuilder();
		new NodeTraversor(new NodeVisitor() {
			public void head(final Node node, final int depth) {
				if (node instanceof TextNode) {
					TextNode textNode = (TextNode) node;
					accum.append(textNode.text());
				} else if (node instanceof Element) {
					Element element = (Element) node;
					if (element.tag().getName().equals("br")) {
						accum.append("\n");
					}
				}
			}

			public void tail(final Node node, final int depth) {
			}
		}).traverse(el);
		return accum.toString().trim();
	}
	
	public static void main(final String[] args) throws IOException {
		final String url = "http://www.wowhead.com/quest=25267/message-for-saurfang";
		final Document doc = Jsoup.connect(url).get();
		System.out.println(new WowheadParser().parse(doc).dump());
	}
}
