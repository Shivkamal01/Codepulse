// Function to populate attendance page with student data from localStorage
function populateAttendancePage() {
  const storedRoll = sessionStorage.getItem('codepulse_student');
  const raw = localStorage.getItem('codepulse_students');
  const students = raw ? JSON.parse(raw) : [];
  const student = students.find(s => s.roll === storedRoll);

  if (!student) {
    console.warn("Student not found in localStorage for attendance page.");
    return;
  }

  // Populate profile section
  document.getElementById("attendanceName").textContent = student.name;
  document.getElementById("attendanceRoll").textContent = student.roll;
  document.getElementById("attendanceCollege").textContent = student.college || "Not provided";
  document.getElementById("attendanceBranch").textContent = student.branch || "Not provided";
  document.getElementById("attendanceSemester").textContent = student.semester || "Not provided";
  document.getElementById("attendanceStreak").textContent = student.streak || 0;
  document.getElementById("attendanceEmail").textContent = student.email || "Not provided";
  document.getElementById("attendanceLocation").textContent = student.location || "Not provided";

  // Parse attendance data and group by subject
  const subjectData = {};
  let totalPresent = 0;
  let totalDays = 0;

  if (student.attendance) {
    const attendanceRecords = student.attendance.split(',');
    attendanceRecords.forEach(record => {
      const parts = record.split(':');
      if (parts.length >= 3) {
        const date = parts[0].trim();
        const subject = parts[1].trim();
        const status = parts[2].trim().toLowerCase();

        if (!subjectData[subject]) {
          subjectData[subject] = { present: 0, absent: 0, dates: [] };
        }

        if (status === 'present') {
          subjectData[subject].present++;
          totalPresent++;
        } else if (status === 'absent') {
          subjectData[subject].absent++;
        }

        subjectData[subject].dates.push({ date, status });
        totalDays++;
      }
    });
  }

  // Calculate overall attendance percentage
  const overallPercentage = totalDays > 0 ? Math.round((totalPresent / totalDays) * 100) : 0;

  // Update overall attendance circle
  const overallCircle = document.getElementById('overallAttendance');
  if (overallCircle) {
    overallCircle.setAttribute('data-value', overallPercentage);
    overallCircle.style.setProperty('--percentage', overallPercentage);
  }

  // Update overall attendance stats
  const overallStats = document.getElementById('overallStats');
  if (overallStats) {
    overallStats.innerHTML = `
      <p><strong>Total Classes:</strong> <span class="total">${totalDays}</span></p>
      <p><strong>Present:</strong> <span class="present">${totalPresent}</span></p>
      <p><strong>Absent:</strong> <span class="absent">${totalDays - totalPresent}</span></p>
    `;
  }

  // Populate subject-wise attendance dynamically
  const subjectsList = document.getElementById('subjectsList');
  if (subjectsList) {
    subjectsList.innerHTML = '';
    Object.keys(subjectData).forEach(subject => {
      const data = subjectData[subject];
      const total = data.present + data.absent;
      const percentage = total > 0 ? Math.round((data.present / total) * 100) : 0;

      const subjectDiv = document.createElement('div');
      subjectDiv.className = 'subject';
      subjectDiv.innerHTML = `
        <label>${subject}</label>
        <div class="progress-circle" data-value="${percentage}"></div>
        <div class="attendance-stats">
          <p><strong>Total:</strong> <span class="total">${total}</span></p>
          <p><strong>Present:</strong> <span class="present">${data.present}</span></p>
          <p><strong>Absent:</strong> <span class="absent">${data.absent}</span></p>
        </div>
      `;
      const circle = subjectDiv.querySelector('.progress-circle');
      circle.style.setProperty('--percentage', percentage);
      subjectDiv.addEventListener('click', () => showSubjectDetails(subject, data));
      subjectsList.appendChild(subjectDiv);
    });
  }
}

// Function to toggle subject-wise attendance view
function toggleSubjectWise() {
  const subjectWise = document.getElementById('subjectWiseAttendance');
  const button = document.getElementById('toggleSubjects');

  if (subjectWise.style.display === 'none') {
    subjectWise.style.display = 'block';
    button.textContent = 'Hide Subject-wise Attendance';
  } else {
    subjectWise.style.display = 'none';
    button.textContent = 'View Subject-wise Attendance';
  }
}

// Function to show subject details in a modal
function showSubjectDetails(subject, data) {
  // Create modal if not exists
  let modal = document.getElementById('subjectModal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'subjectModal';
    modal.className = 'modal';
    modal.innerHTML = `
      <div class="modal-card">
        <h2 id="subjectTitle"></h2>
        <div id="subjectDetails"></div>
        <button onclick="closeSubjectModal()">Close</button>
      </div>
    `;
    document.body.appendChild(modal);
  }

  const total = data.present + data.absent;
  const percentage = total > 0 ? Math.round((data.present / total) * 100) : 0;

  document.getElementById('subjectTitle').textContent = `${subject} Attendance Details`;
  const detailsDiv = document.getElementById('subjectDetails');
  detailsDiv.innerHTML = `
    <div style="text-align: center; margin-bottom: 1rem;">
      <div class="progress-circle" data-value="${percentage}" style="width: 120px; height: 120px;"></div>
      <div class="attendance-stats" style="margin-top: 1rem;">
        <p><strong>Total Classes:</strong> <span class="total">${total}</span></p>
        <p><strong>Present:</strong> <span class="present">${data.present}</span></p>
        <p><strong>Absent:</strong> <span class="absent">${data.absent}</span></p>
      </div>
    </div>
    <h3>Dates:</h3>
    <ul>
      ${data.dates.map(d => `<li class="${d.status.toLowerCase()}">${d.date}: ${d.status}</li>`).join('')}
    </ul>
  `;

  modal.style.display = 'flex';
}

