# Data reference

Personal Hub stores all user content in the browser using **IndexedDB**, accessed through [Dexie](https://dexie.org). Nothing is synced to a server.

There are **three separate databases** — one per feature area — so modules stay isolated.

| Database | Dexie name | Feature |
|----------|------------|---------|
| Projects & Content Ideas | `question-hub-db` | Projects, questions, answers, content ideas |
| Logger | `logger-db` | Daily log entries |
| Job Search | `job-search-tracker-db` | Companies, leads, applications, cold emails |

Schema definitions live in each feature’s `types.ts`. Dexie store definitions and migrations live in each feature’s `db.ts` (or `lib/db.ts`).

---

## `question-hub-db`

**Source:** `features/questions/lib/db.ts`  
**Current version:** 6

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
| `createdAt` | `number` | Unix ms |

**Indexes:** `id`, `projectId`, `parentId`, `title`, `status`, `createdAt`

**Hierarchy rules:** Same as questions — max depth 2, inherit `projectId` from parent, cascade delete on subtree, sibling-only reorder.

**UI actions (via ⋮ overflow menu):**
- **Add Sub-idea** — create a new child under this idea (when `depth < 2`).
- **Move under…** — reparent an existing idea under another, or back to root level.
- **Edit** / **Delete** — standard CRUD; delete warns if sub-ideas exist.

---

#### `activityLogs` (Content Ideas)

Audit trail for content idea lifecycle events.

| Field | Type | Notes |
|-------|------|-------|
| `id` | `number` | Auto-increment primary key |
| `entityType` | `"contentIdea"` | Fixed value |
| `entityId` | `number` | Content idea id |
| `action` | `string` | e.g. `"Content Idea Created"`, `"Content Idea Status Changed"`, `"Content Idea Deleted"` |
| `timestamp` | `number` | Unix ms |

**Indexes:** `id`, `entityType`, `entityId`, `action`, `timestamp`

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
  "activityLogs": []
}
```

**Import:** Full overwrite — clears all five tables, then inserts exported records.  
**Source:** `features/questions/lib/exportRepository.ts`, `features/questions/lib/importRepository.ts`

Standalone content ideas (`projectId: null`) are included in this export. They are not exported separately.

---

## `logger-db`

**Source:** `features/logger/lib/db.ts`  
**Current version:** 1

### `logEntries`

| Field | Type | Notes |
|-------|------|-------|
| `id` | `string` | UUID primary key |
| `date` | `string` | Calendar date (e.g. `YYYY-MM-DD`) |
| `text` | `string` | Entry body |
| `createdAt` | `number` | Unix ms |
| `updatedAt` | `number` | Unix ms |

**Indexes:** `id`, `date`

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
**Current version:** 1

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
| `type` | `string` | |
| `email` | `string` | |
| `linkedin` | `string` | |
| `channel` | `"Email" \| "LinkedIn" \| "X" \| "Other"` | Required; defaults to `"LinkedIn"` for new leads |
| `status` | `"New" \| "Contacted" \| "Replied" \| "Inactive"` | |
| `firstFollowUpDate` | `string \| null` | Date string for Email leads; `null` otherwise |
| `secondFollowUpDate` | `string \| null` | Date string for Email leads; `null` otherwise |
| `notes` | `string` | |
| `createdAt` | `number` | Unix ms |

**Indexes:** `id`, `companyId`, `name`, `role`, `type`, `channel`, `status`, `firstFollowUpDate`, `secondFollowUpDate`, `createdAt`

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

### `coldEmails`

| Field | Type | Notes |
|-------|------|-------|
| `id` | `number` | Auto-increment primary key |
| `companyId` | `number` | FK → `companies.id` |
| `leadId` | `number` | FK → `leads.id` |
| `role` | `string` | |
| `sentDate` | `string` | Date string |
| `status` | `"Draft" \| "Sent" \| "Replied" \| "Rejected" \| "Positive Response" \| "Closed"` | |
| `firstFollowUpDate` | `string` | Date string |
| `secondFollowUpDate` | `string` | Date string |
| `templateName` | `string` | |
| `notes` | `string` | |
| `createdAt` | `number` | Unix ms |

**Indexes:** `id`, `companyId`, `leadId`, `role`, `status`, `sentDate`, `firstFollowUpDate`, `secondFollowUpDate`, `createdAt`

---

### `activityLogs` (Job Search)

| Field | Type | Notes |
|-------|------|-------|
| `id` | `number` | Auto-increment primary key |
| `entityType` | `"company" \| "lead" \| "application" \| "coldEmail"` | |
| `entityId` | `number` | Id of the related entity |
| `action` | `string` | Human-readable action label |
| `timestamp` | `number` | Unix ms |

**Indexes:** `id`, `entityType`, `entityId`, `action`, `timestamp`

---

### Export / import (Job Search module)

```json
{
  "version": 2,
  "exportedAt": "ISO-8601 string",
  "companies": [],
  "leads": [],
  "applications": [],
  "coldEmails": [],
  "activityLogs": []
}
```

Import is full overwrite of all five tables.

---

## Conventions

### Timestamps

Most `createdAt` / `updatedAt` / `timestamp` fields are **Unix milliseconds** (`Date.now()`).

Job Search date fields (`appliedDate`, `sentDate`, follow-up dates) and Logger `date` are **ISO date strings** (`YYYY-MM-DD`).

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
