package org.lucidfox.questfiller.model.core;

public final class ItemReward {
	private final String name;
	private final Integer quantity;
	private final int index;

	public ItemReward(final String name, final Integer quantity, final int index) {
		this.name = name;
		this.quantity = quantity;
		this.index = index;
	}

	public String getName() {
		return name;
	}

	public Integer getQuantity() {
		return quantity;
	}
	
	public int getIndex() {
		return index;
	}
	
	@Override
	public String toString() {
		if (quantity == null) {
			return name;
		}
		
		return String.format("%s (%s)", name, quantity);
	}
}
