# UI conventions — Forms, buttons, snackbars, copy

This document locks **Vuetify 3** patterns used on CRUD pages (reference: `pages/users/index.vue`, `pages/roles/index.vue`, `pages/units/index.vue`, `pages/tenants/index.vue`) so layout and behavior stay consistent when adding features. The same **Close** styling is applied to Spike template demos that still use text dismiss buttons under `components/ui-components/dialogs/` and sample app widgets (`components/apps/notes`, `components/apps/kanban`) so examples match production CRUD.

---

## 0. Language and user-facing copy

- **UI language:** All user-visible strings in the app (labels, buttons, placeholders, empty states, dialog titles/bodies, **FE** success messages, and **FE** fallback errors) are **English**.
- **Backend / API messages:** Text coming from the server (`error?.message`, GraphQL `errors[].message`, etc.) is shown **as returned** — do **not** translate or rewrite BE copy in the frontend.
- **Dismiss (`Close` / `Close Dialog`) buttons:** Always **`color="secondary"`** + **`variant="tonal"`** + **`class="px-4 rounded-pill"`** when those classes are used on CRUD modals (see §2). Do **not** use `color="error"` or `color="primary"` for dismiss-only actions — reserve **`error`** for destructive confirms (e.g. **Force Delete**). Icon-only dismiss (e.g. `mdi-close` in template tables) may stay `variant="text"` without a semantic color; this rule targets **labeled Close** buttons in dialogs.
- **Force delete:** Use the exact label **`Force Delete`** for the destructive action and dialog title (aligned with backend docs `FORCE-DELETE-POLICY.md`). Do **not** use wording like “permanent delete” / “hapus permanen” in the UI.
- **Soft delete confirmation dialogs:** Use **`Delete {Entity}`** as the dialog title and **`Delete`** for the confirm button (soft delete). Dismiss with **`Close`** (same as create/edit forms).
- **Force Delete dialog footer:** Use **`Close`** for dismiss — **not** “Cancel”. Footer layout and button order must match the soft-delete confirm dialogs and §2: **`v-spacer`** → primary **`Force Delete`** → **`Close`** (far right). **`Close`** uses **`color="secondary"`** (see §2, §7).

---

## 1. Form dialogs (`v-dialog` + `v-card`)

**Detailed validation, hints, submit wiring, and in-dialog errors:** see **[`FORM-UI-UX.md`](./FORM-UI-UX.md)** — follow it for new create/update dialogs so behavior matches Users, Units, and Tenants. That doc requires **`validate-on="input lazy"`** on **`v-form`** (not **`validate-on="input eager"`** on each field) so dialogs do not show validation errors before the user interacts.

- Standard structure:
  - `v-dialog` → `v-card`
  - Title: `v-card-title` with a bottom separator, e.g. `class="text-h6 pa-5 border-bottom"` or `border-b` + padding aligned with content.
  - Form body: `v-card-text` with `class="pa-5"` (fields `variant="outlined"`, **`density="compact"`** on CRUD pages — reference `pages/users/index.vue`).
- **Long content:** set `scrollable` on `v-dialog` so **action footer stays pinned** and only the form area scrolls (same as Assign permissions on Roles).

---

## 2. Action footer (`v-card-actions`)

- Place **after** `v-card-text`, as its own bar.
- Wrapper class: **`class="pa-5 border-t"`** (padding + top border, consistent with Users).
- Layout: **`v-spacer`** then primary action, then dismiss (for simple Save/Close dialogs).
- **Button order** (right side, after spacer): **Save** → **Close** (primary first, dismiss second — Create User pattern).

### Button theme (required for Save / Close in form dialogs)

| Button    | Props                                                                    |
|-----------|--------------------------------------------------------------------------|
| **Save**  | `color="success"` `variant="tonal"` `class="px-4 rounded-pill"`          |
| **Close** | `color="secondary"` `variant="tonal"` `class="px-4 rounded-pill"`          |

- Use **`:loading`** on Save during async submit (e.g. `actionLoading` / `assignSaving`).
- **Create/update forms** wired with `v-form` + `type="submit"` (see [`FORM-UI-UX.md`](./FORM-UI-UX.md)): do **not** disable Save only because required fields are empty — **Vuetify rules + `validate()`** handle that. You may still use **`:disabled="actionLoading"`** on **Close** to avoid dismissing mid-submit.

