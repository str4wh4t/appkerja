# Form UI/UX conventions (Vuetify 3)

This document describes how **create** and **update** dialogs should be built so they stay consistent with **`pages/users/index.vue`**, **`pages/units/index.vue`**, and **`pages/tenants/index.vue`**. The same **when to validate** rules apply to **profile / onboarding** forms (`components/pages/profile/ProfileAccountTab.vue`, `pages/auth/complete-google-profile.vue`). General dialog chrome (titles, footers, snackbars, copy language) remains in **[`UI-CONVENTIONS.md`](./UI-CONVENTIONS.md)**.

**Label placement:** use the **`label`** prop on **`v-text-field`**, **`v-textarea`**, **`v-select`**, and **`v-autocomplete`** (outlined floating label). Do **not** use a separate **`v-label`** above the control for these fields — see **§2** and **`components/forms/form-elements/custominput/InputRules.vue`** for the minimal pattern.

---

## 1. Goals

- **One obvious submit path:** Enter in a field can submit when the UX allows it; primary action is **Save** as a real **form submit**.
- **No errors on first paint:** empty dialog fields must **not** show rule errors until the user has interacted or submitted (see §5 **`validate-on`** on **`v-form`**). After that, validation follows input (`input lazy` on the form).
- **Server errors next to the form:** failed mutations show inside the dialog so context is not lost.
- **No duplicate “required” UX:** avoid `:disabled="!field.trim()"` on Save; use **rules** + **`validate()`** instead.

---

## 2. Dialog layout order

Inside `v-card-text` with `class="pa-5"`:

1. **`v-alert`** (optional, only when there is a mutation error for **this** dialog) — see §6.
2. **`v-form`** wrapping all fields that participate in validation.

Field blocks use **`mb-3`**. Each labeled control:

- Put the human-readable name on the control itself: **`label="…"`** (e.g. `label="Email"`, `label="Parent unit"`). With **`variant="outlined"`**, Vuetify shows the standard floating label on the field border (same idea as **`InputRules.vue`** using **`label="Enter Email"`** on a **`v-text-field`**).
- **`v-text-field` / `v-textarea` / `v-select` / `v-autocomplete`**: align props order with existing CRUD pages: **`label`** (when applicable), **`color="primary"`**, **`variant="outlined"`**, **`density="compact"`**, **`hide-details="auto"`** (unless you intentionally need another density).
- **`v-switch`** continues to use its built-in **`label`** prop (unchanged).
- **Do not** add a separate **`v-label`** wrapper above text inputs, selects, textareas, or autocompletes — it duplicates the label and diverges from outlined-field UX.

### Where this pattern is applied (CRUD + profile)

| Area | File(s) |
|------|---------|
| Users (create/update dialogs + filter menu selects) | `pages/users/index.vue` |
| Units (create/update) | `pages/units/index.vue` |
| Tenants (create/update) | `pages/tenants/index.vue` |
| User role scopes (create/update) | `pages/user-role-scopes/index.vue` |
| Profile — password + personal details | `components/pages/profile/ProfileAccountTab.vue` |
| Google SSO — complete profile | `pages/auth/complete-google-profile.vue` |

**Roles** (`pages/roles/index.vue`): the assign-permissions dialog uses **`v-checkbox`** with **`:label`** only; no separate **`v-label`** + field pattern there.

---

## 3. `v-form` wiring

- Give the form a **stable `id`**, e.g. `create-user-form`, `edit-unit-form` (unique per page).
- Set **`validate-on="input lazy"`** on **`v-form`** so child inputs inherit it (Vuetify 3 `useValidation`): **lazy** skips the initial `validate()` on mount, while **input** re-validates as the user types once the field is no longer pristine. Do **not** rely on the legacy **`lazy-validation`** attribute on `v-form` alone — prefer this explicit prop (see §5).
- **`ref`** on the form for programmatic validation (TypeScript-friendly shape used in the codebase):

```ts
const createEntityFormRef = ref<{ validate: () => Promise<{ valid: boolean }> } | null>(null);
```

- **`@submit.prevent="submitCreate"`** (or `submitEdit`) on **`v-form`** so submit is centralized.

Example opening tag:

```vue
<v-form
  id="create-user-form"
  ref="createUserFormRef"
  validate-on="input lazy"
  @submit.prevent="submitCreate"
>
```

---

## 4. Save button (footer)

- **Do not** use `@click="submitCreate"` on Save for the main create/update flow.
- Use **`type="submit"`** and **`form="<same id as v-form>"`** so the button lives in **`v-card-actions`** but still submits the form (matches Users).

```vue
<v-btn
  color="success"
  variant="tonal"
  class="px-4 rounded-pill"
  type="submit"
  form="create-user-form"
  :loading="actionLoading"
>
  Save
</v-btn>
```

- **Do not** disable Save solely because required strings are empty; invalid submit runs **`validate()`** and surfaces field errors.
- **`:loading="actionLoading"`** on Save is enough to block double-submit during the mutation.

---

## 5. Validation rules and field props

### Rules

