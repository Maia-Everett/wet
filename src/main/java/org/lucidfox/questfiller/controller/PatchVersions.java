package org.lucidfox.questfiller.controller;

import java.io.IOException;
import java.io.InputStreamReader;
import java.io.Reader;
import java.nio.charset.StandardCharsets;
import java.util.Properties;

final class PatchVersions {
	private PatchVersions() { }
	
	private static final Properties SUBSTITUTIONS = new Properties();
	
	static {
		try (final Reader reader = new InputStreamReader(
				PatchVersions.class.getResourceAsStream("PatchSubstitutions.properties"), StandardCharsets.UTF_8)) {
			SUBSTITUTIONS.load(reader);
		} catch (final IOException e) {
			throw new AssertionError(e);
		}
	}
	
	public static String getCanonicalVersion(final String patchVersion) {
		return SUBSTITUTIONS.getProperty(patchVersion, patchVersion);
	}
}
