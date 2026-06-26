// State Management Engine
let tasks = JSON.parse(localStorage.getItem('kanban_tasks')) || [
    { id: 't1', title: 'Research competitors', desc: 'Analyze pricing models and user experiences.', status: 'backlog', priority: 'low' },
    { id: 't2', title: 'Refactor Auth middleware', desc: 'Migrate legacy token checks into integrated edge cookies.', status: 'todo', priority: 'high' },
    { id: 't3', title: 'Build Landing layouts', desc: 'Review Tailwind designs with cross-device aspect ratio breakpoints.', status: 'progress', priority: 'medium' }
];

// Document Object Selectors
const modal = document.getElementById('taskModal');
const openModalBtn = document.getElementById('openModalBtn');
const closeModalBtn = document.getElementById('closeModalBtn');
const taskForm = document.getElementById('taskForm');
const columns = document.querySelectorAll('.kanban-column');

// Global initializations
document.addEventListener('DOMContentLoaded', () => {
    renderTasks();
    initDragAndDrop();
    
    // Modal controls listeners
    openModalBtn.addEventListener('click', () => modal.classList.remove('hidden'));
    closeModalBtn.addEventListener('click', () => modal.classList.add('hidden'));
    taskForm.addEventListener('submit', handleAddTask);
});

// Sync data structures directly down to browser Storage layers
function saveToLocalStorage() {
    localStorage.setItem('kanban_tasks', JSON.stringify(tasks));
}

// Map Priorities to clean styling chips
const priorityConfig = {
    low: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', label: 'Low' },
    medium: { bg: 'bg-amber-500/10', text: 'text-amber-400', label: 'Medium' },
    high: { bg: 'bg-rose-500/10', text: 'text-rose-400', label: 'High' }
};

// Orchestrate DOM population across columns
function renderTasks() {
    // Clear all target DOM contents first
    columns.forEach(col => col.innerHTML = '');
    
    const counters = { backlog: 0, todo: 0, progress: 0, done: 0 };

    tasks.forEach(task => {
        const pChip = priorityConfig[task.priority] || priorityConfig.medium;
        counters[task.status]++;

        const card = document.createElement('div');
        card.id = task.id;
        card.className = 'bg-slate-950 border border-slate-800/80 p-4 rounded-lg hover:border-slate-700 shadow-md cursor-grab active:cursor-grabbing group transition duration-150 flex flex-col gap-2 relative';
        card.setAttribute('draggable', 'true');
        
        card.innerHTML = `
            <div class="flex justify-between items-start gap-2">
                <span class="text-xs font-semibold px-2 py-0.5 rounded ${pChip.bg} ${pChip.text}">
                    ${pChip.label}
                </span>
                <button onclick="deleteTask('${task.id}')" class="text-slate-500 hover:text-rose-400 text-xs transition duration-150 p-0.5 opacity-0 group-hover:opacity-100 focus:opacity-100 cursor-pointer">
                    ✕
                </button>
            </div>
            <h4 class="font-semibold text-sm text-slate-100 tracking-wide break-words">${task.title}</h4>
            ${task.desc ? `<p class="text-xs text-slate-400 line-clamp-3 break-words">${task.desc}</p>` : ''}
        `;

        // Attach dragging listener definitions explicitly
        card.addEventListener('dragstart', (e) => {
            e.dataTransfer.setData('text/plain', task.id);
            card.classList.add('opacity-40');
        });

        card.addEventListener('dragend', () => {
            card.classList.remove('opacity-40');
        });

        document.getElementById(task.status).appendChild(card);
    });

    // Update column counters dynamically
    document.getElementById('count-backlog').innerText = counters.backlog;
    document.getElementById('count-todo').innerText = counters.todo;
    document.getElementById('count-progress').innerText = counters.progress;
    document.getElementById('count-done').innerText = counters.done;
}

// Bind active Drop targets for column sections
function initDragAndDrop() {
    columns.forEach(column => {
        column.addEventListener('dragover', (e) => {
            e.preventDefault(); // Required to allow drop operations
            column.classList.add('bg-slate-800/20', 'border-dashed');
        });

        column.addEventListener('dragleave', () => {
            column.classList.remove('bg-slate-800/20', 'border-dashed');
        });

        column.addEventListener('drop', (e) => {
            e.preventDefault();
            column.classList.remove('bg-slate-800/20', 'border-dashed');
            
            const taskId = e.dataTransfer.getData('text/plain');
            const targetStatus = column.id;
            
            // Mutate data status pointer reference
            const targetTask = tasks.find(t => t.id === taskId);
            if (targetTask && targetTask.status !== targetStatus) {
                targetTask.status = targetStatus;
                saveToLocalStorage();
                renderTasks();
            }
        });
    });
}

// Add New Form entry submissions
function handleAddTask(e) {
    e.preventDefault();
    
    const titleInput = document.getElementById('taskTitle');
    const descInput = document.getElementById('taskDesc');
    const priorityInput = document.getElementById('taskPriority');

    const newTask = {
        id: 'task_' + Date.now(),
        title: titleInput.value.trim(),
        desc: descInput.value.trim(),
        status: 'todo', // Default entry pipeline column
        priority: priorityInput.value
    };

    tasks.push(newTask);
    saveToLocalStorage();
    renderTasks();

    // Reset components & conceal structural views
    taskForm.reset();
    modal.classList.add('hidden');
}

// Remove an entry directly out of runtime arrays
window.deleteTask = function(id) {
    tasks = tasks.filter(task => task.id !== id);
    saveToLocalStorage();
    renderTasks();
};