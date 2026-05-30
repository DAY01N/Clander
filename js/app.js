// ============================================
// CLANDER - Calendar Application
// ============================================

class Calendar {
    constructor() {
        this.currentDate = new Date();
        this.selectedDate = new Date();
        this.currentView = 'month'; // 'month' or 'week'
        this.events = this.loadEvents();
        this.editingEventId = null;
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.render();
    }

    setupEventListeners() {
        // Navigation
        document.getElementById('prevBtn').addEventListener('click', () => this.previousMonth());
        document.getElementById('nextBtn').addEventListener('click', () => this.nextMonth());
        document.getElementById('todayBtn').addEventListener('click', () => this.goToToday());

        // View toggle
        document.getElementById('monthViewBtn').addEventListener('click', () => this.switchView('month'));
        document.getElementById('weekViewBtn').addEventListener('click', () => this.switchView('week'));

        // Modal
        const modal = document.getElementById('eventModal');
        const closeBtn = document.querySelector('.close');
        const form = document.getElementById('eventForm');
        const cancelBtn = document.getElementById('cancelBtn');
        const deleteBtn = document.getElementById('deleteEventBtn');

        closeBtn.addEventListener('click', () => this.closeModal());
        cancelBtn.addEventListener('click', () => this.closeModal());
        form.addEventListener('submit', (e) => this.saveEvent(e));
        deleteBtn.addEventListener('click', () => this.deleteEvent());
        window.addEventListener('click', (e) => {
            if (e.target === modal) this.closeModal();
        });
    }

    render() {
        this.updateMonthYear();
        if (this.currentView === 'month') {
            this.renderMonthView();
        } else {
            this.renderWeekView();
        }
        this.renderEventsList();
    }

    updateMonthYear() {
        const options = { month: 'long', year: 'numeric' };
        const dateStr = this.currentDate.toLocaleDateString('en-US', options);
        document.getElementById('monthYear').textContent = dateStr;
    }

    renderMonthView() {
        const calendar = document.getElementById('calendar');
        calendar.innerHTML = '';

        // Day headers
        const dayHeaders = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        dayHeaders.forEach(day => {
            const header = document.createElement('div');
            header.className = 'day-header';
            header.textContent = day;
            calendar.appendChild(header);
        });

        // Get first day of month
        const year = this.currentDate.getFullYear();
        const month = this.currentDate.getMonth();
        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const daysInPrevMonth = new Date(year, month, 0).getDate();

        // Previous month days
        for (let i = firstDay - 1; i >= 0; i--) {
            const dayNum = daysInPrevMonth - i;
            this.createDayCell(calendar, dayNum, 'other-month', new Date(year, month - 1, dayNum));
        }

        // Current month days
        for (let day = 1; day <= daysInMonth; day++) {
            const isToday = this.isToday(new Date(year, month, day));
            const className = isToday ? 'today' : '';
            this.createDayCell(calendar, day, className, new Date(year, month, day));
        }

        // Next month days
        const remainingDays = 42 - (firstDay + daysInMonth);
        for (let day = 1; day <= remainingDays; day++) {
            this.createDayCell(calendar, day, 'other-month', new Date(year, month + 1, day));
        }
    }

    createDayCell(container, day, className, date) {
        const cell = document.createElement('div');
        cell.className = `day-cell ${className}`;

        const dayNumber = document.createElement('div');
        dayNumber.className = 'day-number';
        dayNumber.textContent = day;
        cell.appendChild(dayNumber);

        // Add events for this day
        const dayEvents = this.getEventsForDate(date);
        dayEvents.forEach(event => {
            const eventEl = document.createElement('div');
            eventEl.className = 'event-item';
            eventEl.textContent = event.title;
            eventEl.addEventListener('click', (e) => {
                e.stopPropagation();
                this.editEventModal(event, date);
            });
            cell.appendChild(eventEl);
        });

        cell.addEventListener('click', () => this.newEventModal(date));
        container.appendChild(cell);
    }

    renderWeekView() {
        const calendar = document.getElementById('calendar');
        calendar.innerHTML = '';
        calendar.style.gridTemplateColumns = 'repeat(7, 1fr)';

        const weekStart = this.getWeekStart(this.currentDate);
        const dayHeaders = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

        dayHeaders.forEach(day => {
            const header = document.createElement('div');
            header.className = 'day-header';
            header.textContent = day;
            calendar.appendChild(header);
        });

        for (let i = 0; i < 7; i++) {
            const date = new Date(weekStart);
            date.setDate(date.getDate() + i);
            const isToday = this.isToday(date);
            const className = isToday ? 'today' : '';
            this.createDayCell(calendar, date.getDate(), className, date);
        }
    }

    getWeekStart(date) {
        const d = new Date(date);
        const day = d.getDay();
        const diff = d.getDate() - day;
        return new Date(d.setDate(diff));
    }