// Function to close subject modal
function closeSubjectModal() {
  const modal = document.getElementById('subjectModal');
  if (modal) {
    modal.style.display = 'none';
  }
}

// Grades data for subjects
const subjectGrades = {
  "Mathematics": "A",
  "Physics": "B+",
  "Chemistry": "A-",
  "Computer Science": "A",
  "Data Structures": "B",
  "Algorithms": "A",
  "Operating Systems": "B+"
};

// Timetable data for each day
const timetables = {
  monday: [
    { time: "9:00 AM - 10:00 AM", subject: "Mathematics", code: "MA101", type: "Lecture" },
    { time: "10:00 AM - 11:00 AM", subject: "Physics", code: "PH101", type: "Lecture" },
    { time: "11:00 AM - 12:00 PM", subject: "Chemistry", code: "CH101", type: "Lecture" },
    { time: "12:00 PM - 1:00 PM", subject: "Computer Science", code: "CS101", type: "Lab" },
    { time: "1:00 PM - 2:00 PM", subject: "Lunch Break", code: "", type: "" },
    { time: "2:00 PM - 3:00 PM", subject: "Data Structures", code: "CS201", type: "Lecture" },
    { time: "3:00 PM - 4:00 PM", subject: "Algorithms", code: "CS202", type: "Tutorial" },
    { time: "4:00 PM - 5:00 PM", subject: "Operating Systems", code: "CS301", type: "Lecture" }
  ],
  tuesday: [
    { time: "9:00 AM - 10:00 AM", subject: "Chemistry", code: "CH101", type: "Lecture" },
    { time: "10:00 AM - 11:00 AM", subject: "Mathematics", code: "MA101", type: "Tutorial" },
    { time: "11:00 AM - 12:00 PM", subject: "Physics", code: "PH101", type: "Lab" },
    { time: "12:00 PM - 1:00 PM", subject: "Computer Science", code: "CS101", type: "Lecture" },
    { time: "1:00 PM - 2:00 PM", subject: "Lunch Break", code: "", type: "" },
    { time: "2:00 PM - 3:00 PM", subject: "Algorithms", code: "CS202", type: "Lecture" },
    { time: "3:00 PM - 4:00 PM", subject: "Data Structures", code: "CS201", type: "Lab" },
    { time: "4:00 PM - 5:00 PM", subject: "Operating Systems", code: "CS301", type: "Tutorial" }
  ],
  wednesday: [
    { time: "9:00 AM - 10:00 AM", subject: "Physics", code: "PH101", type: "Lecture" },
    { time: "10:00 AM - 11:00 AM", subject: "Chemistry", code: "CH101", type: "Tutorial" },
    { time: "11:00 AM - 12:00 PM", subject: "Mathematics", code: "MA101", type: "Lab" },
    { time: "12:00 PM - 1:00 PM", subject: "Data Structures", code: "CS201", type: "Lecture" },
    { time: "1:00 PM - 2:00 PM", subject: "Lunch Break", code: "", type: "" },
    { time: "2:00 PM - 3:00 PM", subject: "Computer Science", code: "CS101", type: "Tutorial" },
    { time: "3:00 PM - 4:00 PM", subject: "Operating Systems", code: "CS301", type: "Lecture" },
    { time: "4:00 PM - 5:00 PM", subject: "Algorithms", code: "CS202", type: "Lab" }
  ],
  thursday: [
    { time: "9:00 AM - 10:00 AM", subject: "Mathematics", code: "MA101", type: "Lecture" },
    { time: "10:00 AM - 11:00 AM", subject: "Physics", code: "PH101", type: "Tutorial" },
    { time: "11:00 AM - 12:00 PM", subject: "Chemistry", code: "CH101", type: "Lab" },
    { time: "12:00 PM - 1:00 PM", subject: "Algorithms", code: "CS202", type: "Lecture" },
    { time: "1:00 PM - 2:00 PM", subject: "Lunch Break", code: "", type: "" },
    { time: "2:00 PM - 3:00 PM", subject: "Operating Systems", code: "CS301", type: "Tutorial" },
    { time: "3:00 PM - 4:00 PM", subject: "Data Structures", code: "CS201", type: "Lab" },
    { time: "4:00 PM - 5:00 PM", subject: "Computer Science", code: "CS101", type: "Lecture" }
  ],
  friday: [
    { time: "9:00 AM - 10:00 AM", subject: "Chemistry", code: "CH101", type: "Lecture" },
    { time: "10:00 AM - 11:00 AM", subject: "Mathematics", code: "MA101", type: "Tutorial" },
    { time: "11:00 AM - 12:00 PM", subject: "Physics", code: "PH101", type: "Lab" },
    { time: "12:00 PM - 1:00 PM", subject: "Operating Systems", code: "CS301", type: "Lecture" },
    { time: "1:00 PM - 2:00 PM", subject: "Lunch Break", code: "", type: "" },
    { time: "2:00 PM - 3:00 PM", subject: "Algorithms", code: "CS202", type: "Tutorial" },
    { time: "3:00 PM - 4:00 PM", subject: "Data Structures", code: "CS201", type: "Lab" },
    { time: "4:00 PM - 5:00 PM", subject: "Computer Science", code: "CS101", type: "Lecture" }
  ],
  saturday: [
    { time: "9:00 AM - 10:00 AM", subject: "Physics", code: "PH101", type: "Lecture" },
    { time: "10:00 AM - 11:00 AM", subject: "Chemistry", code: "CH101", type: "Tutorial" },
    { time: "11:00 AM - 12:00 PM", subject: "Mathematics", code: "MA101", type: "Lab" },
    { time: "12:00 PM - 1:00 PM", subject: "Data Structures", code: "CS201", type: "Lecture" },
    { time: "1:00 PM - 2:00 PM", subject: "Lunch Break", code: "", type: "" },
    { time: "2:00 PM - 3:00 PM", subject: "Computer Science", code: "CS101", type: "Tutorial" },
    { time: "3:00 PM - 4:00 PM", subject: "Operating Systems", code: "CS301", type: "Lab" },
    { time: "4:00 PM - 5:00 PM", subject: "Algorithms", code: "CS202", type: "Lecture" }
  ]
};

