// TASKER - To-Do List Application

class TodoApp {
    constructor() {
        this.tasks = this.loadTasks();
        this.currentFilter = 'all';
        this.confirmAction = null;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.render();
    }

    setupEventListeners() {
        const taskInput = document.getElementById('taskInput');
        const addBtn = document.getElementById('addBtn');
        
        taskInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addTask();
        });
        addBtn.addEventListener('click', () => this.addTask());

        document.querySelectorAll('.btn-filter').forEach(btn => {
            btn.addEventListener('click', (e) => this.setFilter(e.target.dataset.filter));
        });

        document.getElementById('clearCompletedBtn').addEventListener('click', () => this.confirmClearCompleted());
        document.getElementById('clearAllBtn').addEventListener('click', () => this.confirmClearAll());

        document.getElementById('confirmBtn').addEventListener('click', () => this.executeConfirmedAction());
        document.getElementById('cancelBtn').addEventListener('click', () => this.closeModal());
    }

    addTask() {
        const input = document.getElementById('taskInput');
        const text = input.value.trim();

        if (text.length === 0) {
            input.focus();
            return;
        }

        if (text.length > 200) {
            alert('Task must be 200 characters or less');
            return;
        }

        const task = {
            id: Date.now(),
            text: text,
            completed: false,
            createdAt: new Date().toLocaleString(),
            priority: 'medium'
        };

        this.tasks.unshift(task);
        this.saveTasks();
        input.value = '';
        input.focus();
        this.render();
    }

    deleteTask(id) {
        this.tasks = this.tasks.filter(task => task.id !== id);
        this.saveTasks();
        this.render();
    }

    toggleTask(id) {
        const task = this.tasks.find(t => t.id === id);
        if (task) {
            task.completed = !task.completed;
            this.saveTasks();
            this.render();
        }
    }

    setFilter(filter) {
        this.currentFilter = filter;
        document.querySelectorAll('.btn-filter').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.filter === filter);
        });
        this.render();
    }

    getFilteredTasks() {
        switch (this.currentFilter) {
            case 'active':
                return this.tasks.filter(t => !t.completed);
            case 'completed':
                return this.tasks.filter(t => t.completed);
            default:
                return this.tasks;
        }
    }

    render() {
        this.renderTasks();
        this.updateStats();
    }

    renderTasks() {
        const tasksList = document.getElementById('tasksList');
        const emptyState = document.getElementById('emptyState');
        const filteredTasks = this.getFilteredTasks();

        tasksList.innerHTML = '';

        if (filteredTasks.length === 0) {
            emptyState.classList.add('active');
            return;
        }

        emptyState.classList.remove('active');

        filteredTasks.forEach(task => {
            const li = document.createElement('li');
            li.className = `task-item ${task.completed ? 'completed' : ''}`;
            li.dataset.id = task.id;

            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.className = 'task-checkbox';
            checkbox.checked = task.completed;
            checkbox.addEventListener('change', () => this.toggleTask(task.id));

            const content = document.createElement('div');
            content.className = 'task-content';

            const text = document.createElement('div');
            text.className = 'task-text';
            text.textContent = task.text;

            const meta = document.createElement('div');
            meta.className = 'task-meta';
            meta.innerHTML = `Created: ${task.createdAt}<span class="task-priority priority-${task.priority}">${task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}</span>`;

            content.appendChild(text);
            content.appendChild(meta);

            const actions = document.createElement('div');
            actions.className = 'task-actions';

            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'btn-task-delete';
            deleteBtn.textContent = 'Delete';
            deleteBtn.addEventListener('click', () => this.deleteTask(task.id));

            actions.appendChild(deleteBtn);

            li.appendChild(checkbox);
            li.appendChild(content);
            li.appendChild(actions);

            tasksList.appendChild(li);
        });
    }

    updateStats() {
        const activeTasks = this.tasks.filter(t => !t.completed).length;
        const completedTasks = this.tasks.filter(t => t.completed).length;

        document.getElementById('activeCount').textContent = activeTasks;
        document.getElementById('completedCount').textContent = completedTasks;
    }

    confirmClearCompleted() {
        const completedCount = this.tasks.filter(t => t.completed).length;
        if (completedCount === 0) {
            alert('No completed tasks to clear');
            return;
        }

        this.confirmAction = () => {
            this.tasks = this.tasks.filter(t => !t.completed);
            this.saveTasks();
            this.render();
        };

        this.showModal(
            'Clear Completed Tasks',
            `Are you sure? This will remove ${completedCount} completed task(s).`
        );
    }

    confirmClearAll() {
        if (this.tasks.length === 0) {
            alert('No tasks to clear');
            return;
        }

        this.confirmAction = () => {
            this.tasks = [];
            this.saveTasks();
            this.render();
        };

        this.showModal(
            'Clear All Tasks',
            `Are you sure? This will remove all ${this.tasks.length} task(s). This action cannot be undone.`
        );
    }

    showModal(title, message) {
        document.getElementById('confirmTitle').textContent = title;
        document.getElementById('confirmMessage').textContent = message;
        document.getElementById('confirmModal').style.display = 'block';
    }

    closeModal() {
        document.getElementById('confirmModal').style.display = 'none';
        this.confirmAction = null;
    }

    executeConfirmedAction() {
        if (this.confirmAction) {
            this.confirmAction();
        }
        this.closeModal();
    }

    saveTasks() {
        localStorage.setItem('tasker_tasks', JSON.stringify(this.tasks));
    }

    loadTasks() {
        const stored = localStorage.getItem('tasker_tasks');
        return stored ? JSON.parse(stored) : this.getSampleTasks();
    }

    getSampleTasks() {
        return [
            {
                id: 1,
                text: 'Welcome to Tasker! Click the checkbox to mark tasks as complete.',
                completed: false,
                createdAt: new Date().toLocaleString(),
                priority: 'high'
            },
            {
                id: 2,
                text: 'Use the filter buttons to view All, Active, or Completed tasks.',
                completed: false,
                createdAt: new Date().toLocaleString(),
                priority: 'medium'
            },
            {
                id: 3,
                text: 'All tasks are automatically saved to your browser.',
                completed: true,
                createdAt: new Date().toLocaleString(),
                priority: 'low'
            }
        ];
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new TodoApp();
});