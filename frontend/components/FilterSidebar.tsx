"use client";

import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import FilterDropdown from "./FilterDropdown";
import ToggleOption from "./ToggleOption";

function FilterSidebarContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Get current filter values from URL
  const currentType = searchParams.get('type') || '';
  const currentDiscount = searchParams.get('discount') || '';
  const currentPrice = searchParams.get('price') || '';
  const currentSort = searchParams.get('sort') || '';
  const verifiedOnly = searchParams.get('verified') === 'true';
  const hasDiscount = searchParams.get('hasDiscount') === 'true';
  const expiringSoon = searchParams.get('expiringSoon') === 'true';

  // Update URL with filter
  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    const queryString = params.toString();
    router.push(queryString ? `/marketplace?${queryString}` : '/marketplace');
  };

  // Toggle filter
  const toggleFilter = (key: string, currentValue: boolean) => {
    const params = new URLSearchParams(searchParams.toString());
    if (!currentValue) {
      params.set(key, 'true');
    } else {
      params.delete(key);
    }
    const queryString = params.toString();
    router.push(queryString ? `/marketplace?${queryString}` : '/marketplace');
  };

  // Clear all filters
  const clearAllFilters = () => {
    const params = new URLSearchParams();
    // Keep search if present
    const search = searchParams.get('search');
    if (search) {
      params.set('search', search);
    }
    const queryString = params.toString();
    router.push(queryString ? `/marketplace?${queryString}` : '/marketplace');
  };

  // Check if any filters are active
  const hasActiveFilters = currentType || currentDiscount || currentPrice || currentSort || verifiedOnly || hasDiscount || expiringSoon;

  return (
    <aside className="filter-sidebar">

      {/* Clear Filters Button */}
      {hasActiveFilters && (
        <button className="clear-filters-btn" onClick={clearAllFilters}>
          <span className="material-icons">clear_all</span>
          Clear All Filters
        </button>
      )}

      {/* Voucher Type - matches sell page options */}
      <FilterDropdown
        label="Voucher Type"
        options={[
          "All Types",
          "Gift Card",
          "Discount Coupon",
          "Store Credit",
          "Cashback Voucher",
          "Subscription",
          "Other"
        ]}
        selected={currentType}
        onSelect={(option) => updateFilter('type', option === "All Types" ? '' : option)}
      />

      {/* Discount Range */}
      <FilterDropdown
        label="Discount"
        options={[
          "Any Discount",
          "10%+ OFF",
          "20%+ OFF",
          "30%+ OFF",
          "40%+ OFF",
          "50%+ OFF",
        ]}
        selected={currentDiscount}
        onSelect={(option) => updateFilter('discount', option === "Any Discount" ? '' : option)}
      />

      {/* Price Range - in MNEE tokens */}
      <FilterDropdown
        label="Price Range"
        options={[
          "Any Price",
          "Under 100 MNEE",
          "100 - 500 MNEE",
          "500 - 1000 MNEE",
          "1000+ MNEE",
        ]}
        selected={currentPrice}
        onSelect={(option) => updateFilter('price', option === "Any Price" ? '' : option)}
      />

      {/* Sort Options */}
      <FilterDropdown
        label="Sort By"
        options={[
          "Default",
          "Price: Low → High",
          "Price: High → Low",
          "Discount: High → Low",
          "Newest First",
          "Expiring Soon",
        ]}
        selected={currentSort}
        onSelect={(option) => updateFilter('sort', option === "Default" ? '' : option)}
      />

      {/* Quick Filters */}
      <div className="quick-filters">
        <h4>Quick Filters</h4>
        <ToggleOption
          label="Verified Only"
          defaultActive={verifiedOnly}
          onToggle={() => toggleFilter('verified', verifiedOnly)}
        />
        <ToggleOption
          label="Has Discount"
          defaultActive={hasDiscount}
          onToggle={() => toggleFilter('hasDiscount', hasDiscount)}
        />
        <ToggleOption
          label="Expiring Soon"
          defaultActive={expiringSoon}
          onToggle={() => toggleFilter('expiringSoon', expiringSoon)}
        />
      </div>

    </aside>
  );
}

function FilterSidebarFallback() {
  return (
    <aside className="filter-sidebar">
      <div className="loading-filters">Loading filters...</div>
    </aside>
  );
}

export default function FilterSidebar() {
  return (
    <Suspense fallback={<FilterSidebarFallback />}>
      <FilterSidebarContent />
    </Suspense>
  );
}
