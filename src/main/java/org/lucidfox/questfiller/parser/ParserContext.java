package org.lucidfox.questfiller.parser;

import static org.lucidfox.questfiller.parser.ParseUtils.getRegexGroup;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.Reader;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.Map;
import java.util.Properties;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

import javax.script.ScriptEngine;
import javax.script.ScriptEngineManager;
import javax.script.ScriptException;

import org.lucidfox.questfiller.model.Version;

public final class ParserContext {
	public static final String USER_AGENT = "QuestFiller/" + Version.getVersion();
	
	private final Map<Integer, String> questCategories = new HashMap<>();
	private final Map<Integer, String> missionThreats = new HashMap<>();
	private final Map<Integer, String> legionMissionThreats = new HashMap<>();
	
	public static ParserContext load() throws IOException {
		final String url = "http://wow.zamimg.com/js/enus.js";
		final HttpURLConnection conn = (HttpURLConnection) new URL(url).openConnection();
		conn.setRequestProperty("User-Agent", USER_AGENT);
		
		try (Reader reader = new InputStreamReader(conn.getInputStream(), StandardCharsets.UTF_8)) {
			return new ParserContext(reader);
		}
	}
	
	private ParserContext(final Reader localeJsReader) throws IOException {	
		// Obtain localization for quest categories
		final String fullScript = new BufferedReader(localeJsReader).lines().collect(Collectors.joining("\n"));
		final String questScript = getRegexGroup(fullScript, "var mn_quests[^;]+;", 0).get();
		final String missionMechanicsScript = "var mn_missionMechanics = " + getRegexGroup(fullScript,
				"missionMechanics:\\s*LANGfiMakeOptGroups\\((.+?),\\s*g_threat_categories_by_follower_type",
				1, Pattern.DOTALL).get();
		final String missionThreatsScript = "var mn_missionThreats = " + getRegexGroup(fullScript,
				"missionThreats:\\s*LANGfiMakeOptGroups\\((.+?),\\s*g_threat_categories_by_follower_type",
				1, Pattern.DOTALL).get();
		
		final ScriptEngine js = new ScriptEngineManager().getEngineByName("nashorn");
		
		try {
			// Eval the piece of JS that interests us, then convert the resulting data structure into our map
			js.eval(questScript);
			js.put("questCategories", questCategories);
			
			js.eval(missionMechanicsScript);
			js.eval(missionThreatsScript);
			js.put("missionThreats", missionThreats);
			
			try (Reader reader = new InputStreamReader(
					getClass().getResourceAsStream("LocaleCategories.js"), StandardCharsets.UTF_8)) {
				js.eval(reader);
			}
		} catch (final ScriptException e) {
			throw new RuntimeException(e);
		}
		
		try (Reader reader = new InputStreamReader(
				getClass().getResourceAsStream("LegionMissionThreats.properties"), StandardCharsets.UTF_8)) {
			final Properties p = new Properties();
			p.load(reader);
			
			for (final String id: p.stringPropertyNames()) {
				legionMissionThreats.put(Integer.parseInt(id), p.getProperty(id));
			}
		}
	}
	
	public String getQuestCategory(final int categoryId) {
		return questCategories.get(categoryId);
	}
	
	public String getMissionThreat(final int threatId) {
		return missionThreats.get(threatId);
	}
	
	public String getLegionMissionThreat(final int threatId) {
		return legionMissionThreats.get(threatId);
	}
}
