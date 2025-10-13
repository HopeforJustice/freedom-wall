// Integrated Admin Interface
// Manages locks and stories in a single integrated workflow

class AdminInterface {
	constructor() {
		// Determine API base URL based on environment
		this.apiBase =
			window.location.hostname === "localhost"
				? "http://localhost:3001/api"
				: "/api";

		this.locks = [];
		this.filteredLocks = [];
		this.selectedLock = null;

		this.init();
	}

	async init() {
		this.initializeEventListeners();
		await this.loadLocks();
	}

	initializeEventListeners() {
		// Search functionality
		document
			.getElementById("lock-search")
			.addEventListener("input", (e) => this.handleSearch(e.target.value));

		// Bind methods to preserve 'this' context
		this.handleAddNewLock = this.addNewLock.bind(this);
		this.handleCreateLock = this.createLock.bind(this);
		this.handleUpdateLock = this.updateLock.bind(this);
		this.handleCancelEdit = this.cancelEdit.bind(this);

		// Add new lock button
		document
			.getElementById("add-lock-button")
			.addEventListener("click", this.handleAddNewLock);

		// Update lock button
		document
			.getElementById("update-lock-button")
			.addEventListener("click", this.handleUpdateLock);

		// Cancel edit button
		document
			.getElementById("cancel-edit-button")
			.addEventListener("click", this.handleCancelEdit);

		// Story checkbox toggle
		document
			.getElementById("has-story-checkbox")
			.addEventListener("change", (e) =>
				this.toggleStoryFields(e.target.checked)
			);

		// Auto-check story checkbox when story content is entered
		document
			.getElementById("story-title")
			.addEventListener("input", () => this.handleStoryContentChange());
		document
			.getElementById("story-body")
			.addEventListener("input", () => this.handleStoryContentChange());

		// Form validation
		document
			.getElementById("edit-lock-name")
			.addEventListener("input", () => this.validateForm());
		document
			.getElementById("edit-lock-date")
			.addEventListener("input", () => this.validateForm());
	}

	// Search functionality
	handleSearch(query) {
		const tableTitle = document.getElementById("locks-table-title");

		if (!query.trim()) {
			this.filteredLocks = [...this.locks];
			tableTitle.textContent = "All Locks";
		} else {
			const searchTerm = query.toLowerCase();
			this.filteredLocks = this.locks.filter(
				(lock) =>
					lock.name.toLowerCase().includes(searchTerm) ||
					lock.lock_id.toString().includes(searchTerm) ||
					lock.date.includes(searchTerm)
			);
			tableTitle.textContent = `Locks Found (${this.filteredLocks.length})`;
		}
		this.renderLocksList();
	}

	// Load and display locks
	async loadLocks() {
		try {
			const response = await fetch(`${this.apiBase}/locks`);
			const data = await response.json();
			this.locks = data.locks || [];
			this.filteredLocks = [...this.locks];

			// Set initial table title
			const tableTitle = document.getElementById("locks-table-title");
			tableTitle.textContent = "All Locks";

			this.renderLocksList();
		} catch (error) {
			console.error("Failed to load locks:", error);
			this.showToast("Failed to load locks", "error");
		}
	}

	renderLocksList() {
		const container = document.getElementById("locks-list");

		if (this.filteredLocks.length === 0) {
			container.innerHTML = `
                <tr>
                    <td colspan="5" class="table-cell text-center text-secondary-500 py-8">
                        No locks found
                    </td>
                </tr>
            `;
			return;
		}

		container.innerHTML = this.filteredLocks
			.map(
				(lock) => `
            <tr class="table-row">
                <td class="table-cell font-mono text-sm">${lock.lock_id}</td>
                <td class="table-cell font-medium">${lock.name}</td>
                <td class="table-cell">${lock.date}</td>
                <td class="table-cell">
                    ${
											lock.story_title
												? '<span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">📖 Story</span>'
												: lock.story
												? '<span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">📝 Story Enabled</span>'
												: '<span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">No Story</span>'
										}
                </td>
                <td class="table-cell">
                    <div class="flex space-x-2">
                        <button onclick="adminInterface.loadLockById(${
													lock.lock_id
												})" 
                                class="text-sm px-3 py-1 bg-blue-100 hover:bg-blue-200 text-blue-800 rounded border border-blue-300 transition-colors">
                            Edit
                        </button>
                        <button onclick="adminInterface.deleteLock(${
													lock.lock_id
												})" 
                                class="text-sm px-3 py-1 bg-red-100 hover:bg-red-200 text-red-800 rounded border border-red-300 transition-colors">
                            Delete
                        </button>
                    </div>
                </td>
            </tr>
        `
			)
			.join("");
	}

