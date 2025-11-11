// ==================== AOS INITIALIZATION ====================
// Wait for DOM to be ready before initializing AOS
document.addEventListener('DOMContentLoaded', () => {
    if (typeof AOS !== 'undefined') {
        AOS.init({
            duration: 1000,
            once: true
        });
    }
});

// ==================== HAMBURGER MENU (RESPONSIVE) ====================

// Hamburger Menu Toggle - Wait for DOM to be ready
document.addEventListener('DOMContentLoaded', () => {
    const hamburger = document.getElementById('hamburger');
    const navLinks = document.getElementById('navLinks');

    if (hamburger && navLinks) {
        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('active');
            navLinks.classList.toggle('active');
        });

        // Close menu when clicking on a link
        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                hamburger.classList.remove('active');
                navLinks.classList.remove('active');
            });
        });

        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!hamburger.contains(e.target) && !navLinks.contains(e.target)) {
                hamburger.classList.remove('active');
                navLinks.classList.remove('active');
            }
        });
    }
});

// ==================== DROPDOWN MENU - SCROLL INDICATOR TOGGLE ====================

// Hide scroll indicator when dropdown menu is open
document.addEventListener('DOMContentLoaded', () => {
    const dropdownMenu = document.querySelector('.dropdown-menu');
    const scrollIndicator = document.querySelector('.scroll-indicator');

    if (dropdownMenu && scrollIndicator) {
        // Check initial state and set accordingly
        if (dropdownMenu.open) {
            scrollIndicator.classList.add('hidden');
        }

        // Listen for toggle events
        dropdownMenu.addEventListener('toggle', (e) => {
            // If dropdown is open, hide scroll indicator; otherwise show it
            if (dropdownMenu.open) {
                scrollIndicator.classList.add('hidden');
            } else {
                scrollIndicator.classList.remove('hidden');
            }
        });
    }
});

// ==================== LOCAL STORAGE FEATURE ====================

// Save checkbox state to localStorage
function saveCheckboxState(checkboxId, isChecked) {
    const savedData = JSON.parse(localStorage.getItem('studyProgress')) || {};
    savedData[checkboxId] = isChecked;
    localStorage.setItem('studyProgress', JSON.stringify(savedData));
}

// Save list item strikethrough to localStorage
function saveListItemState(listItemId, hasStrikethrough) {
    const savedData = JSON.parse(localStorage.getItem('strikethroughItems')) || {};
    savedData[listItemId] = hasStrikethrough;
    localStorage.setItem('strikethroughItems', JSON.stringify(savedData));
}

// Load all saved progress on page load
function loadSavedProgress() {
    // Load checkboxes
    const checkboxData = JSON.parse(localStorage.getItem('studyProgress')) || {};
    Object.keys(checkboxData).forEach(checkboxId => {
        const checkbox = document.getElementById(checkboxId);
        if (checkbox) {
            checkbox.checked = checkboxData[checkboxId];
        }
    });

    // Load strikethrough items
    const strikethroughData = JSON.parse(localStorage.getItem('strikethroughItems')) || {};
    Object.keys(strikethroughData).forEach(listItemId => {
        const listItem = document.getElementById(listItemId);
        if (listItem) {
            if (strikethroughData[listItemId]) {
                listItem.style.textDecoration = 'line-through';
                listItem.style.opacity = '0.6';
            }
        }
    });
}

// Load progress when page loads
window.addEventListener('DOMContentLoaded', loadSavedProgress);

// Check if all checkboxes in a form are checked and enable/disable submit button
function updateFormButtonStates() {
    document.querySelectorAll('form').forEach(form => {
        const checkboxes = form.querySelectorAll('input[type="checkbox"]');
        const submitButton = form.querySelector('button[type="submit"]');
        const chapter = form.closest('.chapter');
        const chapterId = chapter ? chapter.id : null;
        
        // Check if all checkboxes are checked
        const allChecked = Array.from(checkboxes).every(checkbox => checkbox.checked);
        
        // Enable or disable the button
        submitButton.disabled = !allChecked;
        submitButton.style.opacity = allChecked ? '1' : '0.5';
        submitButton.style.cursor = allChecked ? 'pointer' : 'not-allowed';
        
        // If any checkbox is unchecked and this chapter was marked complete, remove it from completedChapters
        if (!allChecked && chapterId) {
            const completedChapters = JSON.parse(localStorage.getItem('completedChapters')) || [];
            if (completedChapters.includes(chapterId)) {
                const updatedChapters = completedChapters.filter(id => id !== chapterId);
                localStorage.setItem('completedChapters', JSON.stringify(updatedChapters));
                updateProgressBar(); // Update progress bar to reflect removal
            }
        }
    });
}

// Initialize button states on page load
window.addEventListener('DOMContentLoaded', updateFormButtonStates);

