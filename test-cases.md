# Feature test cases

Tests use Node's built-in test runner through the existing `tsx` development
dependency. Each top-level feature has a separately runnable suite. The default
`pnpm test` command runs every feature suite.

## Run tests

```sh
# All features
pnpm test

# All suites under features/
pnpm run test:features

# One top-level feature at a time
pnpm run test:content-ideas
pnpm run test:dashboard
pnpm run test:job-search
pnpm run test:logger
pnpm run test:people
pnpm run test:planner
pnpm run test:project-features
pnpm run test:questions
pnpm run test:settings
pnpm run test:shared

# Narrow Job Search suite
pnpm run test:job-search:bulk-touchpoints
```

Add new tests under `features/<feature>/__tests__/`. Each top-level feature
script uses a recursive glob, so the feature remains runnable independently.

## Suite coverage

### Content ideas — `features/content-ideas/__tests__/contentIdeas.test.ts`

- Sorts and nests ideas in a tree without mutating source records.
- Counts nested descendants and identifies ancestor relationships.
- Excludes self, descendants, and targets that exceed the maximum depth when
  choosing a new parent.
- Handles missing idea IDs and root-move restrictions.
- Truncates titles at, below, and above the configured limit.
- Parses local date strings without changing the date.
- Produces a complete seven-day week and full calendar month grid.

### Dashboard — `features/dashboard/__tests__/dashboard.test.ts`

- Counts open sprint/iterative roots, excluding child tasks.
- Counts completed tasks within the selected Monday-to-Sunday interval,
  including both boundaries and excluding adjacent dates.
- Groups in-range logs by configured category and ignores out-of-range logs.
- Handles empty data and no configured categories.

### Job Search — `features/job-search/__tests__/`

Current suites: `bulkTouchpoints.test.ts` and `jobSearchUtils.test.ts`.
`weeklyLeadActivity.test.ts` covers daily activity counts across a selected week.

#### Bulk touchpoints

- Empty, common-channel, mixed-channel, and incompatible lead selections.
- Company-level selection selects/deselects all visible leads in a group,
  indicates partial selection, and blocks mixed-channel or incompatible groups.
- Channel-specific create mappings for LinkedIn, Email, and X.
- Eligible latest replies, connection acceptance, Email follow-ups, and X
  follow-ups.
- No eligible touchpoints, tied latest touchpoints, and missing IDs.
- Updates modify existing records instead of creating duplicates and do not
  update lead status.
- Writer failures, ordered partial writes, one refresh after a batch, empty
  batches, and refresh failures.

#### Job Search utility functions

- Normalizes social profile URLs, handles legacy X data, and ignores
  non-social channels.
- Shows social profile URLs based on populated fields regardless of outreach
  channel, backfills legacy X data, and rejects URLs outside the supported
  social domains.
- Provides a copy-to-clipboard email action and external profile links in the
  all-leads, touchpoint, and lead-detail views.
- Collects unique valid LinkedIn profile URLs while excluding blank and
  non-LinkedIn profile values.
- Formats product-outreach handles and constructs Instagram, LinkedIn, X, and
  Email links, including blank handles.
- Chooses contact titles from explicit labels, first interactions, or the
  untitled fallback.
- Splits supported template placeholders and rejects unknown tokens.
- Groups leads by company, handles missing company records, and filters
  touchpoints by week.

#### Weekly activity

- Displays all seven days from Monday through Sunday, including days with no
  activity.
- Counts leads by their local creation date and excludes records outside the
  selected week.
- Counts only touchpoints with `Sent` status using the touchpoint occurrence
  date.
- Switches the metric between lead counts and sent-touchpoint counts when the
  selected view changes.

### Logger — `features/logger/__tests__/logger.test.ts`

- Accepts valid and empty version 1 backup payloads.
- Rejects null/non-object payloads, arrays, wrong versions, and missing or
  malformed required arrays.
- Formats a log date with its weekday, month, and year.

### People — `features/people/__tests__/people.test.ts`

- Searches discovery/network records case-insensitively across their relevant
  fields and accepts blank queries.
- Sorts discovery by status priority and recency; sorts network people by
  case-insensitive name and recency.
- Trims saved fields and falls back for invalid platform, discovery status, or
  relationship type.

### Planner — `features/planner/__tests__/planner.test.ts`

- Sorts task trees and preserves source data.
- Collects nested descendants and computes completion progress.
- Prevents completion toggles for parent tasks and recursive root tasks while
  allowing eligible leaf tasks.
- Produces accurate delete warnings for leaves, one descendant, and nested
  descendants.
- Normalizes dates to Monday, moves forward/backward by weeks, and formats the
  Monday-Sunday range.

### Project features — `features/project-features/__tests__/projectFeatures.test.ts`

- Trims creation fields, applies defaults, and preserves explicit version IDs.
- Handles omitted optional values and null versions.
- Updates only provided fields, including explicitly clearing a version.
- Detects changed, unchanged, and unspecified feature statuses.

### Questions — `features/questions/__tests__/questions.test.ts`

- Builds sorted nested question trees without mutating the input.
- Counts and collects nested descendants.
- Prevents self-parenting, descendant cycles, and moves that exceed allowed
  nesting depth.
- Handles missing questions, root-move restrictions, and short/long text.

### Settings — `features/settings/__tests__/settings.test.ts`

- Validates exact priority-slot count.
- Rejects case/whitespace-insensitive duplicate priority names.
- Allows blank/null slots without false duplicate failures.
- Returns active priorities and colors, including unknown and unassigned
  categories.

### Shared — `features/shared/__tests__/selectionUtils.test.ts`

- Toggles selection on/off without mutating the original Set.
- Supports string and numeric IDs while preserving insertion order.
- Replaces selection, removes duplicate IDs, and clears to an empty selection.

## Scope and known gaps

These are automated unit tests for the feature's pure business logic and
validation behavior. Database-backed Dexie transaction flows and rendered
browser interactions are not yet covered by automated integration or
end-to-end tests. A passing feature suite should not be read as proof of those
uncovered surfaces.
