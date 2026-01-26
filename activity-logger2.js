const ActivityLogger = {
    CONFIG: {
        // Your Google Script URL
        SCRIPT_URL: 'https://script.google.com/macros/s/AKfycby7eXy51_62Lh_H_TkAYWSWyZ6pJaLJ7OoFNW2dofSQ9TtRi5UprElciBhNMIqafDrY/exec',
        IS_ADMIN: false,
        STUDENT_EMAIL: '', // Will be synced from window
        STUDENT_NAME: ''   // Will be synced from window
    },

    init: function() {
        // Delay by 1 second so window.studentEmail is definitely ready
        setTimeout(() => {
            this.CONFIG.STUDENT_EMAIL = window.studentEmail || 'Guest';
            this.CONFIG.STUDENT_NAME = window.studentName || 'Unknown';
            this.CONFIG.IS_ADMIN = (window.studentEmail === 'jlibiblecollege@gmail.com');
            
            console.log("Security System Initialized. Admin Status:", this.CONFIG.IS_ADMIN);
            
            if (this.CONFIG.IS_ADMIN) {
                this.ui.createAdminDashboard();
            }

            // Log initial entry
            this.logActivity('Portal Accessed', 'September 2025 Batch');
            
            // Start listening for clicks, prints, and right-clicks
            this.setupListeners();
        }, 1000); 
    },

    setupListeners: function() {
        // 1. Track Print attempts
        window.addEventListener('beforeprint', () => {
            this.logActivity('Print Attempt', 'PDF Viewer');
        });
        
        // 2. Track Right Clicks (Security Violation)
        window.addEventListener('contextmenu', () => {
            this.logActivity('Right Click Violation', 'Website Content');
        });

        // 3. Track All Clicks on the page (Profile, Marksheet, Specific PDFs)
        window.addEventListener('click', (e) => {
            const target = e.target;

            // Track Profile Button
            if (target.id === 'profile-btn' || target.closest('#profile-btn')) {
                this.logActivity('Click Profile', 'Student Profile View');
            }

            // Track Specific PDF Panels
            const pdfPanel = target.closest('.pdf-card'); 
            if (pdfPanel) {
                const pdfName = pdfPanel.querySelector('h3')?.innerText || 'Unknown PDF';
                this.logActivity('View PDF', `Opened: ${pdfName}`);
            }

            // Track Marksheet Check
            if (target.innerText.includes('Marksheet') || target.id === 'marksheet-btn') {
                this.logActivity('Checked Marksheet', 'Student Portal');
            }
            
            // Track Download Buttons (if any)
            if (target.innerText.includes('Download') || target.classList.contains('download-btn')) {
                this.logActivity('Download Attempt', 'File System');
            }
        });
    },

    logActivity: function(action, details) {
        // Sync latest identity before logging
        const email = window.studentEmail || this.CONFIG.STUDENT_EMAIL;
        const name = window.studentName || this.CONFIG.STUDENT_NAME;

        if (!email || email === 'Guest') return;

        const logData = {
            email: email,
            name: name,
            action: action,
            details: details,
            timestamp: new Date().toLocaleString()
        };

        // Send to Google Sheets
        fetch(this.CONFIG.SCRIPT_URL, {
            method: 'POST',
            mode: 'no-cors',
            cache: 'no-cache',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(logData)
        }).catch(err => console.error("Logging failed:", err));
    },

    ui: {
        createAdminDashboard: function() {
            const adminSecurity = document.getElementById('admin-security-section');
            const adminStudents = document.getElementById('admin-students-toggle-div');
            if (adminSecurity) adminSecurity.style.display = 'block';
            if (adminStudents) adminStudents.style.display = 'block';
        },
        toggleStudents: function() {
            const div = document.getElementById('admin-students-toggle-div');
            if (div) {
                div.style.display = (div.style.display === 'none' || div.style.display === '') ? 'block' : 'none';
            }
        },
        togglePanel: function() {
            // Logic for opening full dashboard
            alert("Redirecting to Security Management...");
            window.open('https://docs.google.com/spreadsheets/d/YOUR_SHEET_ID_HERE/edit', '_blank');
        }
    }
};

    toggleStudents: function() {
        console.log("Toggle button clicked!"); // Check your browser console for this!
        
        const wrapper = document.getElementById('student-directory-wrapper');
        const btn = document.getElementById('viewStudentsBtn');

        if (!wrapper) {
            console.error("Error: Could not find the element 'student-directory-wrapper'");
            return;
        }

        if (wrapper.style.display === 'none' || wrapper.style.display === '') {
            wrapper.style.display = 'block';
            btn.innerHTML = '❌ CLOSE STUDENT DIRECTORY';
            btn.style.backgroundColor = '#dc3545';
            console.log("Directory opened");
        } else {
            wrapper.style.display = 'none';
            btn.innerHTML = '👥 VIEW STUDENT DIRECTORY';
            btn.style.backgroundColor = '#1e3c72';
            console.log("Directory closed");
        }
    },

    togglePanel: function() {
        window.open('security-dashboard.html', '_blank');
    }
},
    logActivity: function(action, location) {
        const data = {
            email: window.studentEmail || 'Unknown',
            name: window.studentName || 'Unknown',
            action: action,
            location: location,
            device: navigator.userAgent.slice(0, 50)
        };

        // Standard fetch for POSTing data to Google
        fetch(this.CONFIG.SCRIPT_URL, {
            method: 'POST',
            mode: 'no-cors', 
            body: JSON.stringify(data)
        }).catch(err => console.error("Logging error:", err));
    }
};

// Start the logger
ActivityLogger.init();
