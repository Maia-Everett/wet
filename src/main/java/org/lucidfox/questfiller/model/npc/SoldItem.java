package org.lucidfox.questfiller.model.npc;

public final class SoldItem {
	private final String name;
	private final int price;

	public SoldItem(String name, int price) {
		this.name = name;
		this.price = price;
	}

	public String getName() {
		return name;
	}

	public int getPrice() {
		return price;
	}
	
	private static Integer getNonzeroOrNull(final int quantity) {
		return quantity == 0 ? null : quantity;
	}
	
	public Integer getGold() {
		return getNonzeroOrNull(price / 10000); 
	}
	
	public Integer getSilver() {
		return getNonzeroOrNull((price % 10000) / 100); 
	}
	
	public Integer getCopper() {
		return getNonzeroOrNull(price % 100); 
	}
}
