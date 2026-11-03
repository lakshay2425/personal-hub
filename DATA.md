# Data reference

Personal Hub stores all user content in the browser using **IndexedDB**, accessed through [Dexie](https://dexie.org). Nothing is synced to a server.

There are **three separate databases** — one per feature area — so modules stay isolated.

| Database | Dexie name | Feature |
|----------|------------|---------|
| Projects & Content Ideas | `question-hub-db` | Projects, questions, answers, content ideas, planner tasks, project features, versions |
| Logger | `logger-db` | Daily log entries |
| Job Search | `job-search-tracker-db` | Companies, leads, applications, cold emails, templates |

Schema definitions live in each feature’s `types.ts`. Dexie store definitions and migrations live in each feature’s `db.ts` (or `lib/db.ts`).

---

## `question-hub-db`

**Source:** `features/questions/lib/db.ts`  
**Current version:** 9

### Tables

#### `projects`

| Field | Type | Notes |
|-------|------|-------|
| `id` | `string` | UUID primary key |
| `name` | `string` | Required |
| `description` | `string \| null` | Optional |
| `createdAt` | `number` | Unix ms |
| `updatedAt` | `number` | Unix ms |

**Indexes:** `id`

---

#### `questions`

| Field | Type | Notes |
|-------|------|-------|
| `id` | `string` | UUID primary key |
| `projectId` | `string \| null` | `null` = inbox (not assigned to a project) |
| `parentId` | `string \| null` | `null` = root question; otherwise parent question UUID |
| `depth` | `0 \| 1 \| 2` | `0` root, `1` sub-question, `2` sub-sub-question |
| `sortOrder` | `number` | Order among siblings (same `parentId`); lower = higher in list |
| `questionText` | `string` | Required |
| `status` | `"answered" \| "unanswered"` | |
| `createdAt` | `number` | Unix ms |
| `updatedAt` | `number` | Unix ms |
| `answeredAt` | `number \| null` | Set when status becomes `answered` |

**Indexes:** `id`, `projectId`, `parentId`

**Hierarchy rules:**
- Max depth is **2** (root → sub-question → sub-sub-question).
- Sub-questions inherit the parent’s `projectId`.
- Deleting a question cascades to all descendants and their answers.
- Reordering only applies among siblings (same `parentId`).

---

#### `answers`

| Field | Type | Notes |
|-------|------|-------|
| `id` | `string` | UUID primary key |
| `projectId` | `string \| null` | Mirrors the question’s project |
| `questionId` | `string` | Parent question UUID |
| `title` | `string` | Required |
| `body` | `string` | Required |
| `createdAt` | `number` | Unix ms |
| `updatedAt` | `number` | Unix ms |

**Indexes:** `id`, `questionId`, `projectId`

---

#### `contentIdeas`

| Field | Type | Notes |
|-------|------|-------|
| `id` | `number` | Auto-increment primary key |
| `projectId` | `string \| null` | `null` = standalone (top-level nav); otherwise project UUID |
| `parentId` | `number \| null` | `null` = root idea; otherwise parent idea id |
| `depth` | `0 \| 1 \| 2` | `0` root, `1` sub-idea, `2` sub-sub-idea |
| `sortOrder` | `number` | Order among siblings (same `parentId`); lower = higher in list |
| `title` | `string` | Required |
| `status` | `"Draft" \| "Ready" \| "Published"` | |
| `publishedLinks` | `object` | See below; cleared when status ≠ `Published` |
| `publishedLinks.linkedin` | `string` | Optional URL |
| `publishedLinks.twitter` | `string` | Optional URL |
| `publishedLinks.blog` | `string` | Optional URL |
| `publishedLinks.other` | `string` | Optional URL |
| `notes` | `string` | Optional |
| `scheduledDate` | `string \| null` | `YYYY-MM-DD` calendar date; `null` = not scheduled |
| `createdAt` | `number` | Unix ms |

**Indexes:** `id`, `projectId`, `parentId`, `title`, `status`, `scheduledDate`, `createdAt`

**Hierarchy rules:** Same as questions — max depth 2, inherit `projectId` from parent, cascade delete on subtree, sibling-only reorder.

**UI actions (via ⋮ overflow menu):**
- **Add Sub-idea** — create a new child under this idea (when `depth < 2`).
- **Move under…** — reparent an existing idea under another, or back to root level.
- **Edit** / **Delete** — standard CRUD; delete warns if sub-ideas exist.

---

#### `activityLogs`

Audit trail for content idea, planner task, and project feature lifecycle events.

| Field | Type | Notes |
|-------|------|-------|
| `id` | `number` | Auto-increment primary key |
| `entityType` | `"contentIdea" \| "task" \| "feature"` | Entity kind |
| `entityId` | `number` | Content idea, task, or feature id |
| `action` | `string` | e.g. `"Content Idea Created"`, `"Task Completed"`, `"Feature Status Changed"` |
| `timestamp` | `number` | Unix ms |

**Indexes:** `id`, `entityType`, `entityId`, `action`, `timestamp`

---

#### `tasks`

Weekly planner tasks (Monday-based weeks).

| Field | Type | Notes |
|-------|------|-------|
| `id` | `number` | Auto-increment primary key |
| `weekStart` | `string` | `YYYY-MM-DD` — Monday of the task's week |
| `parentId` | `number \| null` | `null` = root task; sub-tasks inherit parent's week |
| `depth` | `0 \| 1 \| 2` | Hierarchy depth (max 2 levels of nesting) |
| `sortOrder` | `number` | Manual order among siblings (same `parentId` + `weekStart`) |
| `title` | `string` | Required |
| `priority` | `"High" \| "Medium" \| "Low" \| null` | Root tasks default `Medium`; sub-tasks default `null` (optional) |
| `status` | `"Todo" \| "Done"` | |
| `completedAt` | `number \| null` | Unix ms when marked done; `null` otherwise |
| `notes` | `string` | Optional |
| `createdAt` | `number` | Unix ms |

**Indexes:** `id`, `weekStart`, `parentId`, `title`, `priority`, `status`, `completedAt`, `sortOrder`, `createdAt`

**Hierarchy:** Sub-tasks inherit the parent's `weekStart`. Max depth is 2 (root → sub-task → sub-sub-task). Deleting a parent cascades to all descendants. Reorder applies only among siblings (same `parentId` and `weekStart`). Display order uses `sortOrder`, not priority.

**Completion:** Leaf tasks and sub-tasks log individually to Logger on completion. Parents with sub-tasks show an `X/Y` progress badge and have a disabled checkbox; when all descendants are done, the parent auto-completes silently (no extra Logger entry). Uncompleting any sub-task reverts an auto-completed parent to Todo.

**Planner actions logged:** `"Task Created"`, `"Sub-task Created"`, `"Task Completed"`, `"Task Moved to This Week"`, `"Task Deleted"`

**Logger integration:** Completing a task creates a separate log entry in `logger-db` with `text: "✓ Completed task: [title]"` and `source: "planner"`.

---

#### `features`

Per-project product features (tracked in the Features tab on project detail).

| Field | Type | Notes |
|-------|------|-------|
| `id` | `number` | Auto-increment primary key |
| `projectId` | `string` | Required — parent project UUID |
| `versionId` | `number \| null` | FK → `versions.id`; `null` = unassigned |
| `title` | `string` | Required |
| `status` | `"Idea" \| "Planned" \| "In Progress" \| "Done" \| "Dropped"` | Default `Idea` |
| `notes` | `string` | Optional |
| `createdAt` | `number` | Unix ms |

**Indexes:** `id`, `projectId`, `versionId`, `title`, `status`, `createdAt`

**Feature actions logged:** `"Feature Created"`, `"Feature Status Changed"`, `"Feature Deleted"`

**Version assignment:** Versions are created inline from the feature form combobox. There is no separate version management page and no direct version delete — versions are managed implicitly through features.

---

#### `versions`

Named release buckets for grouping project features (e.g. `"v1.0"`, `"Backlog"`).

| Field | Type | Notes |
|-------|------|-------|
| `id` | `number` | Auto-increment primary key |
| `projectId` | `string` | Required — parent project UUID |
| `name` | `string` | Required, free text |
| `createdAt` | `number` | Unix ms |

**Indexes:** `id`, `projectId`, `name`, `createdAt`

**Cascade:** Deleting a project deletes all its features and versions. Deleting a feature does not delete its version.

---

### Migration history (`question-hub-db`)

| Version | Change |
|---------|--------|
| 1 | Initial: `projects`, `questions`, `answers` |
| 2 | Schema bump (no structural change) |
| 3 | Questions: add `parentId`, `depth`; backfill existing rows |
| 4 | Questions: add `sortOrder`; backfill from `createdAt` |
| 5 | Add `contentIdeas`, `activityLogs` |
| 6 | Content ideas: add `parentId`, `depth`, `sortOrder`; backfill existing rows |
| 7 | Content ideas: add `scheduledDate`; backfill existing rows to `null` |
| 8 | Add `tasks` table (no data migration; existing rows preserved) |
| 9 | Add `features` and `versions` tables (no data migration; existing rows preserved) |
| 10 | Tasks: add `parentId`, `depth`, `sortOrder`; backfill existing flat tasks as depth-0 roots ordered by priority then `createdAt` |

---

### Export / import (Projects module)

**Export:** JSON from the Projects page.  
**Shape:**

```json
{
  "version": 1,
  "exportedAt": "ISO-8601 string",
  "projects": [],
  "questions": [],
  "answers": [],
  "contentIdeas": [],
  "activityLogs": [],
  "tasks": [],
  "features": [],
  "versions": []
}
```

**Import:** Full overwrite — clears all eight tables, then inserts exported records. Older backups without `tasks`, `features`, or `versions` import with empty arrays for missing keys. Tasks missing hierarchy fields are backfilled on import (`parentId: null`, `depth: 0`, `sortOrder` from priority then `createdAt`).  
**Source:** `features/questions/lib/exportRepository.ts`, `features/questions/lib/importRepository.ts`

Standalone content ideas (`projectId: null`), planner tasks, and per-project features/versions are included in this export. Planner tasks can also be exported separately from Planner settings.

### Export / import (Planner module)

**Export:** JSON from the Planner settings page.  
**Shape:**

```json
{
  "version": 1,
  "exportedAt": "ISO-8601 string",
  "tasks": [],
  "activityLogs": [],
  "settings": []
}
```

**Import:** Scoped overwrite — clears planner tasks, task activity logs, and priority settings, then inserts exported records. Other projects, content ideas, feature activity logs, and logger entries stay unchanged. Backups with a `tasks` array, including full Projects exports, can be imported; non-task activity logs are ignored.  
**Source:** `features/planner/lib/backupRepository.ts`

**Project delete cascade:** Deleting a project always removes its questions, answers, features, and versions. Content ideas are either deleted or orphaned (`projectId → null`) based on user choice at delete time.

---

## `logger-db`

**Source:** `features/logger/lib/db.ts`  
**Current version:** 2

### `logEntries`

| Field | Type | Notes |
|-------|------|-------|
| `id` | `string` | UUID primary key |
| `date` | `string` | Calendar date (e.g. `YYYY-MM-DD`) |
| `text` | `string` | Entry body |
| `source` | `"planner" \| undefined` | Optional; set on auto-generated entries from Planner task completion |
| `createdAt` | `number` | Unix ms |
| `updatedAt` | `number` | Unix ms |

**Indexes:** `id`, `date`

**Validation:** Add and edit forms block future dates (`max` = today; rejected with toast if submitted).

### Migration history (`logger-db`)

| Version | Change |
|---------|--------|
| 1 | Initial: `logEntries` |
| 2 | Add optional `source` field (no index change; existing rows preserved) |

### Export / import

```json
{
  "version": 1,
  "exportedAt": "ISO-8601 string",
  "logEntries": []
}
```

Import is full overwrite of `logEntries`.

---

## `job-search-tracker-db`

**Source:** `features/job-search/db.ts`  
**Current version:** 11

### Migration history (`job-search-tracker-db`)

| Version | Change |
|---------|--------|
| 1 | Initial tables: companies, leads, applications, coldEmails, activityLogs |
| 2 | Add `channel` index on leads; backfill missing `channel` with `"Email"` |
| 3 | Add `templates` table (no data migration; existing rows preserved) |
| 4 | Add `templateId` and `followUpTemplateId` on `leads` and `coldEmails`; backfill with `null` |
| 5 | Add `xProfile` on leads; backfill from existing `linkedin` for X-channel leads (keeps `linkedin` unchanged) |
| 6 | Add `productOutreachContacts` and `productOutreachInteractions` tables (no data migration; existing rows preserved) |
| 7 | Convert legacy cold-email records linked to leads into `leadTouchpoints`; add `leadTouchpoints` and `listSettings`; remove migrated lead template assignments |
| 8 | Remove legacy lead follow-up date and template fields |
| 9 | Separate touchpoint response values from touchpoint status and backfill response defaults |
| 10 | Remove the obsolete lead `type` field |
| 11 | Add `weeklyTargetSettings` |

### `companies`

| Field | Type | Notes |
|-------|------|-------|
| `id` | `number` | Auto-increment primary key |
| `companyName` | `string` | Required |
| `sector` | `string` | |
| `website` | `string` | |
| `notes` | `string` | |
| `createdAt` | `number` | Unix ms |
| `updatedAt` | `number` | Unix ms |

**Indexes:** `id`, `companyName`, `sector`, `createdAt`

---

### `leads`

| Field | Type | Notes |
|-------|------|-------|
| `id` | `number` | Auto-increment primary key |
| `companyId` | `number` | FK → `companies.id` |
| `name` | `string` | |
| `role` | `string` | |
| `email` | `string` | |
| `linkedin` | `string` | LinkedIn profile URL |
| `xProfile` | `string` | X profile URL |
| `channel` | `"Email" \| "LinkedIn" \| "X" \| "Other"` | Required; defaults to `"LinkedIn"` for new leads |
| `status` | `string` | Configurable lead status; defaults include New and Contacted |
| `notes` | `string` | |
| `isAlumni` | `boolean` | Whether the lead is a college alumnus; defaults to `false` for existing/imported records when missing |
| `createdAt` | `number` | Unix ms |

**Indexes:** `id`, `companyId`, `name`, `role`, `channel`, `status`, `createdAt`. `isAlumni` is filtered in memory and is not indexed.

| Page | Route | Channels shown | In-list actions |
|------|-------|----------------|-----------------|
| Leads | `/job-search/leads` | All lead channels | Alumni filter, weekly activity, social profile links, copy email, company menu actions |
| Job Outreach | `/job-search/outreach` | LinkedIn, X | Alumni filter, weekly activity, social profile links, channel quick actions, bulk touchpoint actions |
| Product Outreach | `/product-outreach` | Instagram, LinkedIn, X, Email | Grouped contact cards with interaction timeline; Link, Copy context, Edit, Delete per interaction |

Lead creation supports single and bulk entry. Bulk entry can assign one company to all rows or select a company per row; the company, channel, contact fields, notes, and alumni flag are stored per lead. Form drafts are retained in local storage until a successful save. A name match within the selected company is flagged for confirmation; matching email or LinkedIn/X profile values are reported as duplicates.

Profile action icons are shown for valid profile URLs regardless of outreach channel. Email buttons copy the address to the clipboard. Legacy X-channel records with their X URL in `linkedin` are backfilled to `xProfile` for display.

Quick touchpoint actions are channel-specific:

| Channel | Action | Result |
|---------|--------|--------|
| LinkedIn | Connection request sent | Creates a Sent Connection Request with Not accepted response |
| LinkedIn | Connection accepted | Updates the eligible existing connection request to Accepted |
| LinkedIn | Message sent | Creates a Sent Message with Not responded response |
| LinkedIn | Reply received | Updates the eligible existing message to Replied |
| Email | Email sent | Creates a Sent Message with Not responded response |
| Email | Reply received | Updates the eligible existing message or follow-up to Replied |
| X | DM sent | Creates a Sent Message with Not responded response |
| X | Reply received | Updates the eligible existing message or follow-up to Replied |

Created touchpoints use today's date and leave the context/template empty. The
full touchpoint form remains available through Customize, including for
follow-ups. Multi-select actions apply common sent/reply/acceptance actions to
eligible leads sharing a channel; company-level selection is available in
grouped views. Weekly activity shows leads added per day in All leads view and
sent touchpoints per day in touchpoint view, Monday through Sunday.

Company lead actions include deleting all leads for a company and opening the company's available LinkedIn profile URLs in new tabs.

---

### `leadTouchpoints`

| Field | Type | Notes |
|-------|------|-------|
| `id` | `number` | Auto-increment primary key |
| `leadId` | `number` | FK → `leads.id` |
| `channel` | `"Email" \| "LinkedIn" \| "X" \| "Other"` | Channel for the touchpoint |
| `type` | `string` | Such as Initial, Follow-up, Connection Request, Message, or Reply |
| `status` | `string` | Such as Draft or Sent |
| `responseStatus` | `string` | Such as Not responded, Replied, Accepted, or Not accepted |
| `templateId` | `number \| null` | Optional FK → `templates.id` |
| `context` | `string` | Notes/context for the touchpoint |
| `occurredAt` | `number` | Unix ms for the touchpoint date |
| `createdAt` | `number` | Unix ms |

**Indexes:** `id`, `leadId`, `channel`, `status`, `type`, `occurredAt`, `createdAt`

---

### `listSettings`

One record (`id: 1`) stores configurable lead statuses, touchpoint statuses,
response statuses, touchpoint types, and the status values that count as
contacted.

---

### `weeklyTargetSettings`

One record (`id: 1`) stores optional combined and per-category weekly targets
for applications, emails, LinkedIn messages, and LinkedIn connection requests.

---

### `productOutreachContacts`

| Field | Type | Notes |
|-------|------|-------|
| `id` | `number` | Auto-increment primary key |
| `label` | `string` | Optional display name to recognize the person across platforms |
| `createdAt` | `number` | Unix ms |

**Indexes:** `id`, `label`, `createdAt`

---

### `productOutreachInteractions`

| Field | Type | Notes |
|-------|------|-------|
| `id` | `number` | Auto-increment primary key |
| `contactId` | `number` | FK → `productOutreachContacts.id` |
| `channel` | `"Instagram" \| "LinkedIn" \| "X" \| "Email"` | Platform for this touchpoint |
| `handle` | `string` | Instagram username (no `@`), LinkedIn/X profile or handle, or email address |
| `context` | `string` | Required — why you reached out this time |
| `createdAt` | `number` | Unix ms |

**Indexes:** `id`, `contactId`, `channel`, `handle`, `createdAt`

**UI:** `/product-outreach` — contacts grouped with a chronological interaction timeline. Each new touchpoint appends a row (cross-platform allowed). Deleting the last interaction removes the contact.

---

### `applications`

| Field | Type | Notes |
|-------|------|-------|
| `id` | `number` | Auto-increment primary key |
| `companyId` | `number` | FK → `companies.id` |
| `role` | `string` | |
| `portal` | `string` | |
| `jobLink` | `string` | |
| `appliedDate` | `string` | Date string |
| `status` | `"Applied" \| "Interview" \| "Rejected" \| "Offer" \| "Joined"` | |
| `notes` | `string` | |
| `createdAt` | `number` | Unix ms |

**Indexes:** `id`, `companyId`, `role`, `portal`, `status`, `appliedDate`, `createdAt`

---

### Legacy cold email records

`coldEmails` is no longer a current IndexedDB table. During the v7 database
migration, records associated with leads were converted to Email touchpoints.
The `/job-search/cold-emails` route redirects to the Email touchpoint view.
Older JSON backups may still contain `coldEmails`; import converts them to
touchpoints when the backup does not already contain touchpoints.

---

### `templates`

| Field | Type | Notes |
|-------|------|-------|
| `id` | `number` | Auto-increment primary key |
| `type` | `"Cold Email" \| "LinkedIn Message" \| "X DM" \| "Follow-up"` | Required |
| `title` | `string` | Required — short name for the template |
| `subject` | `string` | Optional — relevant for Cold Email type only |
| `body` | `string` | Required — message content; supports `{{name}}`, `{{company}}`, `{{role}}` placeholders |
| `notes` | `string` | Optional — personal notes about when to use |
| `createdAt` | `number` | Unix ms |
| `updatedAt` | `number` | Unix ms |

**Indexes:** `id`, `type`, `title`, `createdAt`, `updatedAt`

**UI:** `/job-search/templates` — card grid with type filter pills and search; copy body to clipboard (no auto-send).

**Template linking (FK references):**

| Entity | `templateId` |
|--------|--------------|
| `leadTouchpoints` | Optional template associated with the touchpoint |

Deleting a template does not cascade-delete linked records; orphaned IDs display as empty in the UI.

---

### `activityLogs` (Job Search)

| Field | Type | Notes |
|-------|------|-------|
| `id` | `number` | Auto-increment primary key |
| `entityType` | `"company" \| "lead" \| "application" \| "coldEmail" \| "template"` | |
| `entityId` | `number` | Id of the related entity |
| `action` | `string` | Human-readable action label |
| `timestamp` | `number` | Unix ms |

**Indexes:** `id`, `entityType`, `entityId`, `action`, `timestamp`

---

### Export / import (Job Search module)

```json
{
  "version": 7,
  "exportedAt": "ISO-8601 string",
  "companies": [],
  "leads": [],
  "applications": [],
  "leadTouchpoints": [],
  "templates": [],
  "activityLogs": [],
  "productOutreachContacts": [],
  "productOutreachInteractions": [],
  "listSettings": [],
  "weeklyTargetSettings": []
}
```

New exports include `isAlumni` on every lead. Import is a full overwrite of all
current Job Search tables, performed in a Dexie transaction.

**Backward compatibility:**

| Backup `version` | Notes |
|------------------|-------|
| 1–2 | Legacy records are normalized; optional newer arrays/settings receive defaults |
| 3–6 | Missing newer tables and settings are initialized empty or with defaults; legacy `coldEmails` are migrated to touchpoints when no touchpoints are present |
| 7 | Current export shape, including touchpoints, product outreach data, list settings, and weekly target settings |

Across versions, missing `isAlumni` imports as `false`; old X-channel leads
with their profile URL only in `linkedin` are backfilled to `xProfile`.

---

## Conventions

### Timestamps

Most `createdAt` / `updatedAt` / `timestamp` fields are **Unix milliseconds** (`Date.now()`).

Job Search `applications.appliedDate` and Logger `date` are **ISO date strings**
(`YYYY-MM-DD`). Lead touchpoint `occurredAt` is a Unix-millisecond timestamp.

### Primary keys

| Pattern | Used by |
|---------|---------|
| UUID (`string`) | `projects`, `questions`, `answers`, `logEntries` |
| Auto-increment (`number`) | `contentIdeas`, `activityLogs`, all Job Search entities |

### Nullable foreign keys

`projectId: null` on questions and content ideas means **not tied to a project** (inbox / standalone). Sub-entities inherit their parent’s `projectId` when created or moved under a parent.

### Hierarchy (questions & content ideas)

Both use the same tree model:

```
depth 0  →  root (parentId = null)
depth 1  →  child of a depth-0 item
depth 2  →  child of a depth-1 item (max depth)
```

Sorting within a level uses `sortOrder` ascending. Tie-breaker: newer `createdAt` first.

---

## Backup tips

1. Use each module’s **Export** button to download JSON backups.
2. Store exports somewhere safe (cloud drive, git-ignored folder).
3. **Import** replaces all data in that module — there is no merge.
4. Clearing browser site data / IndexedDB permanently deletes local records.

---

## Related files

| Area | Types | DB / migrations | Export |
|------|-------|-----------------|--------|
| Projects & Content Ideas | `features/questions/types.ts`, `features/content-ideas/types.ts` | `features/questions/lib/db.ts` | `features/questions/lib/exportRepository.ts` |
| Logger | `features/logger/types.ts` | `features/logger/lib/db.ts` | `features/logger/lib/exportRepository.ts` |
| Job Search | `features/job-search/types.ts` | `features/job-search/db.ts` | `features/job-search/repositories/exportRepository.ts` |