// Function to load timetable based on selected day
function loadTimetable() {
  const daySelect = document.getElementById('daySelect');
  const selectedDay = daySelect.value;
  const timetableContent = document.getElementById('timetableContent');

  const periods = timetables[selectedDay];
  timetableContent.innerHTML = '';

  periods.forEach(period => {
    const periodDiv = document.createElement('div');
    periodDiv.className = 'period-item';

    // Get quiz marks for the subject if available
    let quizMarkText = '';
    const storedRoll = sessionStorage.getItem('codepulse_student');
    const raw = localStorage.getItem('codepulse_students');
    const students = raw ? JSON.parse(raw) : [];
    const student = students.find(s => s.roll === storedRoll);
    if (student && student.marks) {
      try {
        const marksArray = JSON.parse(student.marks);
        const subjectMark = marksArray.find(m => m.subject === period.subject);
        if (subjectMark) {
          quizMarkText = ` - Quiz: ${subjectMark.marks}/100`;
        }
      } catch (e) {
        console.warn("Error parsing marks for timetable", e);
      }
    }

    periodDiv.innerHTML = `
      <div class="period-time">${period.time}</div>
      <div class="period-details">
        <strong>${period.subject}</strong>
        ${period.code ? ` (${period.code})` : ''}
        ${period.type ? ` - ${period.type}` : ''}
        ${quizMarkText}
      </div>
    `;
    timetableContent.appendChild(periodDiv);
  });

  loadGrades(selectedDay);
}

// Function to load grades for subjects in the timetable
function loadGrades(day) {
  const gradesContent = document.getElementById('gradesContent');
  const periods = timetables[day];
  const subjects = [...new Set(periods.map(p => p.subject).filter(s => s !== 'Lunch Break'))];

  gradesContent.innerHTML = '';
  subjects.forEach(subject => {
    const grade = subjectGrades[subject] || 'N/A';
    const li = document.createElement('li');
    li.innerHTML = `<strong>${subject}:</strong> ${grade}`;
    gradesContent.appendChild(li);
  });
}

// Function to populate quiz marks section dynamically
function populateQuizMarks() {
  const storedRoll = sessionStorage.getItem('codepulse_student');
  const raw = localStorage.getItem('codepulse_students');
  const students = raw ? JSON.parse(raw) : [];
  const student = students.find(s => s.roll === storedRoll);

  const quizMarksContent = document.getElementById('quizMarksContent');
  quizMarksContent.innerHTML = '';

  if (!student || !student.marks) {
    quizMarksContent.innerHTML = '<li>No quiz marks available.</li>';
    return;
  }

  try {
    const marksArray = JSON.parse(student.marks);
    if (marksArray.length === 0) {
      quizMarksContent.innerHTML = '<li>No quiz marks available.</li>';
      return;
    }

    marksArray.forEach(mark => {
      const li = document.createElement('li');
      li.innerHTML = `<strong>${mark.subject}:</strong> ${mark.marks}/100`;
      quizMarksContent.appendChild(li);
    });
  } catch (e) {
    console.warn("Error parsing marks for student", student.roll, e);
    quizMarksContent.innerHTML = '<li>Error loading quiz marks.</li>';
  }
}

// Call populateAttendancePage on page load
window.onload = function() {
  populateAttendancePage();
  populateQuizMarks(); // Populate quiz marks dynamically
  loadTimetable(); // Load default timetable (Monday)
};
