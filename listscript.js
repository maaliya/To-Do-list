const form = document.getElementById("task-form");
const input = document.getElementById("int");
const prioritySelect = document.getElementById("priority-select");
const colorSelect = document.getElementById("color-select");
const list = document.getElementById("list-container");
const emptyState = document.getElementById("empty-state");
const totalCount = document.getElementById("total-count");
const completeCount = document.getElementById("complete-count");
const pendingCount = document.getElementById("pending-count");
const clearCompletedButton = document.getElementById("clear-completed");
const filterButtons = document.querySelectorAll(".filter-btn");
const storageKey = "todo-list-tasks";

const colorOptions = ["mint", "sun", "rose", "sky", "grape", "lime"];
let currentFilter = "all";
let tasks = loadTasks();

function createTask(text, completed = false, priority = "normal", color = getNextColor()) {
    return {
        id: Date.now() + Math.random(),
        text,
        completed,
        priority,
        color
    };
}

function getNextColor() {
    return colorOptions[tasks.length % colorOptions.length];
}

function normalizeTask(task, index) {
    return {
        id: task.id || Date.now() + index,
        text: typeof task.text === "string" ? task.text : "Untitled task",
        completed: Boolean(task.completed),
        priority: ["high", "normal", "low"].includes(task.priority) ? task.priority : "normal",
        color: colorOptions.includes(task.color) ? task.color : colorOptions[index % colorOptions.length]
    };
}

function loadTasks() {
    const savedTasks = localStorage.getItem(storageKey);

    if (!savedTasks) {
        return [
            createTask("Plan today's top priority", false, "high", "rose"),
            createTask("Review completed tasks", true, "normal", "sky"),
            createTask("Take a short study break", false, "low", "lime")
        ];
    }

    try {
        const parsedTasks = JSON.parse(savedTasks);
        return Array.isArray(parsedTasks) ? parsedTasks.map(normalizeTask) : [];
    } catch {
        return [];
    }
}

function saveTasks() {
    try {
        localStorage.setItem(storageKey, JSON.stringify(tasks));
    } catch {
        return;
    }
}

function getVisibleTasks() {
    if (currentFilter === "pending") {
        return tasks.filter((task) => !task.completed);
    }

    if (currentFilter === "completed") {
        return tasks.filter((task) => task.completed);
    }

    return tasks;
}

function updateStats() {
    const completed = tasks.filter((task) => task.completed).length;
    const pending = tasks.length - completed;
    const totalLabel = tasks.length === 1 ? "task" : "tasks";
    const visibleTasks = getVisibleTasks();

    totalCount.textContent = `${tasks.length} ${totalLabel}`;
    completeCount.textContent = `${completed} completed`;
    pendingCount.textContent = `${pending} pending`;
    clearCompletedButton.disabled = completed === 0;
    emptyState.classList.toggle("show", visibleTasks.length === 0);

    if (tasks.length === 0) {
        emptyState.textContent = "No tasks yet. Add one above to get started.";
    } else {
        emptyState.textContent = `No ${currentFilter} tasks to show.`;
    }
}

function renderTasks() {
    const visibleTasks = getVisibleTasks();
    list.innerHTML = "";

    visibleTasks.forEach((task) => {
        const item = document.createElement("li");
        item.className = `task-item ${task.color} ${task.priority}`;
        item.classList.toggle("completed", task.completed);

        const checkbox = document.createElement("input");
        checkbox.className = "task-checkbox";
        checkbox.type = "checkbox";
        checkbox.checked = task.completed;
        checkbox.setAttribute("aria-label", `Mark ${task.text} as complete`);
        checkbox.addEventListener("change", () => {
            task.completed = checkbox.checked;
            saveTasks();
            renderTasks();
        });

        const text = document.createElement("span");
        text.className = "task-text";
        text.textContent = task.text;

        const meta = document.createElement("span");
        meta.className = "task-meta";
        meta.textContent = `${task.priority} priority`;

        const deleteButton = document.createElement("button");
        deleteButton.className = "delete-btn";
        deleteButton.type = "button";
        deleteButton.textContent = "Delete";
        deleteButton.addEventListener("click", () => {
            tasks = tasks.filter((savedTask) => savedTask.id !== task.id);
            saveTasks();
            renderTasks();
        });

        item.append(checkbox, text, meta, deleteButton);
        list.append(item);
    });

    updateStats();
}

function addTask(text) {
    const trimmedText = text.trim();

    if (!trimmedText) {
        input.focus();
        return;
    }

    tasks.unshift(createTask(trimmedText, false, prioritySelect.value, colorSelect.value));
    input.value = "";
    prioritySelect.value = "normal";
    colorSelect.value = getNextColor();
    input.focus();
    saveTasks();
    renderTasks();
}

form.addEventListener("submit", (event) => {
    event.preventDefault();
    addTask(input.value);
});

filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
        currentFilter = button.dataset.filter;
        filterButtons.forEach((filterButton) => filterButton.classList.remove("active"));
        button.classList.add("active");
        renderTasks();
    });
});

clearCompletedButton.addEventListener("click", () => {
    tasks = tasks.filter((task) => !task.completed);
    saveTasks();
    renderTasks();
});

colorSelect.value = getNextColor();
renderTasks();