	async loadLockById(lockId) {
		try {
			const response = await fetch(`${this.apiBase}/lock?id=${lockId}`);
			const data = await response.json();
			this.selectedLock = data.lock;

			// Show lock fields and story section
			document.getElementById("lock-fields").classList.remove("hidden");
			document.getElementById("story-section").classList.remove("hidden"); // Populate the form
			document.getElementById("edit-lock-name").value = this.selectedLock.name;
			document.getElementById("edit-lock-date").value = this.selectedLock.date;

			// Handle story data
			const hasStory = this.selectedLock.story;
			document.getElementById("has-story-checkbox").checked = hasStory;
			this.toggleStoryFields(hasStory);

			if (hasStory && this.selectedLock.story_title) {
				document.getElementById("story-title").value =
					this.selectedLock.story_title;
				document.getElementById("story-body").value =
					this.selectedLock.story_body || "";
			}

			// Show update and cancel buttons, hide add button
			document.getElementById("add-lock-button").classList.add("hidden");
			document.getElementById("update-lock-button").classList.remove("hidden");
			document.getElementById("cancel-edit-button").classList.remove("hidden");

			this.showToast(`Loaded lock: ${this.selectedLock.name}`);
		} catch (error) {
			console.error("Error loading lock:", error);
			this.showToast("Failed to load lock", "error");
		}
	}

	addNewLock() {
		// Clear the form and switch to create mode
		this.selectedLock = null;
		document.getElementById("edit-lock-name").value = "";
		document.getElementById("edit-lock-date").value = "";
		document.getElementById("has-story-checkbox").checked = false;
		document.getElementById("story-title").value = "";
		document.getElementById("story-body").value = "";
		this.toggleStoryFields(false);

		// Show lock fields and story section
		document.getElementById("lock-fields").classList.remove("hidden");
		document.getElementById("story-section").classList.remove("hidden");

		// Show add button as primary action, hide others
		const addBtn = document.getElementById("add-lock-button");
		addBtn.classList.remove("hidden");
		addBtn.textContent = "Create Lock";

		// Remove any existing event listeners and add new one
		addBtn.removeEventListener("click", this.handleAddNewLock);
		addBtn.removeEventListener("click", this.handleCreateLock);
		addBtn.addEventListener("click", this.handleCreateLock);

		document.getElementById("update-lock-button").classList.add("hidden");
		document.getElementById("cancel-edit-button").classList.remove("hidden");

		this.showToast("Ready to create new lock");
	}

	cancelEdit() {
		// Reset to initial state
		this.selectedLock = null;
		document.getElementById("edit-lock-name").value = "";
		document.getElementById("edit-lock-date").value = "";
		document.getElementById("has-story-checkbox").checked = false;
		document.getElementById("story-title").value = "";
		document.getElementById("story-body").value = "";
		this.toggleStoryFields(false);

		// Hide lock fields and story section
		document.getElementById("lock-fields").classList.add("hidden");
		document.getElementById("story-section").classList.add("hidden");

		// Reset buttons
		const addBtn = document.getElementById("add-lock-button");
		addBtn.classList.remove("hidden");
		addBtn.textContent = "Add New Lock";

		// Remove create lock listener and restore add new lock listener
		addBtn.removeEventListener("click", this.handleCreateLock);
		addBtn.removeEventListener("click", this.handleAddNewLock);
		addBtn.addEventListener("click", this.handleAddNewLock);

		document.getElementById("update-lock-button").classList.add("hidden");
		document.getElementById("cancel-edit-button").classList.add("hidden");
	}