Other secondary actions (e.g. Reset Password) follow the same page pattern (Users: `warning` + `tonal` + `rounded-pill`).

---

## 3. Success snackbar

State:

- `successSnackbar` (`ref(false)`)
- `successMessage` (`ref("")`) — dynamic text; do **not** hardcode long text in the template.

Before showing:

```ts
successMessage.value = "Clear, short success message.";
successSnackbar.value = true;
```

Standard markup (same as Users):

```vue
<v-snackbar
  v-model="successSnackbar"
  location="top right"
  color="success"
  rounded="pill"
  timeout="2500"
>
  <div class="d-flex align-center ga-2">
    <v-icon size="18">mdi-check-circle-outline</v-icon>
    <span>{{ successMessage }}</span>
  </div>
</v-snackbar>
```

**Placement:** inside the main page **`v-card-text`** (sibling after the table/main content), **not** outside `v-card`, matching `users/index.vue`.

---

## 3b. Error snackbar (title + description)

For **failed save / mutation / async actions** (not the main table load error), use a separate snackbar from success. Reference: `pages/units/index.vue`, `pages/tenants/index.vue`.

### State and helper

- `errorSnackbar` (`ref(false)`)
- `errorSnackTitle` (`ref("")`) — short, contextual **English** FE title (e.g. *Failed to create unit*).
- `errorSnackDescription` (`ref("")`) — detail from `error?.message` (GraphQL / network); may be empty. **Do not** translate BE text; pass it through as the description.

```ts
const showErrorSnack = (title: string, description?: string | null) => {
  errorSnackTitle.value = (title || "Something went wrong").trim();
  errorSnackDescription.value = String(description ?? "").trim();
  errorSnackbar.value = true;
};

// Example in catch:
showErrorSnack("Failed to create unit", error?.message);
```

### Differences vs success snackbar

| Aspect | Success (§3) | Error (§3b) |
|--------|----------------|-------------|
| **`rounded`** | `rounded="pill"` | **`rounded="lg"`** — not pill |
| **Content** | Single row: icon + text | **Title** + **description** (optional) |
| **`timeout`** | `2500` | `4000` (two-line text needs slightly longer) |
| **`color`** | `success` | `error` |

### Standard markup

```vue
<v-snackbar
  v-model="errorSnackbar"
  location="top right"
  color="error"
  rounded="lg"
  timeout="4000"
  max-width="420"
>
  <div class="d-flex align-start ga-3">
    <v-icon size="20">mdi-alert-circle-outline</v-icon>
    <div class="snackbar-error-text">
      <div class="text-body-1 font-weight-medium">{{ errorSnackTitle }}</div>
      <div
        v-if="errorSnackDescription"
        class="text-body-2 text-medium-emphasis mt-1"
      >
        {{ errorSnackDescription }}
      </div>
    </div>
  </div>
</v-snackbar>
```

**Description style:** `text-body-2` + `text-medium-emphasis` so hierarchy is clear vs title.

**Optional CSS** (page scoped): cap width for long text, e.g.

```css
.snackbar-error-text {
  max-width: 340px;
  word-break: break-word;
}
```

### Table / list load errors

- Keep **`v-alert`** above content for **failed main list load** (pagination) so list problems stay visible without competing with action snackbars.
- Error snackbar §3b is for **user actions** (create/update/delete/restore, failed detail fetch, etc.).

**Placement:** same as success — sibling inside main page `v-card-text`.

---

## 4. Table status (text, not chip)

For status columns (e.g. “Active” / status name):

- Use **`span`** with `class="font-weight-medium"`.
- Highlight active: `:class="{ 'text-success': ... }"` (Users: `statusName?.toLowerCase() === 'active'`; booleans: `Boolean(item.isActive)`).
- Avoid **`v-chip`** for status so it matches Users.

---

## 5. CRUD table toolbar (shadow)

**Row density and typography defaults** (compact tables app-wide): see **§5a**.

