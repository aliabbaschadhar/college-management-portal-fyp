# Dashboard Header Icons And Admin Label Fix

## Goal
Keep the three utility icons anchored on the right side for all dashboards and remove the duplicate Administrator label.

## Tasks
- [x] Locate the shared dashboard shell/header components used by all role dashboards -> Verify: `DashboardHeader` is rendered from `DashboardShell`.
- [x] Update the shared header layout so the utility controls container is pinned to the right (`ml-auto`) -> Verify: the icon group aligns right in all dashboard routes.
- [x] Remove the extra role label from the top header (keep role context in sidebar only) -> Verify: only one Administrator label appears.
- [x] Keep header responsive by hiding the search field on small screens so right-side icons remain visible and aligned -> Verify: on mobile widths, icon group remains on the right without overlap.
- [x] Run project typecheck/lint checks relevant to the change -> Verify: no new errors introduced by this update.

## Done When
- [x] Dashboard header always shows the three utility icons at the right edge across roles/pages.
- [x] Duplicate Administrator text is no longer shown.
- [x] Validation commands complete without new issues from edited files.
