// additional-features.js
// Bible College of India - Additional Features Module

(function() {
    'use strict';

    // Ensure STUDENT_DATA is available (it should be global from student-data.js)
    if (typeof STUDENT_DATA === 'undefined') {
        console.error('STUDENT_DATA is not defined. Make sure student-data.js is loaded before additional-features.js');
        return;
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

     function init() {
        // Wait a bit for main page to load
        setTimeout(() => {
            // If an admin logs in directly after page load (e.g., refreshing on admin page),
            // ensure the admin dashboard is shown.
            if (window.studentEmail === 'jlibiblecollege@gmail.com' && document.getElementById('adminDashboard').style.display !== 'block') {
                window.showAdminDashboard();
            }
        }, 500);
    }

    // Add View Marksheet and Student Profile buttons for regular students
    window.addAdditionalButtons = function() {
        const studentInfo = document.querySelector('.student-info');
        
        if (!studentInfo) {
            return;
        }

        // Check if buttons already exist (to prevent duplicates on re-init)
        if (document.getElementById('marksheetBtn')) {
            return;
        }

        const buttonsContainer = document.createElement('div');
        buttonsContainer.className = 'header-actions';
        buttonsContainer.style.cssText = `
            display: flex;
            gap: 10px;
            align-items: center;
            flex-wrap: wrap;
        `;

        // Student Profile Button
        const profileBtn = createButton('profileBtn', '👤 Student Profile', '#667eea', '#764ba2');
        profileBtn.onclick = () => window.showStudentProfile(window.studentEmail);

        // View Marksheet Button
        const marksheetBtn = createButton('marksheetBtn', '📊 View Marksheet', '#f093fb', '#f5576c');
        marksheetBtn.onclick = () => window.showMarksheet(window.studentEmail);

        buttonsContainer.appendChild(profileBtn);
        buttonsContainer.appendChild(marksheetBtn);

        const logoutBtn = studentInfo.querySelector('.logout-btn');
        if (logoutBtn) {
            studentInfo.insertBefore(buttonsContainer, logoutBtn);
        } else {
            studentInfo.appendChild(buttonsContainer);
        }
    };

    // Helper function to create styled buttons
    function createButton(id, text, color1, color2) {
        const btn = document.createElement('button');
        btn.id = id;
        btn.className = 'action-btn';
        btn.innerHTML = text;
        btn.style.cssText = `
            padding: 10px 20px;
            background: linear-gradient(135deg, $${color1} 0%, $${color2} 100%);
            color: white;
            border: none;
            border-radius: 8px;
            cursor: pointer;
            font-size: 0.9em;
            font-weight: 600;
            transition: all 0.3s;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            white-space: nowrap;
        `;

        return btn;
    }


    /**
     * Shows the marksheet for a given student email.
     * @param {string} email The email of the student whose marksheet is to be displayed.
     */
    window.showMarksheet = function(email) {
        if (!email) {
            alert('Student email not provided.');
            return;
        }

        const studentMarksData = STUDENT_DATA.marks[email];
        const studentProfileData = STUDENT_DATA.profiles[email]; // Get profile for name

        if (!studentMarksData) {
            alert('No marksheet data available for this student: ' + email);
            return;
        }

        // Hide all other main content sections
        window.hideAllContentSections();
        
        // Create or show marksheet section
        let marksheetSection = document.getElementById('marksheetSection');
        
        if (!marksheetSection) {
            marksheetSection = createMarksheetSection();
            document.querySelector('.container').appendChild(marksheetSection);
        }

        // Populate marksheet with data
        populateMarksheet(studentMarksData, studentProfileData, email);
        marksheetSection.style.display = 'block';
    };

    // Create Marksheet HTML Structure
    function createMarksheetSection() {
        const section = document.createElement('div');
        section.id = 'marksheetSection';
        section.style.cssText = 'padding: 40px; background: #f8f9fa; display: none;';
        
        section.innerHTML = `
            <div class="back-btn-container" style="margin-bottom: 20px;">
                <button class="back-btn" onclick="window.backToDashboardFromMarksheet()" style="
                    padding: 10px 20px;
                    background: #6c757d;
                    color: white;
                    border: none;
                    border-radius: 8px;
                    cursor: pointer;
                    font-size: 0.95em;
                    font-weight: 600;
                ">⬅️ BACK TO DASHBOARD</button>
            </div>

            <div class="marksheet-header" style="
                background: linear-gradient(135deg, #ff9800 0%, #ff5722 100%);
                color: white;
                padding: 30px;
                text-align: center;
                border-radius: 12px;
                margin-bottom: 30px;
                box-shadow: 0 5px 15px rgba(0,0,0,0.2);
            ">
                <div style="font-size: 3em; margin-bottom: 10px;">📊</div>
                <h2 style="font-size: 2em; margin-bottom: 10px;">Academic Performance</h2>
                <p id="marksheet-student-name" style="font-size: 1.3em; opacity: 0.95;"></p>
                <p id="marksheet-student-email-display" style="font-size: 1em; opacity: 0.8;"></p>
            </div>

            <div class="summary-cards" style="
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
                gap: 20px;
                margin-bottom: 30px;
            ">
                <div class="summary-card" style="
                    background: white;
                    padding: 25px;
                    border-radius: 10px;
                    text-align: center;
                    box-shadow: 0 3px 10px rgba(0,0,0,0.1);
                    border-left: 5px solid #2196f3;
                ">
                    <div style="color: #666; font-size: 0.85em; margin-bottom: 8px; text-transform: uppercase; font-weight: 600;">FINAL TOTAL SCORE</div>
                    <div id="final-total-score" style="color: #2196f3; font-size: 2.5em; font-weight: 700;">0</div>
                </div>

                <div class="summary-card" style="
                    background: white;
                    padding: 25px;
                    border-radius: 10px;
                    text-align: center;
                    box-shadow: 0 3px 10px rgba(0,0,0,0.1);
                    border-left: 5px solid #9c27b0;
                ">
                    <div style="color: #666; font-size: 0.85em; margin-bottom: 8px; text-transform: uppercase; font-weight: 600;">ONLINE EXAMS TAKEN</div>
                    <div id="online-exams-taken" style="color: #9c27b0; font-size: 2.5em; font-weight: 700;">0/7</div>
                </div>

                <div class="summary-card" style="
                    background: white;
                    padding: 25px;
                    border-radius: 10px;
                    text-align: center;
                    box-shadow: 0 3px 10px rgba(0,0,0,0.1);
                    border-left: 5px solid #ff9800;
                ">
                    <div style="color: #666; font-size: 0.85em; margin-bottom: 8px; text-transform: uppercase; font-weight: 600;">ONLINE AVERAGE</div>
                  <div id="online-average-score" style="color: #ff9800; font-size: 2.5em; font-weight: 700;">0</div>
                </div>

                <div class="summary-card" style="
                    background: white;
                    padding: 25px;
                    border-radius: 10px;
                    text-align: center;
                    box-shadow: 0 3px 10px rgba(0,0,0,0.1);
                    border-left: 5px solid #4caf50;
                ">
                    <div style="color: #666; font-size: 0.85em; margin-bottom: 8px; text-transform: uppercase; font-weight: 600;">FINAL PERCENTAGE</div>
                    <div id="final-percentage-score" style="color: #4caf50; font-size: 2.5em; font-weight: 700;">0%</div>
                </div>

                <div class="summary-card" style="
                    background: white;
                    padding: 25px;
                    border-radius: 10px;
                    text-align: center;
                    box-shadow: 0 3px 10px rgba(0,0,0,0.1);
                    border-left: 5px solid #f44336;
                ">
                    <div style="color: #666; font-size: 0.85em; margin-bottom: 8px; text-transform: uppercase; font-weight: 600;">FINAL GRADE</div>
                    <div id="final-grade-display" style="color: #4caf50; font-size: 2.5em; font-weight: 700;">A+</div>
                </div>
            </div>

            <div class="marks-table-container" style="
                background: white;
                padding: 30px;
                border-radius: 12px;
                box-shadow: 0 5px 15px rgba(0,0,0,0.1);
            ">
                <table id="marks-table" style="
                    width: 100%;
                    border-collapse: collapse;
                ">
                    <thead>
                        <tr style="background: #1e3c72; color: white;">
                            <th style="padding: 15px; text-align: left; font-size: 1.1em;">Exam</th>
                            <th style="padding: 15px; text-align: center; font-size: 1.1em;">Marks</th>
                            <th style="padding: 15px; text-align: center; font-size: 1.1em;">Out of</th>
                            <th style="padding: 15px; text-align: center; font-size: 1.1em;">%</th>
                            <th style="padding: 15px; text-align: center; font-size: 1.1em;">Status</th>
                        </tr>
                    </thead>
                    <tbody id="marks-table-body">
                    </tbody>
                </table>
            </div>
        `;

        return section;
    }

    // Populate Marksheet with Student Data
    function populateMarksheet(studentMarksData, studentProfileData, email) {
        const onlineMarks = studentMarksData.marks; // Array of 7 online marks
        const offlineMark = studentMarksData.offlineMark; // Single offline mark
        const examMonths = STUDENT_DATA.examMonths; // Includes "Offline Exam" now
        
        // Calculate total online marks and number of exams taken
        let totalOnlineMarks = 0;
        let onlineExamsTaken = 0;
        
        onlineMarks.forEach(mark => {
            if (mark !== null && typeof mark === 'number') {
                totalOnlineMarks += mark;
                onlineExamsTaken++;
            }
        });

        // Calculate "Monthly Avg (Total/7)" as a percentage of 700 total possible online marks
        // This is (total online marks / 700) * 100
        const monthlyAveragePercentage = (totalOnlineMarks / 700) * 100;
        
        // Calculate weighted scores based on the report's columns
        const twentyPercentMonthlyAvg = monthlyAveragePercentage * 0.20; // 20% of monthly average
        
        // Ensure offlineMark is a number or null/NaN for calculations
        const actualOfflineScore = (offlineMark !== null && typeof offlineMark === 'number') ? offlineMark : NaN;
        const eightyPercentOfflineExam = actualOfflineScore * 0.80; // 80% of offline mark

        // Final Percentage Calculation
        let finalPercentage;
        if (!isNaN(twentyPercentMonthlyAvg) && !isNaN(eightyPercentOfflineExam)) {
            finalPercentage = twentyPercentMonthlyAvg + eightyPercentOfflineExam;
            finalPercentage = parseFloat(finalPercentage.toFixed(2)); // Round to 2 decimal places
        } else {
            finalPercentage = 'N/A'; // If either online average or offline mark is missing/invalid
        }

        const finalGrade = calculateGrade(finalPercentage);

        // Update summary cards
        document.getElementById('marksheet-student-name').textContent = studentProfileData.name;
        document.getElementById('marksheet-student-email-display').textContent = email; // Display email
        document.getElementById('final-total-score').textContent = finalPercentage !== 'N/A' ? finalPercentage.toFixed(0) : 'N/A'; // Display final score rounded
        document.getElementById('online-exams-taken').textContent = `${onlineExamsTaken}/${onlineMarks.length}`;
        document.getElementById('online-average-score').textContent = !isNaN(monthlyAveragePercentage) ? monthlyAveragePercentage.toFixed(2) : 'N/A';
        document.getElementById('final-percentage-score').textContent = finalPercentage !== 'N/A' ? finalPercentage + '%' : 'N/A';
        document.getElementById('final-grade-display').textContent = finalGrade;

        // Set grade color for final grade
        const finalGradeDisplay = document.getElementById('final-grade-display');
        if (typeof finalPercentage === 'number') { // Only apply color if it's a number
            if (finalPercentage >= 90) finalGradeDisplay.style.color = '#4caf50';
            else if (finalPercentage >= 80) finalGradeDisplay.style.color = '#2196f3';
            else if (finalPercentage >= 70) finalGradeDisplay.style.color = '#ff9800';
            else finalGradeDisplay.style.color = '#f44336';
        } else {
             finalGradeDisplay.style.color = '#6c757d'; // Grey for N/A
        }


        // Populate table
        const tableBody = document.getElementById('marks-table-body');
        tableBody.innerHTML = '';

        // Display individual online exam marks
        onlineMarks.forEach((mark, index) => {
            const row = document.createElement('tr');
            row.style.borderBottom = '1px solid #e0e0e0';
            
            const examMonth = examMonths[index]; // Use the original exam month
            const markValue = mark !== null ? mark : 'Absent';
            const outOf = 100;
            const examPercentage = mark !== null ? mark + '%' : '-';
            const status = getStatus(mark);

            let markColor = '#333';
            if (mark === 100) markColor = '#4caf50';
            else if (mark >= 90) markColor = '#4caf50';
            else if (mark >= 80) markColor = '#2196f3';
            else if (mark >= 70) markColor = '#ff9800';
            else if (mark !== null) markColor = '#f44336';

            row.innerHTML = `
                <td style="padding: 15px; font-weight: 600;">${examMonth}</td>
                <td style="padding: 15px; text-align: center; color: ${markColor}; font-weight: 700; font-size: 1.1em;">${markValue}</td>
                <td style="padding: 15px; text-align: center;">${outOf}</td>
                <td style="padding: 15px; text-align: center; font-weight: 600;">${examPercentage}</td>
                <td style="padding: 15px; text-align: center; font-weight: 600; color: ${markColor};">${status}</td>
            `;
            tableBody.appendChild(row);
        });

        // Add the new calculated rows
        const newRowsData = [
            { label: 'Total Monthly Marks (out of 700)', value: totalOnlineMarks, percentage: totalOnlineMarks > 0 ? ((totalOnlineMarks / 700) * 100).toFixed(2) + '%' : '-' },
            { label: 'Monthly Avg (Total/7)', value: !isNaN(monthlyAveragePercentage) ? monthlyAveragePercentage.toFixed(2) : 'N/A', percentage: !isNaN(monthlyAveragePercentage) ? monthlyAveragePercentage.toFixed(2) + '%' : 'N/A' },
            { label: 'Offline Score (%)', value: !isNaN(actualOfflineScore) ? actualOfflineScore : 'N/A', percentage: !isNaN(actualOfflineScore) ? actualOfflineScore + '%' : 'N/A' },
            { label: '20% of Monthly Avg', value: !isNaN(twentyPercentMonthlyAvg) ? twentyPercentMonthlyAvg.toFixed(2) : 'N/A', percentage: !isNaN(twentyPercentMonthlyAvg) ? twentyPercentMonthlyAvg.toFixed(2) + '%' : 'N/A' },
            { label: '80% of Offline Exam', value: !isNaN(eightyPercentOfflineExam) ? eightyPercentOfflineExam.toFixed(2) : 'N/A', percentage: !isNaN(eightyPercentOfflineExam) ? eightyPercentOfflineExam.toFixed(2) + '%' : 'N/A' },
            { label: 'Final Percentage (Weighted)', value: finalPercentage, percentage: finalPercentage !== 'N/A' ? finalPercentage.toFixed(2) + '%' : 'N/A' }
        ];

        newRowsData.forEach((rowData, index) => {
            const row = document.createElement('tr');
            row.style.borderTop = (index === 0) ? '3px double #1e3c72' : '1px solid #e0e0e0'; // Add a separator line
            
            let valueColor = '#333';
            const valueForColor = typeof rowData.value === 'number' ? rowData.value : null;

            if (rowData.label.includes('Final Percentage')) {
                if (typeof finalPercentage === 'number') {
                    if (finalPercentage >= 90) valueColor = '#4caf50';
                    else if (finalPercentage >= 80) valueColor = '#2196f3';
                    else if (finalPercentage >= 70) valueColor = '#ff9800';
                    else valueColor = '#f44336';
                } else {
                    valueColor = '#6c757d'; // Grey for N/A
                }
            } else if (valueForColor !== null) {
                if (valueForColor >= 90) valueColor = '#4caf50';
                else if (valueForColor >= 80) valueColor = '#2196f3';
                else if (valueForColor >= 70) valueColor = '#ff9800';
                else valueColor = '#f44336';
            }

            row.innerHTML = `
                <td style="padding: 15px; font-weight: 700; background: #eef; border-radius: 4px;">${rowData.label}</td>
                <td style="padding: 15px; text-align: center; color: $${valueColor}; font-weight: 700; font-size: 1.1em; background: #eef; border-radius: 4px;">$${typeof rowData.value === 'number' ? rowData.value.toFixed(2) : rowData.value}</td>
                <td style="padding: 15px; text-align: center; background: #eef; border-radius: 4px;">${rowData.label.includes('Total Monthly Marks') ? '700' : '100'}</td>
                <td style="padding: 15px; text-align: center; font-weight: 700; background: #eef; border-radius: 4px;">${rowData.percentage}</td>
                <td style="padding: 15px; text-align: center; background: #eef; border-radius: 4px;">${getStatus(valueForColor)}</td>
            `;
            tableBody.appendChild(row);
        });
    }

    // Calculate Grade (now based on finalPercentage)
    function calculateGrade(percentage) {
        if (percentage === null || isNaN(percentage) || percentage === 'N/A') return 'N/A';
        if (percentage >= 90) return 'A+';
        else if (percentage >= 80) return 'A';
        else if (percentage >= 70) return 'B+';
        else if (percentage >= 60) return 'B';
        else if (percentage >= 50) return 'C';
        else return 'Needs Improvement';
    }

    // Get Status based on marks (used for both online and calculated rows)
    function getStatus(mark) {
        if (mark === null || isNaN(mark) || mark === 'N/A') return 'N/A';
        if (mark >= 90) return 'Excellent';
        if (mark >= 80) return 'Good';
        if (mark >= 70) return 'Average';
        return 'Needs Improvement';
    }

    /**
     * Shows the student profile for a given student email.
     * @param {string} email The email of the student whose profile is to be displayed.
     */
    window.showStudentProfile = function(email) {
        if (!email) {
            alert('Student email not provided.');
            return;
        }

        const profileData = STUDENT_DATA.profiles[email];
        
        if (!profileData) {
            alert('No profile data available for this student: ' + email);
            return;
        }

        // Hide all other main content sections
        window.hideAllContentSections();
        
        // Create or show profile section
        let profileSection = document.getElementById('profileSection');
        
        if (!profileSection) {
            profileSection = createProfileSection();
            document.querySelector('.container').appendChild(profileSection);
        }

        populateProfile(profileData, email); // Call populateProfile after creating/showing the section
        profileSection.style.display = 'block';
    }; // FIX: Added missing closing brace for window.showStudentProfile

    // Function to create the profile section HTML structure (was missing in previous iterations)
    function createProfileSection() {
        const section = document.createElement('div');
        section.id = 'profileSection';
        section.style.cssText = 'padding: 40px; background: #f8f9fa; display: none;'; // Hidden by default

        section.innerHTML = `
            <div class="back-btn-container" style="margin-bottom: 20px;">
                <button class="back-btn" onclick="window.backToDashboardFromProfile()" style="
                    padding: 10px 20px;
                    background: #6c757d;
                    color: white;
                    border: none;
                    border-radius: 8px;
                    cursor: pointer;
                    font-size: 0.95em;
                    font-weight: 600;
                ">⬅️ BACK TO DASHBOARD</button>
            </div>

            <div class="profile-header" style="
                background: linear-gradient(135deg, #2196f3 0%, #00bcd4 100%);
                color: white;
                padding: 30px;
                text-align: center;
                border-radius: 12px;
                margin-bottom: 30px;
                box-shadow: 0 5px 15px rgba(0,0,0,0.2);
            ">
                <div style="font-size: 3em; margin-bottom: 10px;">👤</div>
                <h2 style="font-size: 2em; margin-bottom: 10px;">Student Profile</h2>
                <p id="profile-student-name" style="font-size: 1.3em; opacity: 0.95;"></p>
                <p id="profile-student-email-display" style="font-size: 1em; opacity: 0.8;"></p>
            </div>

            <div class="profile-cards" style="
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
                gap: 20px;
            ">
                <!-- Personal Information Card -->
                <div class="profile-card" style="
                    background: white;
                    padding: 30px;
                    border-radius: 12px;
                    box-shadow: 0 5px 15px rgba(0,0,0,0.1);
                    border-left: 5px solid #4caf50;
                ">
                    <h3 style="color: #1e3c72; margin-bottom: 20px; font-size: 1.5em;">Personal Information</h3>
                    <div id="personal-info">
                        <!-- Info rows will be dynamically populated here -->
                    </div>
                </div>

                <!-- Church Information Card -->
                <div class="profile-card" style="
                    background: white;
                    padding: 30px;
                    border-radius: 12px;
                    box-shadow: 0 5px 15px rgba(0,0,0,0.1);
                    border-left: 5px solid #ff9800;
                ">
                    <h3 style="color: #1e3c72; margin-bottom: 20px; font-size: 1.5em;">Church Information</h3>
                    <div id="church-info">
                        <!-- Info rows will be dynamically populated here -->
                    </div>
                </div>

                <!-- Ministry Goals Card (full width) -->
                <div class="profile-card" style="
                    grid-column: 1 / -1; /* Make it span full width */
                    background: white;
                    padding: 30px;
                    border-radius: 12px;
                    box-shadow: 0 5px 15px rgba(0,0,0,0.1);
                    border-left: 5px solid #9c27b0;
                ">
                    <h3 style="color: #1e3c72; margin-bottom: 20px; font-size: 1.5em;">Ministry Goals / Future Plan</h3>
                    <p id="ministry-info" style="color: #333; line-height: 1.8; font-size: 1.05em;"></p>
                </div>
            </div>
        `;
        return section;
    }


// Populate Profile with Student Data
function populateProfile(profileData, email) {
    // Header - Displays name and email from STUDENT_DATA.profiles
    document.getElementById('profile-student-name').textContent = profileData.name;
    document.getElementById('profile-student-email-display').textContent = email;

    // Personal Information - Populates standard bio-data
    const personalInfo = document.getElementById('personal-info');
    personalInfo.innerHTML = `
        ${createInfoRow('📍 Address', profileData.address)}
        ${createInfoRow('📱 Mobile', profileData.mobile)}
        ${createInfoRow('🎂 Date of Birth', profileData.dob)}
        ${createInfoRow('🔢 Age', profileData.age)}
        ${createInfoRow('⚧️ Gender', profileData.gender)}
        ${createInfoRow('🎓 Education', profileData.education)}
        ${createInfoRow('💼 Occupation', profileData.occupation)}
        ${createInfoRow('💑 Marital Status', profileData.marital)}
    `;

    // Church Information - Includes dynamic reference checks
    const churchInfo = document.getElementById('church-info');
    churchInfo.innerHTML = `
        ${createInfoRow('⛪ Church', profileData.church)}
        ${createInfoRow('👨‍💼 Pastor', profileData.pastor)}
        ${createInfoRow('👤 Reference 1', profileData.reference1 || 'Not Specified')}
        ${createInfoRow('👤 Reference 2', profileData.reference2 || 'Not Specified')}
    `;

    // Ministry Goals - Pulls the 'futurePlan' field
    document.getElementById('ministry-info').textContent = profileData.futurePlan;
}

// Helper function to create info rows with consistent styling
function createInfoRow(label, value) {
    return `
        <div style="display: flex; padding: 12px 0; border-bottom: 1px solid #f0f0f0;">
            <div style="font-weight: 600; color: #666; min-width: 150px;">${label}:</div>
            <div style="color: #333; flex: 1;">${value || 'Not Specified'}</div>
        </div>
    `;
}

// --- ADMIN DASHBOARD FUNCTIONS ---

/**
 * Shows the admin dashboard and populates the student list.
 * Effectively hides other sections to ensure a clean UI.
 */
window.showAdminDashboard = function() {
    window.hideAllContentSections(); // Global function to clear current view
    document.getElementById('adminDashboard').style.display = 'block';
    populateAdminStudentList();
};

/**
 * Populates the list of students in the admin dashboard.
 */
function populateAdminStudentList() {
    const studentListContainer = document.getElementById('studentList');
    studentListContainer.innerHTML = ''; // Clear existing list

    // Get all student emails from profiles data, excluding the admin account
    const studentEmails = Object.keys(STUDENT_DATA.profiles).filter(
        email => email !== 'jlibiblecollege@gmail.com'
    );

    studentEmails.forEach(email => {
        const profile = STUDENT_DATA.profiles[email];
        const marksData = STUDENT_DATA.marks[email]; // Check for academic records

        const studentCard = document.createElement('div');
        studentCard.className = 'student-card';
        
        studentCard.innerHTML = `
            <h3>${profile ? profile.name : email}</h3>
            <p>${email}</p>
            <div class="student-card-actions">
                <button class="btn-view-profile" onclick="window.showStudentProfile('${email}')">View Profile</button>
                ${marksData && marksData.marks && marksData.marks.length > 0 ? 
                    `<button class="btn-view-marksheet" onclick="window.showMarksheet('${email}')">View Marksheet</button>` 
                    : ''}
            </div>
        `;
        studentListContainer.appendChild(studentCard);
    });
}

   // --- GLOBAL NAVIGATION FUNCTIONS ---

/**
 * Navigation for the marksheet view.
 * Redirects admin to the dashboard and students to material selection.
 */
window.backToDashboardFromMarksheet = function() {
    const marksheetSection = document.getElementById('marksheetSection');
    if (marksheetSection) marksheetSection.style.display = 'none';

    if (window.studentEmail === 'jlibiblecollege@gmail.com') {
        window.showAdminDashboard(); 
    } else {
        const pdfSelection = document.getElementById('pdfSelection');
        if (pdfSelection) pdfSelection.style.display = 'block'; 
    }
};

/**
 * Navigation for the profile view.
 * Redirects admin to the dashboard and students to material selection.
 */
window.backToDashboardFromProfile = function() {
    const profileSection = document.getElementById('profileSection');
    if (profileSection) profileSection.style.display = 'none';

    if (window.studentEmail === 'jlibiblecollege@gmail.com') {
        window.showAdminDashboard(); 
    } else {
        const pdfSelection = document.getElementById('pdfSelection');
        if (pdfSelection) pdfSelection.style.display = 'block'; 
    }
};

})();