- Table class: **`border rounded-md crud-tbl`**.
- Toolbar in `#top` slot: **`flat` `elevation="0"`** + bottom border if needed.
- Toolbar shadow is removed globally via **`assets/scss/components/_VTable.scss`** (`.crud-tbl .v-toolbar`); do not duplicate per-page unless there is an exception.

---

## 5a. Data tables — compact density and typography (global)

**Goal:** More rows fit in the viewport without changing column logic; headers and cells read slightly smaller than the legacy template defaults.

### Vuetify defaults (`plugins/vuetify.ts`)

These components default to **`density: "compact"`** (inherits Vuetify `VTable` CSS variables — header row **40px**, body row **36px** in the bundled `VTable.css`):

| Component | Purpose |
|-----------|---------|
| **`VDataTable`** | Client-side / static lists |
| **`VDataTableServer`** | Server-paginated lists (e.g. Users, Units) |
| **`VDataTableVirtual`** | Virtualized tables |
| **`VTable`** | Simple HTML tables |

New tables pick up compact density automatically. **Override per table** when a screen must stay airy, e.g. **`density="comfortable"`** or **`density="default"`** on that instance only.

### App-level SCSS (`assets/scss/components/_VTable.scss`)

Rules under **`.v-data-table`** tighten presentation on top of Vuetify’s compact density:

| Target | Style |
|--------|--------|
| **`th.v-data-table__th`** | **`font-size: 13px`**, medium-emphasis text color |
| **`td.v-data-table__td`** | **`font-size: 13px`**, **`text-wrap: nowrap`** (avoid ragged multi-line cells unless a column opts out in a slot) |
| **`.v-data-table-footer`** | **`padding: 8px 8px`**, **`min-height: 48px`** (pagination / rows-per-page bar) |
| **`.tdhead`** | **`font-size: 13px`** (if used) |

**Mobile:** `@media (max-width: 767px)` centers **`.v-data-table-footer`** content.

**Other table systems:** `.vue3-easy-data-table` and specialty classes (`.border-table`, `.ticket-table`, `.invoice-table`) keep their own rules; this §5a targets **Vuetify `v-data-table*`** used on CRUD pages.

### Reference pages

- **`pages/users/index.vue`** — `v-data-table-server` + `crud-tbl`
- **`pages/units/index.vue`**, **`pages/user-role-scopes/index.vue`** — same pattern
- **`pages/roles/index.vue`** — plain **`v-data-table`** (no footer), still gets compact rows from defaults

---

## 5a-1. Row action menu — compact pattern (CRUD tables)

Use a compact dropdown pattern for the kebab menu (`mdi-dots-vertical`) in action columns so row actions stay dense and consistent across pages.

### Required markup

- `v-list`: **`density="compact"`** + **`min-width="168"`** + class **`action-menu-compact`**.
- Every `v-list-item` action row: **`density="compact"`** + **`min-height="30"`**.
- Action icons in prepend slot: **`size="16"`**.
- Keep permission guards (`v-if`) and action handlers unchanged; this section only standardizes visual density.

### Required scoped style

```css
.action-menu-compact :deep(.v-list-item-title) {
  font-size: 0.8125rem;
  line-height: 1.2;
}
```

### Applied pages

- `pages/users/index.vue`
- `pages/units/index.vue`
- `pages/tenants/index.vue`
- `pages/user-role-scopes/index.vue`

---

## 5b. Table list: paginated vs plain (match backend)

Follow the GraphQL API **shape**:

| API | UI table |
|-----|----------|
| **Paginated** (e.g. `*FindAllPaginated` with `page`, `limit`, `search`, `sortBy`, …) | `v-data-table-server` or equivalent: **search** (toolbar), **pagination**, **server-side sort**, wired to query variables. |
| **Full list** (e.g. `rolesFindAll` without pagination) | **Plain `v-data-table`**: no `#top` search, **`hide-default-footer`**, **`disable-sort`**, column headers **`sortable: false`**. |

Plain example: `pages/roles/index.vue`. Plain **without** toolbar search/pagination/sort (one-shot list): `pages/tenants/index.vue` (`tenantsFindAll` — pass `withDeleted: true` for trash). Paginated example: `pages/users/index.vue` — trash list sends `paginationInput.withDeleted: true` on `usersFindAllPaginated` (default `false` = active only). Same pattern: **`unitsFindAllPaginated`** uses `paginationInput.withDeleted` for trashed units.

