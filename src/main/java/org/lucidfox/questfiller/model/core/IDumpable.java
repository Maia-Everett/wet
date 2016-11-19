package org.lucidfox.questfiller.model.core;

import java.lang.reflect.Method;

public interface IDumpable {
	default String dump() {
		final StringBuilder sb = new StringBuilder(getClass().getSimpleName());
		sb.append("\n");
		
		for (final Method m : getClass().getMethods()) {
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
