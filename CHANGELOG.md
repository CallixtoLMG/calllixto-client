# Changelog

This project adheres to [Keep a Changelog](https://keepachangelog.com/en/1.0.0/)
and follows [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## 2025-11-11

### Added

- Created SearchControlled component with full integration to react-hook-form using Controller, enabling declarative field rules and error display.

- Implemented SearchField component with debounced search, multi-field matching, and customizable result rendering.

- Introduced persistSelection flag to optionally retain the selected item’s display value in the input after selection.

- Added clearable support to allow manual deselection of the selected value, with appropriate onSelect(null) callback.

- Implemented support for onAfterChange callback to execute logic after selecting an item (e.g., update dependent fields).

- Integrated getDisplayValue prop to customize how the selected value is shown in the input field.

- Added OverflowWrapper utility component to handle truncated titles in search results, showing full content via Popup.

### Changed

- Replaced DropdownControlled components with SearchControlled in BudgetForm and ProductForm.

### Removed

- ProductSearch component.

## 2025-10-30

### Added

- Implemented full CRUD functionality for the CashBalances entity.

- Created ModalOpenTill modal component for adding new cash balances, with support for dynamic bill entry.

### Changed

- Introduced an activeIndex parameter for the Expenses and Budgets views to prioritize the Payments tab when redirected from the CashBalances entity.

- Added a skipStorageUpdate flag to the database utility layer to prevent saving specific entities (e.g., Payments) when needed.

- Replaced usage of the seller property with createdBy across the entire project for consistency and clarity.

- Refactored the Payments module to treat it as a standalone entity, ensuring proper modular behavior and integration with other entities.

## 2025-10-03

### Added

- Added the cashBalance entity with full integration: includes a dedicated modal (ModalOpenTill) and dynamic entry popup (AddBillPopup).

- Introduced SIZES constant in common/constants to avoid hardcoded Semantic UI size strings across components.

- Created utility function datePickerNow to get the current date for use in date pickers (returns raw Date object without formatting).

- Created or updated mapToDropdownOptions utility function to dynamically adapt constant arrays for use in dropdowns (returns { key, text, value }[] format).

### Changed

- Modified code field in Products to now use id instead, ensuring consistency with other entities like Budgets, Expenses, and CashBalances.

- Updated Table component to accept two parameters in the actions prop function when necessary, increasing flexibility in table row customization.

## 2025-08-25

### Added

- Added a new "General" tab to the Settings section for configuring global parameters.

- Added support for custom payment method management for clients, including the ability to add personalized payment methods through the UI.

- Created a reusable utility function `mapToDropdownOptions` to map arrays of strings into dropdown-compatible objects ({ key, text, value }).

## 2025-07-08

### Added

- Introduced the Expenses entity with full CRUD support, mirroring the structure and behavior of existing entities.

- Added expenses configuration in Settings to manage categories and tags.

### Changed

- Refactored createFilter to support filtering within nested structures (e.g., searching by category names in tables).

- Replaced useArrayTags with more generic and reusable useSettingArrayField hook, to handle both tags and categories which share the same data structure.

- Minor CSS update on Dropdown component to prevent visual clipping of descenders (e.g., characters like j, g, y, q).

## 2025-07-02

### Added

- Added ability to sort tables in both ascending and descending order.

## 2025-06-26

### Changed

- Added display of the inactivation reason (inactiveReason) when the product status changes to Inactive.

### Fixed

- Fixxed version history logs, now displaying the user (updatedBy) who made each product update, enhancing traceability in the product change timeline.

## 2025-06-19

### Changed

- Improved product search logic in ProductSearch component:
- Prioritizes exact matches on product name or id before falling back to word-by-word partial matches.
- Updated getNumberFormated function for consistent price formatting: ensures correct display of thousand separators.
- Utilizes toLocaleString("es-AR") for consistent regional formatting.

## 2025-06-03

### Added

- Implemented product change history component (`ProductChanges`).
- Added `FIELD_LABELS`, `getLabel`, `PRODUCT_LABELS` to `products.constants`.
- Added const `LABELS` to `common/constants`.
- Stored filters applied on main tables.

### Changed

- Updated product detail view layout: now displayed in tab format with separate tabs for "Producto" and "Historial de cambios" (`ProductChanges`).

## 2025-05-28

### Added

- Global keyboard shortcuts in BudgetPayments:
  * Enter: Submits the form if conditions are met.
  * Delete: Resets the form to original values.
- Support for onKeyDown event in PriceField to allow handling keyboard actions.
- Created `getSortedPaymentsByDate` utility function to sort payments chronologically using dayjs.

### Changed

- Updated entity fetch logic: individual entity requests now bypass IndexedDB and are always retrieved directly from the backend.
- Externalized BudgetPayments module from BudgetView to improve modularity and reuse.
- Refactored BudgetView to delegate payments logic to the new BudgetPayments component.
- Payment records in the Payments table are now sorted chronologically by date using `getSortedPaymentsByDate`.

### Fixed

- Payment amount field (`PriceField`) now correctly resets after adding a new payment without relying on `useEffect`.
- Resolved an issue where the amount input field (PriceField) did not reset when adding a payment via Enter key. This was fixed by dynamically updating the component’s key prop to force re-mount and clear its internal state.


## 2025-05-21

### Added

- Display of payment dates, sorted in ascending order (oldest first) in PDFfile.

### Changed

- Alignment of comments and payment dates in PDFfile.
