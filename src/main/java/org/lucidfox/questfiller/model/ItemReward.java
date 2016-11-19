package org.lucidfox.questfiller.model;

public final class ItemReward {
	private final String name;
	private final Integer quantity;

	public ItemReward(final String name, final Integer quantity) {
		this.name = name;
		this.quantity = quantity;
	}

	public String getName() {
		return name;
	}

	public Integer getQuantity() {
		return quantity;
	}
	
	@Override
	public String toString() {
		if (quantity == null) {
			return name;
		}
		
		return String.format("%s (%s)", name, quantity);
	}
}