    switchView(view) {
        this.currentView = view;
        document.querySelectorAll('.btn-view').forEach(btn => btn.classList.remove('active'));
        if (view === 'month') {
            document.getElementById('monthViewBtn').classList.add('active');
        } else {
            document.getElementById('weekViewBtn').classList.add('active');
        }
        this.render();
    }

    previousMonth() {
        this.currentDate.setMonth(this.currentDate.getMonth() - 1);
        this.render();
    }

    nextMonth() {
        this.currentDate.setMonth(this.currentDate.getMonth() + 1);
        this.render();
    }

    goToToday() {
        this.currentDate = new Date();
        this.render();
    }

    isToday(date) {
        const today = new Date();
        return date.getDate() === today.getDate() &&
               date.getMonth() === today.getMonth() &&
               date.getFullYear() === today.getFullYear();
    }

    getEventsForDate(date) {
        const dateStr = this.formatDate(date);
        return this.events.filter(event => event.date === dateStr);
    }

    formatDate(date) {
        return date.toISOString().split('T')[0];
    }

    newEventModal(date) {
        this.editingEventId = null;
        document.getElementById('modalTitle').textContent = 'Add Event';
        document.getElementById('eventForm').reset();
        document.getElementById('eventDate').value = this.formatDate(date);
        document.getElementById('deleteEventBtn').style.display = 'none';
        document.getElementById('eventModal').style.display = 'block';
    }

    editEventModal(event, date) {
        this.editingEventId = event.id;
        document.getElementById('modalTitle').textContent = 'Edit Event';
        document.getElementById('eventDate').value = event.date;
        document.getElementById('eventTitle').value = event.title;
        document.getElementById('eventTime').value = event.time || '';
        document.getElementById('eventDescription').value = event.description || '';
        document.getElementById('deleteEventBtn').style.display = 'block';
        document.getElementById('eventModal').style.display = 'block';
    }

    closeModal() {
        document.getElementById('eventModal').style.display = 'none';
        this.editingEventId = null;
    }

    saveEvent(e) {
        e.preventDefault();

        const date = document.getElementById('eventDate').value;
        const title = document.getElementById('eventTitle').value;
        const time = document.getElementById('eventTime').value;
        const description = document.getElementById('eventDescription').value;

        if (this.editingEventId) {
            // Edit existing event
            const event = this.events.find(e => e.id === this.editingEventId);
            if (event) {
                event.date = date;
                event.title = title;
                event.time = time;
                event.description = description;
            }
        } else {
            // Create new event
            const event = {
                id: Date.now(),
                date,
                title,
                time,
                description
            };
            this.events.push(event);
        }

        this.saveEvents();
        this.closeModal();
        this.render();
    }

    deleteEvent() {
        if (this.editingEventId) {
            this.events = this.events.filter(e => e.id !== this.editingEventId);
            this.saveEvents();
            this.closeModal();
            this.render();
        }
    }

    renderEventsList() {
        const eventsList = document.getElementById('eventsList');
        eventsList.innerHTML = '';

        // Get upcoming events (next 7 days)
        const upcoming = this.getUpcomingEvents();

        if (upcoming.length === 0) {
            eventsList.innerHTML = '<p style="color: #999; text-align: center; padding: 20px;">No upcoming events</p>';
            return;
        }

        upcoming.forEach(event => {
            const card = document.createElement('div');
            card.className = 'event-card';
            card.innerHTML = `
                <div class="event-card-title">${event.title}</div>
                <div class="event-card-date">${new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</div>
                ${event.time ? `<div class="event-card-time">${event.time}</div>` : ''}
            `;
            card.addEventListener('click', () => this.editEventModal(event, new Date(event.date)));
            eventsList.appendChild(card);
        });
    }

    getUpcomingEvents() {
        const today = new Date();
        const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
        return this.events
            .filter(e => new Date(e.date) >= today && new Date(e.date) <= nextWeek)
            .sort((a, b) => new Date(a.date) - new Date(b.date));
    }

    saveEvents() {
        localStorage.setItem('clander_events', JSON.stringify(this.events));
    }

    loadEvents() {
        const stored = localStorage.getItem('clander_events');
        return stored ? JSON.parse(stored) : this.getSampleEvents();
    }

    getSampleEvents() {
        const today = new Date();
        return [
            {
                id: 1,
                date: this.formatDate(today),
                title: 'Welcome to Clander!',
                time: '09:00',
                description: 'This is your first event. Click to edit or delete it.'
            },
            {
                id: 2,
                date: this.formatDate(new Date(today.getTime() + 1 * 24 * 60 * 60 * 1000)),
                title: 'Team Meeting',
                time: '14:00',
                description: 'Weekly sync with the team'
            }
        ];
    }
}

// Initialize calendar when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new Calendar();
});