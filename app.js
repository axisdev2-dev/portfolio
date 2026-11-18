const STORAGE_KEY = "taskmate-tasks-v1";
const form = document.querySelector("#task-form");
const taskInput = document.querySelector("#task-input");
const dueInput = document.querySelector("#due-date");
const list = document.querySelector("#task-list");
const empty = document.querySelector("#empty-state");
const filters = document.querySelector(".filters");
let activeFilter = "all";
let tasks = loadTasks();

function loadTasks() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    return Array.isArray(saved) ? saved.filter(task => task && typeof task.title === "string") : [];
  } catch {
    return [];
  }
}
function saveTasks() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}
function dateLabel(value) {
  if (!value) return "";
  const date = new Date(value + "T00:00:00");
  return new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric", year: "numeric" }).format(date);
}
function render() {
  const completed = tasks.filter(task => task.done).length;
  const active = tasks.length - completed;
  document.querySelector("#total-count").textContent = tasks.length;
  document.querySelector("#all-count").textContent = tasks.length;
  document.querySelector("#active-count").textContent = active;
  document.querySelector("#done-count").textContent = completed;
  document.querySelector("#status-text").textContent = tasks.length ? (active ? active + (active === 1 ? " task left to do." : " tasks left to do.") : "Everything on your list is done. Nice work!") : "Start small. You’ve got this.";
  list.replaceChildren();
  const shown = tasks.filter(task => activeFilter === "all" || (activeFilter === "active" ? !task.done : task.done));
  for (const task of shown) {
    const row = document.createElement("li");
    row.className = "task-row" + (task.done ? " done" : "");
    const check = document.createElement("button");
    check.className = "check-button";
    check.type = "button";
    check.dataset.action = "toggle";
    check.dataset.id = task.id;
    check.setAttribute("aria-label", task.done ? "Mark task as not done" : "Mark task as done");
    check.textContent = task.done ? "✓" : "";
    const content = document.createElement("div");
    content.className = "task-content";
    const title = document.createElement("span");
    title.className = "task-title";
    title.textContent = task.title;
    content.append(title);
    if (task.dueDate) {
      const due = document.createElement("span");
      due.className = "due";
      due.textContent = "Due " + dateLabel(task.dueDate);
      if (!task.done && task.dueDate < new Date().toISOString().slice(0, 10)) due.classList.add("overdue");
      content.append(due);
    }
    const remove = document.createElement("button");
    remove.className = "delete-button";
    remove.type = "button";
    remove.dataset.action = "delete";
    remove.dataset.id = task.id;
    remove.setAttribute("aria-label", "Delete " + task.title);
    remove.textContent = "×";
    row.append(check, content, remove);
    list.append(row);
  }
  empty.hidden = shown.length !== 0;
  document.querySelector("#clear-done").disabled = completed === 0;
}
form.addEventListener("submit", event => {
  event.preventDefault();
  const title = taskInput.value.trim();
  if (!title) { taskInput.focus(); return; }
  tasks.unshift({ id: Date.now().toString(36) + Math.random().toString(36).slice(2, 7), title, dueDate: dueInput.value, done: false });
  saveTasks();
  form.reset();
  taskInput.focus();
  render();
});
list.addEventListener("click", event => {
  const button = event.target.closest("button[data-action]");
  if (!button) return;
  const { action, id } = button.dataset;
  if (action === "toggle") tasks = tasks.map(task => task.id === id ? { ...task, done: !task.done } : task);
  if (action === "delete") tasks = tasks.filter(task => task.id !== id);
  saveTasks();
  render();
});
filters.addEventListener("click", event => {
  const button = event.target.closest("button[data-filter]");
  if (!button) return;
  activeFilter = button.dataset.filter;
  filters.querySelectorAll("button").forEach(item => {
    const selected = item === button;
    item.classList.toggle("active", selected);
    item.setAttribute("aria-pressed", String(selected));
  });
  render();
});
document.querySelector("#clear-done").addEventListener("click", () => {
  tasks = tasks.filter(task => !task.done);
  saveTasks();
  render();
});
render();