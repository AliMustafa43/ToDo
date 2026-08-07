# JavaScript Implementation Plan for Todo App

---

## 1. HTML Element → JS Functionality Mapping

| HTML Element (Selector) | Purpose | JS Responsibility |
|-------------------------|---------|-------------------|
| `.TaskNameInput` | Task name text input | Read value on form submit |
| `.ImportanceInput` | Importance dropdown (Low/Medium/High) | Read selected value |
| `.DateInput` | Date picker | Read value (YYYY-MM-DD) |
| `.TimeInput` | Time picker | Read value (HH:MM) |
| `.PlaceInput` | Place text input | Read value |
| `.DescriptionInput` | Description textarea | Read value |
| `.AddButton` | "Add Todo" button | Click → validate & create todo |
| `.SearchInput` | Search box | Input → filter rendered list in real-time |
| `.FilterButton` (All/High/Medium/Low) | Filter tabs | Click → set active filter, re-render |
| `.CardContainer` | Parent of all todo cards | Target for rendering todo cards |
| `.TodoCard` (template) | Single todo display | Clone & populate for each todo |
| `.CompleteButton` | Toggle complete/pending | Click → toggle status, update badge & button text |
| `.DeleteButton` | Remove todo | Click → remove from data & DOM |

---

## 2. Data Structure for Todos

Store as array of objects in memory, persisted to `localStorage`.

```javascript
// Each todo object:
{
  id: "unique-string-or-timestamp",      // unique identifier (Date.now() + random)
  name: "Task name",                     // string, required
  importance: "High" | "Medium" | "Low", // string, required
  date: "2026-07-20",                    // string YYYY-MM-DD (from date input)
  time: "14:30",                         // string HH:MM (from time input)
  place: "Office",                       // string, optional
  description: "Details...",             // string, optional
  status: "pending" | "completed"        // string, default "pending"
}
```

**localStorage key:** `"todos"` (store JSON stringified array)

---

## 3. Required Functions

### Initialization
- `init()` — Entry point. Load todos from localStorage, render, attach event listeners.

### Data / Storage
- `loadTodos()` — Read from localStorage, parse JSON, return array (fallback to `[]`).
- `saveTodos(todos)` — Stringify array, write to localStorage.
- `generateId()` — Return unique string (e.g., `Date.now().toString(36) + Math.random().toString(36).slice(2)`).

### Form Handling
- `getFormData()` — Collect values from all form inputs, return todo object (without id/status).
- `validateForm(data)` — Check required fields (name, importance, date, time). Return `{ valid: true }` or `{ valid: false, message: "..." }`.
- `clearForm()` — Reset all form inputs to empty/default.
- `handleAddTodo()` — Called on Add button click. Validate → create todo with id + status="pending" → push to array → save → render → clear form.

### Rendering
- `renderTodos(todosToRender)` — Clear `.CardContainer`, loop through array, create card for each, append.
- `createTodoCard(todo)` — Build a single card DOM element from template (see HTML structure). Return the element.
  - Set `.TodoName` textContent
  - Set importance badge: class + text (High/Medium/Low)
  - Set `.TodoDescription` textContent
  - Set Date, Time, Place values in `.TodoValue` elements
  - Set status badge: `.PendingBadge` or `.CompletedBadge` with correct text
  - Store `todo.id` on the card element (e.g., `dataset.id`) for later lookup
  - Attach click handlers for Complete/Delete buttons (or rely on delegation)
- `updateTodoCard(todo)` — Find card by `data-id`, update only changed parts (status badge, button text). Optional optimization.

### Filtering & Search
- `getFilteredTodos()` — Apply current filter + search term to master todo array, return filtered array.
- `setFilter(importance)` — Update active filter state ("All" | "High" | "Medium" | "Low"), update `.Active` class on buttons, call render.
- `handleSearch(query)` — Store search term, call render with filtered results.

### Todo Actions
- `toggleComplete(id)` — Find todo by id, flip status, save, re-render (or update single card).
- `deleteTodo(id)` — Find index, splice array, save, re-render.

### Event Helpers
- `bindEvents()` — Attach all event listeners (see Section 4).

---

## 4. Event Handling Strategy

**Use Event Delegation where possible:**

| Event | Target | Strategy |
|-------|--------|----------|
| Form submit / Add click | `.AddButton` | Direct listener on button (single element) |
| Search input | `.SearchInput` | Direct listener (`input` event) |
| Filter buttons | `.FilterButton` | **Delegation** on `.FilterRow` (click → check `e.target.classList.contains("FilterButton")`) |
| Complete button | `.CompleteButton` | **Delegation** on `.CardContainer` (click → find closest `.TodoCard`, read `data-id`) |
| Delete button | `.DeleteButton` | **Delegation** on `.CardContainer` (same as above) |

**Why delegation for cards?** Cards are added/removed dynamically. One listener on the static parent (`.CardContainer`) handles all current and future cards.

**Filter buttons:** Also dynamic-ish (active class toggles), but only 4 buttons. Delegation on `.FilterRow` keeps it clean.

---

## 5. Feature Breakdown

### Add Todo
1. User fills form, clicks Add.
2. `handleAddTodo()` reads inputs, validates.
3. If invalid → show alert or inline error (simple `alert()` is fine).
4. If valid → create todo object with `generateId()`, `status: "pending"`.
5. Push to master array, `saveTodos()`, `renderTodos()`, `clearForm()`.

