# Changelog

This project adheres to [Keep a Changelog](https://keepachangelog.com/en/1.0.0/)
and follows [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.3] - 2025-06-25

### Added

- New pane, in `productos[code]`.

- New component `ProductStock`.

- Added icons in common/constants for stock operations.

- Added constants in products.constants.js:
  * EXAMPLE_STOCK_TEMPLATE_DATA (temporary until backend is ready),
  * EMPTY_STOCK_FILTERS,
  * STOCK_TYPE_OPTIONS,
  * STOCK_TABLE_HEADERS.

### Changed

- `Proveedores[id]` enhanced Excel dropdown menu.
 Submenu under "Stock" includes: Import Inflows/Import Outflows/Download Template.

- Refactored handleConfirm method for cleaner branching logic between modes (add, out, edit, delete).

- Renamed internal stock.amount for better semantic clarity.

- Changed icon colors in ModalActions usage across clientes, marcas, proveedores, productos, and usuarios views to align with consistent visual styles.

### Fixed

- Fixed margin overlap in react-datepicker by adjusting styles in src/app/stylesLayout.js.

- Fixed an issue in api/products > useProductsBySupplierId by adding the missing code key required for indexdb operations.

- Fixed support for titleIconColor in ModalActions component to apply icon color correctly.

- Cleaned up duplicate row rendering logic in <Table> component.

- Removed deprecated OptionsHeader component.

## [1.0.2] - 2025-06-03

### Added

- Implemented product change history component (`ProductChanges`).
- Added `FIELD_LABELS`, `getLabel`, `PRODUCT_LABELS` to `products.constants`.
- Added const `LABELS` to `common/constants`.
- Stored filters applied on main tables.

### Changed

- Updated product detail view layout: now displayed in tab format with separate tabs for "Producto" and "Historial de cambios" (`ProductChanges`).

## [1.0.1] - 2025-05-28

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


## [1.0.0] - 2025-05-21

### Added
- Display of payment dates, sorted in ascending order (oldest first) in PDFfile.

### Changed
- Alignment of comments and payment dates in PDFfile.
