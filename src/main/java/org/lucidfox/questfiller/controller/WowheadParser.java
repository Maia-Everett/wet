package org.lucidfox.questfiller.controller;

import java.io.IOException;
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
		quest.setName(html.select("h1.heading-size-1").text());
		
		final Element stagesTable = html.select("table.iconlist").get(0);
		final String objectives = ((TextNode) stagesTable.previousSibling()).text().trim();
		quest.setObjectives(objectives);
		
		// Remove any subtables
		stagesTable.select("table.iconlist").remove();
		
		for (final Element stageLink : stagesTable.getElementsByTag("a")) {
			String stage = stageLink.text();
			
			// If there exists some text after the link (probably parenthesized text), add it
			final Node nextNode = stageLink.nextSibling();
			
			if (nextNode instanceof TextNode) {
				stage += ((TextNode) nextNode).text();
			}

			quest.getStages().add(stage);
		}
		
		// Description is messy
		final Elements headingsSize3 = html.select("h2.heading-size-3");
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
		
		final Element progressHeading = html.getElementById("lknlksndgg-progress");
		
		if (progressHeading != null) {
			quest.setProgress(textOf(progressHeading));
		}
		
		final Element completionHeading = html.getElementById("lknlksndgg-completion");
		
		if (completionHeading != null) {
			quest.setCompletion(textOf(completionHeading));
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
		final String url = "http://www.wowhead.com/quest=40645/to-the-dreamgrove";
		final Document doc = Jsoup.connect(url).get();
		System.out.println(new WowheadParser().parse(doc).dump());
	}
}
