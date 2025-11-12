function showStudentLogin() {
  document.getElementById("loginChoice").style.display = "none";
  document.getElementById("studentLoginForm").style.display = "block";
  document.getElementById("studentLoginForm").classList.add("fade-in");
}
function showAdminLogin() {
  document.getElementById("loginChoice").style.display = "none";
  document.getElementById("adminLoginForm").style.display = "block";
  document.getElementById("adminLoginForm").classList.add("fade-in");
}
function goBack() {
  document.getElementById("loginChoice").style.display = "flex";
  document.getElementById("studentLoginForm").style.display = "none";
  document.getElementById("adminLoginForm").style.display = "none";
  document.getElementById("studentError").style.display = "none";
  document.getElementById("adminError").style.display = "none";
}

document.getElementById("studentLoginForm").addEventListener("submit", function (e) {
  e.preventDefault();
  const username = document.getElementById("studentUsername").value.trim(); // roll number
  const password = document.getElementById("studentPassword").value.trim();
  const error = document.getElementById("studentError");

  if (!username || !password) {
    error.textContent = "Please enter Roll Number and Password.";
    error.style.display = "block";
    return;
  }

  const raw = localStorage.getItem('codepulse_students');
  const students = raw ? JSON.parse(raw) : [];
  const student = students.find(s => s.roll === username);

  if (!student) {
    error.textContent = "Student not found. Ask admin to add user.";
    error.style.display = "block";
    return;
  }

  if (student.password !== password) {
    error.textContent = "Incorrect password.";
    error.style.display = "block";
    return;
  }

  // Success
  sessionStorage.setItem("codepulse_student", student.roll);
  sessionStorage.setItem("codepulse_role", "student");
  alert("Login Successful! Redirecting...");
  window.location.href = "dashboard.html";
});


// --- Admin Login Logic ---
document.getElementById("adminLoginForm").addEventListener("submit", function (e) {
  e.preventDefault();
  const username = document.getElementById("adminUsername").value.trim();
  const password = document.getElementById("adminPassword").value.trim();
  const error = document.getElementById("adminError");
  if (!username || !password) {
    error.textContent = "Please enter Admin ID and Password.";
    error.style.display = "block";
    return;
  }
  // Demo check (replace with backend)
  if (username === "admin" && password === "admin") {
      sessionStorage.setItem("codepulse_admin", "true");
       sessionStorage.setItem("codepulse_role", "admin");
    alert("Admin Login Successful! Redirecting...");
    window.location.href = "admin.html";
  } else {
    error.textContent = "Invalid Admin credentials.";
    error.style.display = "block";
  }
});