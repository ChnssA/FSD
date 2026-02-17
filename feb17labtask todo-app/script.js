let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
let editingId = null;

// DOM Elements
const taskList = document.getElementById('taskList');
const submitBtn = document.getElementById('submitBtn');
const cancelBtn = document.getElementById('cancelBtn');

// Handle Submission
submitBtn.addEventListener('click', () => {
    const title = document.getElementById('taskTitle').value;
    const description = document.getElementById('taskDesc').value;
    const dueDate = document.getElementById('taskDate').value;
    const category = document.getElementById('taskCategory').value;
    const priority = document.getElementById('taskPriority').value;
    const tags = document.getElementById('taskTags').value;

    if (!title.trim()) return;

    if (editingId) {
        tasks = tasks.map(t => t.id === editingId ? { ...t, title, description, dueDate, category, priority, tags } : t);
        editingId = null;
        submitBtn.innerText = "Add Task";
        cancelBtn.classList.add('hidden');
    } else {
        const newTask = {
            id: Date.now(),
            title, description, dueDate, category, priority, tags,
            completed: false
        };
        tasks.unshift(newTask);
    }

    saveAndRender();
    resetForm();
});

function resetForm() {
    document.querySelectorAll('.form-container input').forEach(i => i.value = '');
    document.getElementById('taskPriority').value = 'Medium';
}

function saveAndRender() {
    localStorage.setItem("tasks", JSON.stringify(tasks));
    render();
}

function render() {
    const search = document.getElementById('searchInput').value.toLowerCase();
    const filter = document.getElementById('statusFilter').value;
    const catFilter = document.getElementById('catFilter').value;

    taskList.innerHTML = '';

    const filtered = tasks.filter(t => {
        const matchesSearch = t.title.toLowerCase().includes(search);
        const matchesCat = catFilter === 'all' || t.category === catFilter;
        
        let matchesStatus = true;
        if (filter === 'completed') matchesStatus = t.completed;
        if (filter === 'incomplete') matchesStatus = !t.completed;
        if (filter === 'today') matchesStatus = t.dueDate === new Date().toISOString().split('T')[0];
        
        return matchesSearch && matchesCat && matchesStatus;
    });

    filtered.forEach(task => {
        const div = document.createElement('div');
        div.className = 'glass-card task-card';
        div.innerHTML = `
            <div>
                <h2 class="${task.completed ? 'completed' : ''}">${task.title}</h2>
                <p style="color: var(--text-muted); font-size: 0.9rem;">${task.description}</p>
                <div style="font-size: 0.75rem; color: #94a3b8; margin-top: 8px;">
                    Due: ${task.dueDate || 'None'} | Priority: ${task.priority}
                </div>
            </div>
            <div>
                <button class="btn-sm secondary-btn" onclick="toggleTask(${task.id})">✓</button>
                <button class="btn-sm secondary-btn" onclick="startEdit(${task.id})">Edit</button>
                <button class="btn-sm delete-btn" onclick="deleteTask(${task.id})">✕</button>
            </div>
        `;
        taskList.appendChild(div);
    });
}

// Global functions for buttons
window.toggleTask = (id) => {
    tasks = tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t);
    saveAndRender();
};

window.deleteTask = (id) => {
    tasks = tasks.filter(t => t.id !== id);
    saveAndRender();
};

window.startEdit = (id) => {
    const task = tasks.find(t => t.id === id);
    document.getElementById('taskTitle').value = task.title;
    document.getElementById('taskDesc').value = task.description;
    document.getElementById('taskDate').value = task.dueDate;
    document.getElementById('taskCategory').value = task.category;
    document.getElementById('taskPriority').value = task.priority;
    
    editingId = id;
    submitBtn.innerText = "Update Task";
    cancelBtn.classList.remove('hidden');
};

// Event Listeners for Filters
document.getElementById('searchInput').addEventListener('input', render);
document.getElementById('statusFilter').addEventListener('change', render);
document.getElementById('catFilter').addEventListener('change', render);

// Initial Render
render();