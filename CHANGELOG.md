# Changelog

This project adheres to [Keep a Changelog](https://keepachangelog.com/en/1.0.0/)
and follows [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.4] - 2025-06-26

### Changed
- Added display of the inactivation reason (inactiveReason) when the product status changes to Inactive.

### Fixed
- Fixxed version history logs, now displaying the user (updatedBy) who made each product update, enhancing traceability in the product change timeline.

## [1.0.3] - 2025-06-19

### Changed
- Improved product search logic in ProductSearch component:
- Prioritizes exact matches on product name or code before falling back to word-by-word partial matches.
- Updated getNumberFormated function for consistent price formatting: ensures correct display of thousand separators.
- Utilizes toLocaleString("es-AR") for consistent regional formatting.

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
