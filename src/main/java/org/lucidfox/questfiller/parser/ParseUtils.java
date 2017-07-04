package org.lucidfox.questfiller.parser;

import java.util.ArrayList;
import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.function.BiConsumer;
import java.util.function.Predicate;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;
import java.util.stream.Stream;

import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.jsoup.nodes.Node;
import org.jsoup.nodes.TextNode;
import org.jsoup.select.Elements;
import org.jsoup.select.NodeTraversor;
import org.jsoup.select.NodeVisitor;

final class ParseUtils {
	private ParseUtils() { }
	
	static int[] getCategoryIds(final Document html) {
		// Category taken from breadcrumb, which Wowhead draws with JS :(
		final String breadcrumbData = html.getElementsByTag("script")
				.stream()
				.map(Element::data)
				.filter(data -> data.contains("PageTemplate.set({breadcrumb:"))
				.findFirst().get();
		
		// ugh, parsing JS with regexes
		final String regex = Pattern.quote("PageTemplate.set({breadcrumb: [") + "([0-9,-]+)" + Pattern.quote("]});");
		final String[] categoryIds = getRegexGroup(breadcrumbData, regex, 1).get().split(",");
		return Stream.of(categoryIds).mapToInt(Integer::parseInt).toArray();
	}
	
	static List<String> getInfoboxLines(final Document html, final boolean stripColor) {
		final Optional<String> infoboxData = html.getElementsByTag("script")
				.stream()
				.map(Element::data)
				.filter(data -> data.contains("Markup.printHtml"))
				.findFirst();
		
		if (!infoboxData.isPresent()) {
			return Collections.emptyList();
		}
		
		final String infoboxMarkup = getRegexGroup(infoboxData.get(), "Markup\\.printHtml\\('([^']*)'", 1).get();
		return unescapeInfoboxMarkup(infoboxMarkup, stripColor);
	}
	
	private static List<String> unescapeInfoboxMarkup(final String infoboxMarkup, final boolean stripColor) {
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
				.flatMap((String line) -> Stream.of(line.split(Pattern.quote("[br]"))))
				.map(line -> line.replaceAll("\\[(?:race|class)=([0-9]+)\\]", "$1")) // replace [race/class=X] with X
				.map(stripColor ? line -> line
						: line -> line.replaceAll("\\[color=([^\\]]+)\\]", "<$1>"))
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
	
	static void collectItemRewards(final Element icontab, final BiConsumer<String, Integer> collector) {
		Objects.requireNonNull(icontab);
		
		final Map<String, String> itemNamesByIconId = new LinkedHashMap<>();
		final Map<String, Integer> itemQuantitiesByIconId = new LinkedHashMap<>();
		
		// Item names are contained in the actual icontab, as are placeholders for the icon and quantity
		for (final Element iconPlaceholder : icontab.select("th[id]")) {
			final String iconId = iconPlaceholder.id();
			// the next element is a td with the link to the actual item
			final String itemName = iconPlaceholder.nextElementSibling().getElementsByTag("a").first().ownText();
			itemNamesByIconId.put(iconId, itemName);
		}
		
		// Item quantities are filled through JavaScript.
		// Find all script elements in the document containing icontab initialization code
		final List<Element> itemScripts = icontab.ownerDocument().select("script:containsData(icontab)");
		
		for (final Element script : itemScripts) {
			// Parse JavaScript lines like
			// $WH.ge('icontab-icon1').appendChild(g_items.createIcon(115793, 1, "3"));
			// We're interested in what's inside ge() - the icon box ID -
			// and the contents of the last quotes (item quantity)
			final Pattern iconInitRegex = Pattern.compile(
					Pattern.quote("$WH.ge('")
					+ "([^']+)"
					+ Pattern.quote("').appendChild(") + "[A-Za-z0-9_]+" + Pattern.quote(".createIcon(")
					+ "[^\"]+\"([^\"]+)\""
					+ Pattern.quote("));"));
			final Matcher matcher = iconInitRegex.matcher(script.data());
			
			while (matcher.find()) {
				// group 1 is icon box element ID, group 2 is item quantity (or 0 if no quantity should be displayed)
				itemQuantitiesByIconId.put(matcher.group(1), Integer.parseInt(matcher.group(2)));
			}
		}
		
		itemNamesByIconId.forEach((iconId, itemName) -> {
			Integer itemQuantity = itemQuantitiesByIconId.get(iconId);
			
			// "0" means draw no quantity on the icon
			if (itemQuantity != null && (itemQuantity == 0 || itemQuantity == 1)) {
				itemQuantity = null;
			}
			
			collector.accept(itemName, itemQuantity);
		});
	}
	
	static int getMoney(final Element container) {
		// Money rewards
		final List<Element> allMoneyElements = new ArrayList<Element>();
		allMoneyElements.addAll(container.select("span.moneygold"));
		allMoneyElements.addAll(container.select("span.moneysilver"));
		allMoneyElements.addAll(container.select("span.moneycopper"));
		
		if (allMoneyElements.isEmpty()) {
			return 0;
		}
		
		// Find the leftmost money element (so we parse only the first group - second group is max level rewards)
		int money = 0;
		Element leftEl = null;
		
		for (final Element el: allMoneyElements) {
			if (leftEl == null || el.siblingIndex() < leftEl.siblingIndex()) {
				leftEl = el;
			}
		}
		
		Node node;
		
		// Parse all directly adjacent span nodes, possibly with whitespace in between
		for (node = leftEl;
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
		
		// If the money group we just parsed is followed immediately by max level text, then it means that the only
		// money group is the max-level money group, so we should skip it.
		if (node instanceof TextNode && ((TextNode) node).text().trim().startsWith("if completed at level")) {
			return 0;
		}
		
		return money;
	}
	
	static Optional<Element> findNextElementSibling(final Element startElement, final Predicate<Element> condition) {
		for (Element el = startElement.nextElementSibling(); el != null; el = el.nextElementSibling()) {
			if (condition.test(el)) {
				return Optional.of(el);
			}
		}
		
		return Optional.empty();
	}
}
