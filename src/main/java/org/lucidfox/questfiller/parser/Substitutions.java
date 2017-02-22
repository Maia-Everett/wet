package org.lucidfox.questfiller.parser;

import java.io.IOException;
import java.io.InputStreamReader;
import java.io.Reader;
import java.nio.charset.StandardCharsets;
import java.util.Properties;

final class Substitutions {
	private Substitutions() { }
	
	private static final Properties PATCH_SUBSTITUTIONS = readResource("PatchSubstitutions.properties");
	private static final Properties REPUTATION_SUBSTITUTIONS = readResource("ReputationSubstitutions.properties");
	
	private static Properties readResource(final String resourceName) {
		try (Reader reader = new InputStreamReader(Substitutions.class.getResourceAsStream(resourceName),
				StandardCharsets.UTF_8)) {
			final Properties props = new Properties();
			props.load(reader);
			return props;
		} catch (final IOException e) {
			throw new AssertionError(e);
		}
	}
	
	public static String getCanonicalPatchVersion(final String patchVersion) {
		return PATCH_SUBSTITUTIONS.getProperty(patchVersion, patchVersion);
	}
	
	public static String getCanonicalReputationFaction(final String repFaction) {
		return REPUTATION_SUBSTITUTIONS.getProperty(repFaction, repFaction);
	}
}
