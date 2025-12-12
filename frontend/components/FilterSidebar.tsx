import FilterDropdown from "./FilterDropdown";
import ToggleOption from "./ToggleOption";

export default function FilterSidebar() {
  return (
    <aside className="filter-sidebar">

      {/* Voucher Type */}
      <FilterDropdown
        label="Voucher Type"
        options={[
          "Gift Card",
          "Discount Coupon",
          "Store Credit",
          "Travel Voucher",
          "Food & Dining",
          "Fashion & Apparel",
        ]}
      />

      {/* Discount */}
      <FilterDropdown
        label="Discount"
        options={[
          "10% OFF",
          "20% OFF",
          "30% OFF",
          "40% OFF",
          "50%+ OFF",
        ]}
      />

      {/* Price Range */}
      <FilterDropdown
        label="Price Range"
        options={[
          "0.001 - 0.01 ETH",
          "0.01 - 0.05 ETH",
          "0.05 - 0.1 ETH",
          "0.1 ETH+",
        ]}
      />

      {/* Verified Only */}
      <FilterDropdown
        label="Verified Only"
        options={[
          "Show Only Verified",
          "Show All Listings"
        ]}
      />

      {/* Sort Options */}
      <FilterDropdown
        label="Sort Options"
        options={[
          "Price: Low → High",
          "Price: High → Low",
          "Discount: High → Low",
          "Newest Listings",
          "Oldest Listings",
          "Verified First"
        ]}
      />

      {/* Toggle Options */}
      <div className="toggle-options">
        <ToggleOption label="Toggle 1" />
        <ToggleOption label="Toggle 2" />
        <ToggleOption label="Toggle 3" />
      </div>

    </aside>
  );
}
