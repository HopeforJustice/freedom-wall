// Admin Dashboard JavaScript
// Handles CRUD operations for locks and stories

class AdminDashboard {
    constructor() {
        // Determine API base URL based on environment
        this.apiBase = window.location.hostname === 'localhost' 
            ? 'http://localhost:3001/api' 
            : '/api';
        
        this.currentEditingLock = null;
        this.currentEditingStory = null;
        this.isAuthenticated = false;
        
        this.init();
    }

    async init() {
        await this.checkAuth();
        if (this.isAuthenticated) {
            this.initializeEventListeners();
            await this.loadLocks();
            await this.loadStories();
            await this.populateStoryLockSelect();
        }
    }

    async checkAuth() {
        try {
            // For now, we'll use a simple check - in production, integrate with Stack Auth
            // TODO: Implement proper Stack Auth integration
            const authStatus = document.getElementById('auth-status');
            
            // Temporary: Allow access for development
            this.isAuthenticated = true;
            authStatus.innerHTML = `
                <p style="color: green;">✓ Authenticated as Admin (Development Mode)</p>
                <p><small>In production, this will use Stack Auth</small></p>
            `;
            document.getElementById('admin-content').classList.remove('hidden');
            
        } catch (error) {
            console.error('Auth check failed:', error);
            document.getElementById('auth-status').innerHTML = `
                <p style="color: red;">❌ Authentication failed</p>
                <p>Please ensure you have admin privileges</p>
            `;
        }
    }

    initializeEventListeners() {
        // Lock form
        document.getElementById('lock-form').addEventListener('submit', (e) => this.handleLockSubmit(e));
        document.getElementById('cancel-lock-edit').addEventListener('click', () => this.cancelLockEdit());
        
        // Story form
        document.getElementById('story-form').addEventListener('submit', (e) => this.handleStorySubmit(e));
        document.getElementById('cancel-story-edit').addEventListener('click', () => this.cancelStoryEdit());
    }

    // Utility methods
    showMessage(elementId, message, type = 'success') {
        const element = document.getElementById(elementId);
        element.textContent = message;
        element.className = `message ${type}`;
        element.style.display = 'block';
        
        setTimeout(() => {
            element.style.display = 'none';
        }, 5000);
    }

    // Locks Management
    async loadLocks() {
        try {
            const response = await fetch(`${this.apiBase}/locks`);
            const data = await response.json();
            this.renderLocks(data.locks);
        } catch (error) {
            console.error('Failed to load locks:', error);
            this.showMessage('locks-message', 'Failed to load locks', 'error');
        }
    }

    renderLocks(locks) {
        const container = document.getElementById('locks-list');
        
        if (!locks || locks.length === 0) {
            container.innerHTML = '<div class="loading">No locks found</div>';
            return;
        }

        container.innerHTML = locks.map(lock => `
            <div class="lock-item">
                <div class="lock-info">
                    <strong>${lock.name}</strong> (${lock.date}) 
                    ${lock.story ? '<span style="color: #27ae60;">📖 Has Story</span>' : ''}
                    <br><small>ID: ${lock.lock_id}</small>
                </div>
                <div class="lock-actions">
                    <button onclick="adminDashboard.editLock(${lock.lock_id})">Edit</button>
                    <button class="danger" onclick="adminDashboard.deleteLock(${lock.lock_id})">Delete</button>
                </div>
            </div>
        `).join('');
    }

    async handleLockSubmit(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const lockData = {
            name: formData.get('name'),
            date: formData.get('date'),
            story: formData.get('story') === 'true'
        };

        try {
            const isEditing = this.currentEditingLock !== null;
            const url = isEditing 
                ? `${this.apiBase}/admin/locks/${this.currentEditingLock}`
                : `${this.apiBase}/admin/locks`;
            
            const method = isEditing ? 'PUT' : 'POST';
            
            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(lockData)
            });