// Add event listeners to all checkboxes
document.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
    checkbox.addEventListener('change', function() {
        saveCheckboxState(this.id, this.checked);
        updateFormButtonStates(); // Update button states when checkbox changes
    });
});

// Clickable strikethrough for topic list items
document.querySelectorAll('.chapter ul li').forEach((li, index) => {
    // Give each li a unique ID based on its chapter and position (consistent across page reloads)
    if (!li.id) {
        const chapter = li.closest('.chapter');
        const chapterId = chapter ? chapter.id : 'chapter-unknown';
        li.id = chapterId + '-item-' + index;
    }
    
    li.style.cursor = 'pointer';
    li.style.userSelect = 'none';
    
    li.addEventListener('click', function(e) {
        // Only toggle if clicking on the text itself, not nested lists
        if (e.target === this || e.target.parentNode === this) {
            const hasStrikethrough = this.style.textDecoration === 'line-through';
            
            this.style.textDecoration = hasStrikethrough ? 'none' : 'line-through';
            this.style.opacity = hasStrikethrough ? '1' : '0.6';
            
            // Save to localStorage
            saveListItemState(this.id, !hasStrikethrough);
        }
    });
});

// Optional: Clear all progress (for debugging/testing)
function clearAllProgress() {
    if (confirm('Are you sure you want to clear all progress?')) {
        localStorage.removeItem('studyProgress');
        localStorage.removeItem('strikethroughItems');
        location.reload();
    }
}

// Make clearAllProgress available in console for manual use
window.clearAllProgress = clearAllProgress;

// ==================== PROGRESS BAR TRACKING ====================

// Update progress bar width based on completed chapters
function updateProgressBar() {
    const completedChapters = JSON.parse(localStorage.getItem('completedChapters')) || [];
    const totalChapters = 5; // 5 chapters total (including cheatsheet)
    const percentage = (completedChapters.length / totalChapters) * 100;
    
    const progressBar = document.getElementById('progressBar');
    if (progressBar) {
        progressBar.style.width = percentage + '%';
    }
}

// Load progress bar on page load
window.addEventListener('DOMContentLoaded', updateProgressBar);

// ==================== FORM SUBMISSION ====================

// Handle form submissions
document.querySelectorAll('form').forEach(form => {
    form.addEventListener('submit', function(e) {
        e.preventDefault(); // Prevent default form submission
        
        // Get the chapter name and ID from the form's parent section
        const chapter = this.closest('.chapter');
        const chapterId = chapter.id; // e.g., "chapter-5"
        const chapterTitle = chapter.querySelector('h3').textContent;
        
        // Mark chapter as completed
        const completedChapters = JSON.parse(localStorage.getItem('completedChapters')) || [];
        if (!completedChapters.includes(chapterId)) {
            completedChapters.push(chapterId);
            localStorage.setItem('completedChapters', JSON.stringify(completedChapters));
        }
        
        // Show confirmation message
        const message = `✓ ${chapterTitle} marked as complete!\n\nYour progress has been saved.`;
        alert(message);
        
        // Update progress bar
        updateProgressBar();
        
        // Optional: You could reset the form here if desired
        // this.reset();
    });
});

// ==================== COUNTDOWN TIMER ====================

// Countdown timer for exam date: Thursday 11/13 3:30 PM EST
function initCountdownTimer() {
    const countdownTimer = document.getElementById('countdownTimer');
    if (!countdownTimer) return; // Exit if countdown timer doesn't exist on this page
    
    // Target date: November 13, 2025 at 3:30 PM EST
    // EST is UTC-5, so we create the date in EST timezone
    // Format: "2025-11-13T15:30:00-05:00" (3:30 PM = 15:30 in 24-hour format)
    const targetDate = new Date('2025-11-13T15:30:00-05:00');
    
    // Get countdown elements
    const daysElement = document.getElementById('days');
    const hoursElement = document.getElementById('hours');
    const minutesElement = document.getElementById('minutes');
    const secondsElement = document.getElementById('seconds');
    
    function updateCountdown() {
        const now = new Date();
        const timeDifference = targetDate - now;
        
        if (timeDifference <= 0) {
            // Exam time has passed
            daysElement.textContent = '0';
            hoursElement.textContent = '0';
            minutesElement.textContent = '0';
            secondsElement.textContent = '0';
            return;
        }
        
        // Calculate time units
        const days = Math.floor(timeDifference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((timeDifference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((timeDifference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((timeDifference % (1000 * 60)) / 1000);
        
        // Update display
        daysElement.textContent = days;
        hoursElement.textContent = hours.toString().padStart(2, '0');
        minutesElement.textContent = minutes.toString().padStart(2, '0');
        secondsElement.textContent = seconds.toString().padStart(2, '0');
    }
    
    // Update immediately and then every second
    updateCountdown();
    setInterval(updateCountdown, 1000);
}

// Initialize countdown timer when DOM is ready
document.addEventListener('DOMContentLoaded', initCountdownTimer);