---

## 6. Checklist before merging new UI

- [ ] Form dialogs have `v-card-actions` with **`pa-5 border-t`** and **Save / Close** order as above.
- [ ] **Create/update** dialogs follow **[`FORM-UI-UX.md`](./FORM-UI-UX.md)** (`v-form`, **`validate-on="input lazy"`**, rules, submit, in-dialog mutation errors; no per-field **`input eager`** that fires validation on open).
- [ ] Save/Close use **tonal + rounded-pill** per section 2; **Close** uses **`color="secondary"`**.
- [ ] Success snackbar: **top right**, **pill**, **2500ms**, **icon + `successMessage`** (English copy).
- [ ] If the page has mutations/async actions: error snackbar **§3b** — **title + description**, **`rounded="lg"`** (not pill), **`timeout="4000"`**; FE titles in English; description from `error?.message` unchanged.
- [ ] Table status follows **text + success** pattern where relevant.
- [ ] Tables use **`crud-tbl`** and do not add extra toolbar box-shadow.
- [ ] New **`v-data-table` / `v-data-table-server`** tables rely on global **compact density** (**§5a**); only set a different **`density`** when the design explicitly needs more vertical space.
- [ ] Row action menus (kebab dropdown) follow compact pattern in **§5a-1** (`min-width="168"`, item `min-height="30"`, icon `size="16"`, compact title text).
- [ ] **Plain vs paginated** table pattern follows **§5b** (matches backend query).
- [ ] **Force Delete** dialog footer matches §7: **`v-spacer`** → **`Force Delete`** → **`Close`** (no **Cancel**).

---

## 7. Delete vs Force Delete

For resources with soft delete (`users`, `units`, `tenants`), use:

- **Delete** = soft delete (GraphQL: `usersDelete`, `unitsDelete`, `tenantsDelete`). Confirm dialog title e.g. **`Delete User`** / **`Delete Unit`** / **`Delete Tenant`**; primary button **`Delete`** (`color="warning"` …); dismiss **`Close`** (`color="secondary"` `variant="tonal"` `rounded-pill`) on the **far right**, after **`v-spacer`** + **`Delete`**.
- **Force Delete** appears only in **trashed / deleted** lists (not on active lists). GraphQL: `usersForceDelete`, `unitsForceDelete`, `tenantsForceDelete`.
- Before force delete, show a confirmation dialog explaining permanent removal and that related rows follow DB FK rules (`CASCADE` may remove children; `RESTRICT` may cause the server to reject the operation).
- **Force Delete dialog footer (must match soft-delete dialog layout):** **`v-spacer`** → **`Force Delete`** → **`Close`**. Same horizontal order as **Delete** dialogs: primary action first (after spacer), **Close** last on the right. **`Force Delete`:** `color="error"` `variant="tonal"` `class="px-4 rounded-pill"` `:loading="actionLoading"`. **`Close`:** `color="secondary"` `variant="tonal"` `class="px-4 rounded-pill"` `:disabled="actionLoading"` — same as all dialog **Close** buttons (neutral dismiss; do not use `error` for **Close**). **Do not** use a **Cancel** button here. Do not label the primary button “Delete” for this flow; it must read **Force Delete**.
- Backend rules (validation, permissions, FK behavior, soft-delete state) live in **`appkerja-web-be/docs/FORCE-DELETE-POLICY.md`**.

---

*Last aligned: all dialog **Close** / **Close Dialog** buttons use **`secondary` + `tonal`** on Users, Units, Tenants, Roles (assign dialog); Spike demos `DialogsNested`, `DialogsScrollable`, `DialogsForm`, `DialogsTransitions`, `DialogsActivator`; samples `AddNote`, `AddTask`. Force Delete footer = **Close** not Cancel; English copy and snackbar patterns unchanged. **§5a** documents global **compact** data tables (`plugins/vuetify.ts` + `assets/scss/components/_VTable.scss`), and **§5a-1** documents compact row action menus across Users/Units/Tenants/User role scopes.*