- Define **arrays of validator functions** (return `true` or an error **string** in English).
- **Trim** in rules when checking “required” or length, e.g. `String(v || "").trim()`.
- **Max lengths** (and formats) should match **backend / DB** (`varchar` length, DTO, entity). Prefer reading the canonical limit from the backend entity or migration when adding a new resource.

### When validation runs (`validate-on`)

- **On the `v-form`:** use **`validate-on="input lazy"`** once per form. Fields inside the form **inherit** this unless they set their own `validate-on`.
- **Do not** put **`validate-on="input eager"`** on individual fields in these dialogs. In Vuetify 3, **eager** causes **`validate()` to run on mount** when combined with the default non-lazy behavior, so users see “required” / rule errors as soon as the dialog opens.
- **Do not** add **`validate-on`** on each field when the form already has **`input lazy`** — inheritance keeps markup short and behavior consistent.
- **`hide-details="auto"`** so rule messages and hints share the details slot cleanly.

### Profile / password forms

- Same pattern: **`validate-on="input lazy"`** on the `v-form` (e.g. change password block in **`ProfileAccountTab.vue`**, **`complete-google-profile.vue`**). Avoid **`input eager`** on password policy fields for the same mount-validation reason.

### Hints

- Use **`hint`** + **`persistent-hint`** when it helps: max length, optional vs required, format (e.g. username characters), uniqueness notes (“unique per tenant”), or short UX guidance (e.g. “leave empty for a root unit”).
- Keep hint copy **short** and in **English** (same global rule as `UI-CONVENTIONS.md`).

### `required` attribute

- Prefer **rules** for required state; avoid redundant **`required`** on inputs if rules already express it (keeps a single source of truth).

---

## 6. In-dialog mutation errors

Use a **dedicated `ref` string** cleared when opening the dialog or starting submit, set in **`catch`** on create/update:

- **Users** (`pages/users/index.vue`): shared **`actionError`** with `v-if` scoped to the open dialog, e.g. `actionError && createDialog`.
- **Units / Tenants**: **`unitFormError`**, **`tenantFormError`** with the same pattern.

**Alert** markup (consistent tone):

```vue
<v-alert
  v-if="entityFormError && createDialog"
  type="error"
  variant="tonal"
  density="compact"
  class="mb-4"
  rounded="md"
>
  {{ entityFormError }}
</v-alert>
```

- Set message to **`error?.message`** from the API when useful, with a **short English fallback** if missing:  
  `entityFormError.value = error?.message || "Failed to create …";`
- **Do not** translate backend messages; pass them through as returned (see `UI-CONVENTIONS.md` §0).

**When to use the error snackbar instead:** actions **outside** a single form dialog (failed list load, restore, impersonation, failed “load for edit”, etc.) keep using **`showErrorSnack`** / **`UI-CONVENTIONS.md` §3b** as today.

---

## 7. Submit handler pattern

```ts
const submitCreate = async () => {
  entityFormError.value = "";
  const form = createEntityFormRef.value;
  if (form) {
    const { valid } = await form.validate();
    if (!valid) return;
  }
  actionLoading.value = true;
  try {
    // mutation …
    createDialog.value = false;
    // success snackbar + reload list
  } catch (error: any) {
    entityFormError.value = error?.message || "Failed to create …";
  } finally {
    actionLoading.value = false;
  }
};
```

- Clear **`entityFormError`** at the **start** of submit (and when **opening** create / **loading** edit) so stale errors disappear.
- **`edit`** uses the same pattern with **`editEntityFormRef`** and **`editDialog`** for the alert `v-if`.

---

## 8. Naming checklist

| Concept | Suggested naming |
|--------|-------------------|
| Create form ref | `create<Entity>FormRef` |
| Edit form ref | `edit<Entity>FormRef` |
| Dialog-scoped mutation error | `<entity>FormError` or page-level `actionError` if one ref serves multiple dialogs **with explicit `v-if` per dialog** |
| Rule arrays | `<field>Rules` (e.g. `tenantCodeRules`) |

---

## 9. Reference files

| Pattern | File |
|--------|------|
| Shared `actionError`, list + dialogs, outlined **`label`** on fields | `pages/users/index.vue` |
| Dedicated `*FormError`, parent autocomplete hints | `pages/units/index.vue` |
| Dedicated `*FormError`, optional varchar fields | `pages/tenants/index.vue` |
| User role scope dialogs | `pages/user-role-scopes/index.vue` |
| `validate-on="input lazy"` on form (password + personal details), **`label`** on fields | `components/pages/profile/ProfileAccountTab.vue` |
| Onboarding form (`validate-on="input lazy"`), **`label`** on fields | `pages/auth/complete-google-profile.vue` |
| Minimal outlined field + **`label`** + **`hide-details="auto"`** | `components/forms/form-elements/custominput/InputRules.vue` |

---

*Last aligned: CRUD dialogs (Users / Units / Tenants / User role scopes) and profile/onboarding use **`validate-on="input lazy"`** on `v-form`, **no per-field `input eager`**, and **field `label` instead of separate `v-label`**. For dialog footers and snackbars, use **`UI-CONVENTIONS.md`**.*
