# Changelog

This project adheres to [Keep a Changelog](https://keepachangelog.com/en/1.0.0/)  
and follows [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.2] - 28-05-2025

### Added

- Global keyboard shortcuts in BudgetPayments:
  * Enter: Submits the form if conditions are met.
  * Delete: Resets the form to original values.

- Support for onKeyDown event in PriceField to allow handling keyboard actions.

  ### Fixed

- Payment amount field (`PriceField`) now correctly resets after adding a new payment without relying on `useEffect`.

- Resolved an issue where the amount input field (PriceField) did not reset when adding a payment via Enter key. This was fixed by dynamically updating the component’s key prop to force re-mount and clear its internal state.

## [1.0.1] - 27-05-2025

### Changed

- Updated entity fetch logic: individual entity requests now bypass IndexedDB and are always retrieved directly from the backend.

- Externalized BudgetPayments module from BudgetView to improve modularity and reuse.

- Refactored BudgetView to delegate payments logic to the new BudgetPayments component.

- Payment records in the Payments table are now sorted chronologically by date using dayjs.


## [1.0.0] - 21-05-2025

### Added
- Display of payment dates, sorted in ascending order (oldest first) in PDFfile.

### Changed
- Alignment of comments and payment dates in PDFfile.