### Render Todos
1. `renderTodos()` receives array (already filtered/searched).
2. Clear `.CardContainer.innerHTML = ""`.
3. Loop array → `createTodoCard(todo)` → append to container.
4. If array empty → show "No tasks found" message (create a div, append).

### Filter (All / High / Medium / Low)
1. Global variable `currentFilter = "All"` (default).
2. Click filter button → `setFilter(value)`.
3. Update `.Active` class: remove from all, add to clicked.
4. Call `renderTodos(getFilteredTodos())`.

### Search
1. `input` event on `.SearchInput` → `handleSearch(e.target.value.trim().toLowerCase())`.
2. Store `currentSearch` string.
3. Call `renderTodos(getFilteredTodos())`.

### Complete Toggle
1. Delegation click on `.CardContainer`.
2. If target matches `.CompleteButton`:
   - Find closest `.TodoCard`, read `dataset.id`.
   - Call `toggleComplete(id)`.
   - `toggleComplete` finds todo in master array, flips status, saves.
   - Re-render (or update just that card's badge + button text).

### Delete
1. Delegation click on `.CardContainer`.
2. If target matches `.DeleteButton`:
   - Find closest `.TodoCard`, read `dataset.id`.
   - Optional: `confirm("Delete this task?")`.
   - Call `deleteTodo(id)` → splice master array → save → render.

---

## 6. localStorage Persistence

- **Key:** `"todos"`
- **Load:** On `init()`, `JSON.parse(localStorage.getItem("todos")) || []`
- **Save:** After any mutation (add, toggle, delete), `localStorage.setItem("todos", JSON.stringify(todos))`
- **Error handling:** Wrap in `try/catch` (quota exceeded, corrupted data).

---

## 7. Vanilla JS Patterns to Use

- **DOM selection:** `document.querySelector()`, `document.querySelectorAll()`
- **Element creation:** `document.createElement()`, `element.textContent =`, `element.classList.add()`
- **Template approach:** Build card in `createTodoCard()` using `createElement` (not `innerHTML` strings) — safer, no XSS risk.
- **Data attributes:** `card.dataset.id = todo.id` for linking DOM ↔ data.
- **Closest:** `button.closest(".TodoCard")` to find parent card from button.
- **Array methods:** `filter()`, `map()`, `find()`, `findIndex()`, `splice()`, `push()`
- **Event listeners:** `addEventListener("click", handler)`, `addEventListener("input", handler)`
- **Arrow functions** for callbacks.
- **`const`/`let`** only, no `var`.
- **Template literals** for strings.
- **Optional:** `class` for organizing (e.g., `TodoApp` class) — but plain functions + module pattern also fine.

---

## 8. Suggested File Structure (Mental Model)

```
todo.js
├── State
│   ├── todos = []           // master array
│   ├── currentFilter = "All"
│   └── currentSearch = ""
├── DOM References (cached)
│   ├── formInputs, buttons, container
├── init()
├── loadTodos() / saveTodos()
├── generateId()
├── getFormData() / validateForm() / clearForm()
├── handleAddTodo()
├── renderTodos() / createTodoCard()
├── getFilteredTodos() / setFilter() / handleSearch()
├── toggleComplete() / deleteTodo()
└── bindEvents()
```

---

## 9. Implementation Order (Suggested)

1. **State & Storage** — `todos` array, `loadTodos()`, `saveTodos()`, `generateId()`
2. **DOM References** — Cache all selectors at top
3. **Render** — `renderTodos()`, `createTodoCard()` (test with hardcoded data first)
4. **Add Form** — `getFormData()`, `validateForm()`, `clearForm()`, `handleAddTodo()`, wire Add button
5. **Filter** — `setFilter()`, `getFilteredTodos()`, wire filter buttons
6. **Search** — `handleSearch()`, wire search input
7. **Actions** — `toggleComplete()`, `deleteTodo()`, wire via delegation on `.CardContainer`
8. **Init** — `init()` calls load → render → bindEvents
9. **Polish** — Empty state message, confirm on delete, input sanitization (trim)

---

## 10. Edge Cases & Notes

- **Empty description/place** — Allow empty strings, render as empty or "—"
- **Date/Time not required?** HTML shows no `required` attribute. Decide: make required in `validateForm()` or allow optional.
- **Duplicate IDs** — `generateId()` with timestamp + random practically unique.
- **Case-insensitive search** — Compare lowercased name + description + place.
- **Filter + Search combined** — `getFilteredTodos()` applies both: `todos.filter(t => matchesFilter(t) && matchesSearch(t))`
- **Completed button text** — Could change "Complete" → "Undo" when status is completed (optional UX).
- **No frameworks, no build step** — Plain `<script src="todo.js"></script>` at end of body.

---

## 11. Quick Selector Reference (Copy into JS)

```javascript
// Form
const taskNameInput = document.querySelector(".TaskNameInput");
const importanceInput = document.querySelector(".ImportanceInput");
const dateInput = document.querySelector(".DateInput");
const timeInput = document.querySelector(".TimeInput");
const placeInput = document.querySelector(".PlaceInput");
const descriptionInput = document.querySelector(".DescriptionInput");
const addButton = document.querySelector(".AddButton");

// Tasks section
const searchInput = document.querySelector(".SearchInput");
const filterRow = document.querySelector(".FilterRow");
const cardContainer = document.querySelector(".CardContainer");
```

---

*End of Plan. Implement step by step, testing each feature before moving to the next.*