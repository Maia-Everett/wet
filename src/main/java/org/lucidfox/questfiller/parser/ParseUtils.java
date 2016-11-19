package org.lucidfox.questfiller.parser;

import java.util.List;
import java.util.Optional;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;
import java.util.stream.Stream;

import org.jsoup.nodes.Element;
import org.jsoup.nodes.Node;
import org.jsoup.nodes.TextNode;
import org.jsoup.select.Elements;
import org.jsoup.select.NodeTraversor;
import org.jsoup.select.NodeVisitor;

final class ParseUtils {
	private ParseUtils() { }
	
	static List<String> unescapeInfoboxMarkup(final String infoboxMarkup) {
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
				.flatMap(line -> Stream.of(line.split(Pattern.quote("[br]"))))
				.map(line -> line.replaceAll("\\[(?:race|class)=([0-9]+)\\]", "$1")) // replace [race/class=X] with X
				.map(line -> line.replaceAll("\\[[^\\]]+\\]", ""))          // remove all square bracket tags
				.collect(Collectors.toList());
	}

	static Optional<String> getRegexGroup(final String str, final String regex, final int group) {
		final Matcher matcher = Pattern.compile(regex).matcher(str);
		
		if (!matcher.find()) {
			return Optional.empty();
		}
		
		return Optional.of(matcher.group(group));
	}
	
	static String textOf(final Element el) {
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
	
	
	static Optional<Element> getFirstWithOwnText(final Elements elementList, final String text) {
		return elementList.stream().filter(el -> el.ownText().equals(text)).findFirst();
	}
	
	static String collectTextUntilNextTag(final Element header, final String nextTagName) {
		final StringBuilder sb = new StringBuilder();
		
		for (Node node = header.nextSibling();
				!(node instanceof Element && ((Element) node).tagName().equals(nextTagName));
				node = node.nextSibling()) {
			if (node instanceof TextNode) {
				sb.append(((TextNode) node).text());
			} else if (node instanceof Element && ((Element) node).tagName().equals("br")) {
				sb.append("\n");
			}
		}
		
		return sb.toString();
	}
}
