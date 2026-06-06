const taskInput = document.getElementById("taskInput");
const dueDateInput = document.getElementById("dueDateInput");
const addBtn = document.getElementById("addBtn");
const taskList = document.getElementById("taskList");
const emptyMsg = document.getElementById("emptyMsg");

const modalOverlay = document.getElementById("modalOverlay");
const editTaskInput = document.getElementById("editTaskInput");
const editDueDateInput = document.getElementById("editDueDateInput");
const saveEditBtn = document.getElementById("saveEditBtn");
const cancelEditBtn = document.getElementById("cancelEditBtn");

let currentEditIndex = null;

// ── Local Storage ──────────────────────────────────────────
function loadTasks() {
    return JSON.parse(localStorage.getItem("tasks") || "[]");
}

function saveTasks(tasks) {
    localStorage.setItem("tasks", JSON.stringify(tasks));
}

// ── Helpers ────────────────────────────────────────────────
function formatDate(dateStr) {
    if (!dateStr) return null;
    const [year, month, day] = dateStr.split("-");
    return `${day}/${month}/${year}`;
}

function isOverdue(dateStr) {
    if (!dateStr) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return new Date(dateStr) < today;
}

function updateEmptyMsg() {
    emptyMsg.style.display = taskList.children.length === 0 ? "block" : "none";
}

// ── Render ─────────────────────────────────────────────────
function renderTasks() {
    taskList.innerHTML = "";
    const tasks = loadTasks();
    tasks.forEach((task, index) => createTaskElement(task, index));
    updateEmptyMsg();
}

function createTaskElement(task, index) {
    const li = document.createElement("li");
    if (task.completed) li.classList.add("completed");

    // Checkbox
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.className = "task-checkbox";
    checkbox.checked = task.completed;
    checkbox.addEventListener("change", () => toggleComplete(index));

    // Task info
    const taskInfo = document.createElement("div");
    taskInfo.className = "task-info";

    const span = document.createElement("span");
    span.className = "task-text";
    span.textContent = task.text;
    span.title = task.text;
    span.addEventListener("click", () => toggleComplete(index));

    const dueDateSpan = document.createElement("span");
    dueDateSpan.className = "due-date" + (task.dueDate && isOverdue(task.dueDate) ? " overdue" : "");
    if (task.dueDate) {
        dueDateSpan.textContent = `Due: ${formatDate(task.dueDate)}` + (isOverdue(task.dueDate) ? " ⚠ Overdue" : "");
    }

    taskInfo.appendChild(span);
    taskInfo.appendChild(dueDateSpan);

    // Buttons
    const btnGroup = document.createElement("div");
    btnGroup.className = "btn-group";

    const editBtn = document.createElement("button");
    editBtn.textContent = "Edit";
    editBtn.className = "edit-btn";
    editBtn.addEventListener("click", () => openEditModal(index));

    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "Delete";
    deleteBtn.className = "delete-btn";
    deleteBtn.addEventListener("click", () => deleteTask(index));

    btnGroup.appendChild(editBtn);
    btnGroup.appendChild(deleteBtn);

    li.appendChild(checkbox);
    li.appendChild(taskInfo);
    li.appendChild(btnGroup);
    taskList.appendChild(li);
}

// ── Actions ────────────────────────────────────────────────
function addTask() {
    const text = taskInput.value.trim();
    if (!text) { alert("Please enter a task"); return; }

    const tasks = loadTasks();
    tasks.push({ text, dueDate: dueDateInput.value, completed: false });
    saveTasks(tasks);
    renderTasks();

    taskInput.value = "";
    dueDateInput.value = "";
    taskInput.focus();
}

function toggleComplete(index) {
    const tasks = loadTasks();
    tasks[index].completed = !tasks[index].completed;
    saveTasks(tasks);
    renderTasks();
}

function deleteTask(index) {
    const tasks = loadTasks();
    tasks.splice(index, 1);
    saveTasks(tasks);
    renderTasks();
}

function openEditModal(index) {
    const tasks = loadTasks();
    currentEditIndex = index;
    editTaskInput.value = tasks[index].text;
    editDueDateInput.value = tasks[index].dueDate || "";
    modalOverlay.classList.add("active");
    editTaskInput.focus();
}

function closeModal() {
    modalOverlay.classList.remove("active");
    currentEditIndex = null;
}

saveEditBtn.addEventListener("click", () => {
    if (currentEditIndex === null) return;
    const newText = editTaskInput.value.trim();
    if (!newText) { alert("Task name cannot be empty"); return; }

    const tasks = loadTasks();
    tasks[currentEditIndex].text = newText;
    tasks[currentEditIndex].dueDate = editDueDateInput.value;
    saveTasks(tasks);
    renderTasks();
    closeModal();
});

cancelEditBtn.addEventListener("click", closeModal);
modalOverlay.addEventListener("click", (e) => { if (e.target === modalOverlay) closeModal(); });

// Enter key support
taskInput.addEventListener("keydown", (e) => { if (e.key === "Enter") addTask(); });
editTaskInput.addEventListener("keydown", (e) => { if (e.key === "Enter") saveEditBtn.click(); });

addBtn.addEventListener("click", addTask);

// ── Init ───────────────────────────────────────────────────
renderTasks();
