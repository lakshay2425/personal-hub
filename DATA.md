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

Standalone content ideas (`projectId: null`), planner tasks, and per-project features/versions are included in this export. They are not exported separately.

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
**Current version:** 5

### Migration history (`job-search-tracker-db`)

| Version | Change |
|---------|--------|
| 1 | Initial tables: companies, leads, applications, coldEmails, activityLogs |
| 2 | Add `channel` index on leads; backfill missing `channel` with `"Email"` |
| 3 | Add `templates` table (no data migration; existing rows preserved) |
| 4 | Add `templateId` and `followUpTemplateId` on `leads` and `coldEmails`; backfill with `null` |
| 5 | Add `xProfile` on leads; backfill from existing `linkedin` for X-channel leads (keeps `linkedin` unchanged) |

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
| `linkedin` | `string` | LinkedIn profile URL |
| `xProfile` | `string` | X profile URL |
| `channel` | `"Email" \| "LinkedIn" \| "X" \| "Other"` | Required; defaults to `"LinkedIn"` for new leads |
| `status` | `"New" \| "Contacted" \| "Replied" \| "Inactive"` | |
| `firstFollowUpDate` | `string \| null` | Date string for Email leads; `null` otherwise |
| `secondFollowUpDate` | `string \| null` | Date string for Email leads; `null` otherwise |
| `templateId` | `number \| null` | FK → `templates.id` (LinkedIn/X outreach message) |
| `followUpTemplateId` | `number \| null` | FK → `templates.id` (Follow-up type) |
| `notes` | `string` | |
| `createdAt` | `number` | Unix ms |

**Indexes:** `id`, `companyId`, `name`, `role`, `type`, `channel`, `status`, `firstFollowUpDate`, `secondFollowUpDate`, `templateId`, `followUpTemplateId`, `createdAt`

| Page | Route | Channels shown | In-list actions |
|------|-------|----------------|-----------------|
| Leads | `/job-search/leads` | Email, Other | Click email → copy to clipboard; click company → company info modal |
| Outreach | `/job-search/outreach` | LinkedIn, X | Overflow menu: Link (profile URL), Edit, Delete |

**Leads page** also shows follow-up template (Email channel) and follow-up dates (Email only).

**Outreach page** stores separate `linkedin` and `xProfile` fields; Link opens the URL for the lead's channel (`xProfile` with legacy fallback to `linkedin`).

Follow-up **date** columns appear on the Leads page for Email-channel leads only. Outreach leads omit follow-up dates but support follow-up **template** links.

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
| `templateName` | `string` | Legacy free-text; synced from selected template title when set |
| `templateId` | `number \| null` | FK → `templates.id` (Cold Email type) |
| `followUpTemplateId` | `number \| null` | FK → `templates.id` (Follow-up type) |
| `notes` | `string` | |
| `createdAt` | `number` | Unix ms |

**Indexes:** `id`, `companyId`, `leadId`, `role`, `status`, `sentDate`, `firstFollowUpDate`, `secondFollowUpDate`, `templateId`, `followUpTemplateId`, `createdAt`

**UI:** `/job-search/cold-emails` — outreach template (Cold Email type) and follow-up template (Follow-up type) selectable per record.

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

| Entity | `templateId` | `followUpTemplateId` |
|--------|--------------|----------------------|
| `coldEmails` | Cold Email type template | Follow-up type template |
| `leads` (LinkedIn / X) | LinkedIn Message or X DM (by channel) | Follow-up type template |
| `leads` (Email) | — (use cold emails for initial outreach) | Follow-up type template |

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
  "version": 4,
  "exportedAt": "ISO-8601 string",
  "companies": [],
  "leads": [],
  "applications": [],
  "coldEmails": [],
  "templates": [],
  "activityLogs": []
}
```

Import is full overwrite of all six tables.

**Backward compatibility:**

| Backup `version` | Notes |
|------------------|-------|
| 1–2 | No `templates` array → imports with empty templates; no template FK fields → `null` |
| 3 | Has templates; template FK fields on leads/coldEmails default to `null` if missing |
| 4 | Full schema including `templateId` and `followUpTemplateId` |
| 5 | Adds `xProfile`; older backups import with `xProfile: ""` and backfill from `linkedin` for X-channel leads |

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