	async createLock() {
		const nameElement = document.getElementById("edit-lock-name");
		const dateElement = document.getElementById("edit-lock-date");

		const name = nameElement?.value?.trim() || "";
		const date = dateElement?.value?.trim() || "";

		if (!name || !date) {
			this.showToast("Name and date are required", "error");
			return;
		}

		// Generate next available lock ID
		const nextLockId = this.getNextLockId();

		const lockData = {
			lock_id: nextLockId,
			name: name,
			date: date,
			story: document.getElementById("has-story-checkbox").checked,
			position_x: 0, // Default position
			position_y: 0,
			position_z: 0,
		};

		// Check if there's story content entered
		const storyTitle = document.getElementById("story-title").value;
		const storyBody = document.getElementById("story-body").value;

		// Include story data if story checkbox is checked OR if there's actual story content
		if (lockData.story || storyTitle || storyBody) {
			lockData.story = true; // Ensure story is enabled if content exists
			lockData.story_title = storyTitle || null;
			lockData.story_body = storyBody || null;
			lockData.story_author = null;
			lockData.story_featured = false;
		}

		try {
			const response = await fetch(`${this.apiBase}/admin/locks`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(lockData),
			});

			if (response.ok) {
				this.showToast("Lock created successfully");
				await this.loadLocks();

				// Trigger lock grid regeneration for new lock
				this.triggerLockGridRegeneration();

				this.cancelEdit(); // Reset form
			} else {
				const errorData = await response.json();
				throw new Error(errorData.error || "Failed to create lock");
			}
		} catch (error) {
			console.error("Error creating lock:", error);
			this.showToast(`Failed to create lock: ${error.message}`, "error");
		}
	}

	getNextLockId() {
		// Find the highest lock_id and add 1
		if (this.locks.length === 0) {
			return 1;
		}
		const maxId = Math.max(...this.locks.map((lock) => lock.lock_id));
		return maxId + 1;
	}

	async updateLock() {
		if (!this.selectedLock) {
			this.showToast("No lock selected", "error");
			return;
		}

		const lockData = {
			name: document.getElementById("edit-lock-name").value,
			date: document.getElementById("edit-lock-date").value,
			story: document.getElementById("has-story-checkbox").checked,
		};

		// Check if there's story content entered
		const storyTitle = document.getElementById("story-title").value;
		const storyBody = document.getElementById("story-body").value;

		// Include story data if story checkbox is checked OR if there's actual story content
		if (lockData.story || storyTitle || storyBody) {
			lockData.story = true; // Ensure story is enabled if content exists
			lockData.story_title = storyTitle || null;
			lockData.story_body = storyBody || null;
			lockData.story_author = null;
			lockData.story_featured = false;
		}

		try {
			const response = await fetch(
				`${this.apiBase}/admin/locks/${this.selectedLock.lock_id}`,
				{
					method: "PUT",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify(lockData),
				}
			);

			if (response.ok) {
				this.showToast("Lock updated successfully");
				await this.loadLocks();
				// Reload the lock to refresh the form with updated data
				await this.loadLockById(this.selectedLock.lock_id);
			} else {
				throw new Error("Failed to update lock");
			}
		} catch (error) {
			console.error("Error updating lock:", error);
			this.showToast("Failed to update lock", "error");
		}
	}

	toggleStoryFields(show) {
		const storyFields = document.getElementById("story-fields");
		if (show) {
			storyFields.classList.remove("hidden");
		} else {
			storyFields.classList.add("hidden");
			// Clear story fields
			document.getElementById("story-title").value = "";
			document.getElementById("story-body").value = "";
		}
	}

	handleStoryContentChange() {
		// Auto-check the story checkbox if any story content is entered
		const storyTitle = document.getElementById("story-title").value;
		const storyBody = document.getElementById("story-body").value;

		if (storyTitle || storyBody) {
			const checkbox = document.getElementById("has-story-checkbox");
			if (!checkbox.checked) {
				checkbox.checked = true;
				this.toggleStoryFields(true);
			}
		}
	}

	async deleteLock(lockId) {
		if (
			!confirm(
				"Are you sure you want to delete this lock? This will also delete any associated story."
			)
		) {
			return;
		}

		try {
			const response = await fetch(`${this.apiBase}/admin/locks/${lockId}`, {
				method: "DELETE",
			});

			if (response.ok) {
				this.showToast("Lock deleted successfully");
				await this.loadLocks();

				// Trigger lock grid regeneration if it exists (for main app)
				this.triggerLockGridRegeneration();

				// If the deleted lock was selected, clear the selection
				if (this.selectedLock?.lock_id === lockId) {
					this.cancelEdit();
				}
			} else {
				throw new Error("Failed to delete lock");
			}
		} catch (error) {
			console.error("Error deleting lock:", error);
			this.showToast("Failed to delete lock", "error");
		}
	}

	// Form validation
	validateForm() {
		const name = document.getElementById("edit-lock-name").value.trim();
		const date = document.getElementById("edit-lock-date").value.trim();
		const updateBtn = document.getElementById("update-lock-button");
		const addBtn = document.getElementById("add-lock-button");

		const isValid = name && date;

		// Handle update button
		if (!updateBtn.classList.contains("hidden")) {
			updateBtn.disabled = !isValid;
			updateBtn.classList.toggle("opacity-50", !isValid);
			updateBtn.classList.toggle("cursor-not-allowed", !isValid);
		}

		// Handle add button when in create mode
		if (
			!addBtn.classList.contains("hidden") &&
			addBtn.textContent === "Create Lock"
		) {
			addBtn.disabled = !isValid;
			addBtn.classList.toggle("opacity-50", !isValid);
			addBtn.classList.toggle("cursor-not-allowed", !isValid);
		}
	}

	// Method to trigger lock grid regeneration
	triggerLockGridRegeneration() {
		try {
			// Try to communicate with parent window if this is embedded
			if (window.parent && window.parent !== window) {
				window.parent.postMessage(
					{
						type: "REGENERATE_LOCK_GRID",
					},
					"*"
				);
			}

			// Also try localStorage as a fallback communication method
			localStorage.setItem("lockGridRegenerate", Date.now().toString());

			console.log("Triggered lock grid regeneration");
		} catch (error) {
			console.warn("Could not trigger lock grid regeneration:", error);
		}
	}

	// Toast notifications
	showToast(message, type = "success") {
		const toast = document.createElement("div");
		const bgColor = type === "error" ? "bg-red-500" : "bg-green-500";

		toast.className = `${bgColor} text-white px-6 py-4 rounded-lg shadow-lg transform transition-all duration-300 translate-x-full opacity-0`;
		toast.innerHTML = `
            <div class="flex items-center justify-between">
                <span>${message}</span>
                <button onclick="this.parentElement.parentElement.remove()" class="ml-4 text-white hover:text-gray-200">
                    <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"></path>
                    </svg>
                </button>
            </div>
        `;

		const container = document.getElementById("toast-container");
		container.appendChild(toast);

		// Animate in
		setTimeout(() => {
			toast.classList.remove("translate-x-full", "opacity-0");
		}, 100);

		// Auto remove after 5 seconds
		setTimeout(() => {
			toast.classList.add("translate-x-full", "opacity-0");
			setTimeout(() => toast.remove(), 300);
		}, 5000);
	}
}

// Initialize the admin interface when the DOM is loaded
const adminInterface = new AdminInterface();

// Make it globally available for inline event handlers
window.adminInterface = adminInterface;