            if (response.ok) {
                this.showMessage('locks-message', 
                    isEditing ? 'Lock updated successfully' : 'Lock created successfully');
                await this.loadLocks();
                await this.populateStoryLockSelect();
                this.resetLockForm();
            } else {
                throw new Error('Failed to save lock');
            }
        } catch (error) {
            console.error('Error saving lock:', error);
            this.showMessage('locks-message', 'Failed to save lock', 'error');
        }
    }

    async editLock(lockId) {
        try {
            const response = await fetch(`${this.apiBase}/lock?id=${lockId}`);
            const data = await response.json();
            const lock = data.lock;

            document.getElementById('lock-name').value = lock.name;
            document.getElementById('lock-date').value = lock.date;
            document.getElementById('lock-story').value = lock.story.toString();
            document.getElementById('lock-edit-id').value = lockId;
            
            this.currentEditingLock = lockId;
            document.getElementById('cancel-lock-edit').classList.remove('hidden');
            document.querySelector('#lock-form button[type="submit"]').textContent = 'Update Lock';
        } catch (error) {
            console.error('Error loading lock for edit:', error);
            this.showMessage('locks-message', 'Failed to load lock for editing', 'error');
        }
    }

    async deleteLock(lockId) {
        if (!confirm('Are you sure you want to delete this lock? This will also delete any associated story.')) {
            return;
        }

        try {
            const response = await fetch(`${this.apiBase}/admin/locks/${lockId}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                this.showMessage('locks-message', 'Lock deleted successfully');
                await this.loadLocks();
                await this.loadStories();
                await this.populateStoryLockSelect();
            } else {
                throw new Error('Failed to delete lock');
            }
        } catch (error) {
            console.error('Error deleting lock:', error);
            this.showMessage('locks-message', 'Failed to delete lock', 'error');
        }
    }

    cancelLockEdit() {
        this.resetLockForm();
    }

    resetLockForm() {
        document.getElementById('lock-form').reset();
        document.getElementById('lock-edit-id').value = '';
        this.currentEditingLock = null;
        document.getElementById('cancel-lock-edit').classList.add('hidden');
        document.querySelector('#lock-form button[type="submit"]').textContent = 'Add Lock';
    }

    // Stories Management
    async loadStories() {
        try {
            const response = await fetch(`${this.apiBase}/stories`);
            const data = await response.json();
            this.renderStories(data.stories);
        } catch (error) {
            console.error('Failed to load stories:', error);
            this.showMessage('stories-message', 'Failed to load stories', 'error');
        }
    }

    renderStories(stories) {
        const container = document.getElementById('stories-list');
        
        if (!stories || stories.length === 0) {
            container.innerHTML = '<div class="loading">No stories found</div>';
            return;
        }

        container.innerHTML = stories.map(story => `
            <div class="story-item">
                <div class="story-info">
                    <strong>${story.title}</strong><br>
                    <small>Lock: ${story.name} (${story.date}) | ID: ${story.lock_id}</small><br>
                    <small>${story.body.substring(0, 100)}${story.body.length > 100 ? '...' : ''}</small>
                    ${story.featured ? '<br><span style="color: #e74c3c;">⭐ Featured</span>' : ''}
                </div>
                <div class="story-actions">
                    <button onclick="adminDashboard.editStory(${story.lock_id})">Edit</button>
                    <button class="danger" onclick="adminDashboard.deleteStory(${story.lock_id})">Delete</button>
                </div>
            </div>
        `).join('');
    }

    async populateStoryLockSelect() {
        try {
            const response = await fetch(`${this.apiBase}/locks`);
            const data = await response.json();
            const storyLocks = data.locks.filter(lock => lock.story);
            
            const select = document.getElementById('story-lock-select');
            select.innerHTML = '<option value="">Select a lock with story enabled</option>' +
                storyLocks.map(lock => 
                    `<option value="${lock.lock_id}">${lock.name} (${lock.date}) - ID: ${lock.lock_id}</option>`
                ).join('');
        } catch (error) {
            console.error('Failed to populate story lock select:', error);
        }
    }

    async handleStorySubmit(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const storyData = {
            lock_id: parseInt(formData.get('lock_id')),
            title: formData.get('title'),
            body: formData.get('body'),
            author: formData.get('author') || null,
            featured: formData.get('featured') === 'true'
        };

        try {
            const isEditing = this.currentEditingStory !== null;
            const url = isEditing 
                ? `${this.apiBase}/admin/stories/${this.currentEditingStory}`
                : `${this.apiBase}/admin/stories`;
            
            const method = isEditing ? 'PUT' : 'POST';
            
            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(storyData)
            });

            if (response.ok) {
                this.showMessage('stories-message', 
                    isEditing ? 'Story updated successfully' : 'Story created successfully');
                await this.loadStories();
                this.resetStoryForm();
            } else {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to save story');
            }
        } catch (error) {
            console.error('Error saving story:', error);
            this.showMessage('stories-message', error.message || 'Failed to save story', 'error');
        }
    }

    async editStory(lockId) {
        try {
            const response = await fetch(`${this.apiBase}/lock?id=${lockId}`);
            const data = await response.json();
            const lock = data.lock;

            if (lock.story_title) {
                document.getElementById('story-lock-select').value = lockId;
                document.getElementById('story-title').value = lock.story_title;
                document.getElementById('story-body').value = lock.story_body || '';
                document.getElementById('story-author').value = lock.story_author || '';
                document.getElementById('story-featured').value = 'true'; // Default for existing stories
                document.getElementById('story-edit-id').value = lockId;
                
                this.currentEditingStory = lockId;
                document.getElementById('cancel-story-edit').classList.remove('hidden');
                document.querySelector('#story-form button[type="submit"]').textContent = 'Update Story';
                
                // Disable lock selection when editing
                document.getElementById('story-lock-select').disabled = true;
            }
        } catch (error) {
            console.error('Error loading story for edit:', error);
            this.showMessage('stories-message', 'Failed to load story for editing', 'error');
        }
    }

    async deleteStory(lockId) {
        if (!confirm('Are you sure you want to delete this story?')) {
            return;
        }

        try {
            const response = await fetch(`${this.apiBase}/admin/stories/${lockId}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                this.showMessage('stories-message', 'Story deleted successfully');
                await this.loadStories();
            } else {
                throw new Error('Failed to delete story');
            }
        } catch (error) {
            console.error('Error deleting story:', error);
            this.showMessage('stories-message', 'Failed to delete story', 'error');
        }
    }

    cancelStoryEdit() {
        this.resetStoryForm();
    }

    resetStoryForm() {
        document.getElementById('story-form').reset();
        document.getElementById('story-edit-id').value = '';
        this.currentEditingStory = null;
        document.getElementById('cancel-story-edit').classList.add('hidden');
        document.querySelector('#story-form button[type="submit"]').textContent = 'Add Story';
        document.getElementById('story-lock-select').disabled = false;
    }
}

// Initialize the admin dashboard when the DOM is loaded
const adminDashboard = new AdminDashboard();

// Make it globally available for inline event handlers
window.adminDashboard = adminDashboard;
