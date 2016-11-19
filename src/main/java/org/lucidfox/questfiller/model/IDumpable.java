package org.lucidfox.questfiller.model;

import java.lang.reflect.Method;

public interface IDumpable {
	default String dump() {
		final StringBuilder sb = new StringBuilder();
		
		for (final Method m : getClass().getDeclaredMethods()) {
			if ((m.getName().startsWith("get") || m.getName().startsWith("is"))
					&& m.getParameterCount() == 0 && !"getClass".equals(m.getName())) {
				sb.append(m.getName().replaceAll("^(get|is)", ""));
				sb.append(": ");
				
				try {
					sb.append(m.invoke(this));
				} catch (final ReflectiveOperationException e) {
					e.printStackTrace();
					sb.append("<error>");
				}
				
				sb.append("\n");
			}
		}
		
		return sb.toString();
	}
}
