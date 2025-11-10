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

  // Calculate overall attendance percentage
  let overallPercentage = 78; // Default mock value
  if (student.attendance) {
    // Parse attendance data (assuming CSV format: date:status,date:status,...)
    const attendanceRecords = student.attendance.split(',');
    let totalDays = attendanceRecords.length;
    let presentDays = 0;

    attendanceRecords.forEach(record => {
      const [date, status] = record.split(':');
      if (date && status && status.trim().toLowerCase() === 'present') {
        presentDays++;
      }
    });

    if (totalDays > 0) {
      overallPercentage = Math.round((presentDays / totalDays) * 100);
    }
  }

  // Update overall attendance circle
  const overallCircle = document.getElementById('overallAttendance');
  if (overallCircle) {
    overallCircle.setAttribute('data-value', overallPercentage);
    overallCircle.style.setProperty('--percentage', overallPercentage);
  }

  // Calculate attendance percentages for subjects (mock calculation based on overall)
  const subjects = ['Engineering Graphics', 'Mathematical Engineering', 'Data Structures', 'Algorithms', 'Operating Systems'];
  subjects.forEach((subject, index) => {
    // Vary subject percentages around the overall percentage
    const variation = (Math.random() - 0.5) * 20; // Random variation between -10% and +10%
    const subjectPercentage = Math.max(0, Math.min(100, Math.round(overallPercentage + variation)));
    const progressCircle = document.querySelectorAll('.progress-circle')[index + 1]; // Skip overall circle
    if (progressCircle) {
      progressCircle.setAttribute('data-value', subjectPercentage);
      progressCircle.style.setProperty('--percentage', subjectPercentage);
    }
  });
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

// Call populateAttendancePage on page load
window.onload = function() {
  populateAttendancePage();
};
