// admin.js
(function () {
  // Constants
  const STORAGE_KEY = "codepulse_students";
  const ADMIN_FLAG = "codepulse_admin"; // demo flag stored in sessionStorage by login page (optional)

  // Protect page: if sessionStorage not show admin flag, prompt to login
  (function protect() {
    const admin = sessionStorage.getItem(ADMIN_FLAG);
    if (admin !== "true") {
      const ok = confirm(
        "Admin not signed-in via demo flow. Continue to admin dashboard? (In production, require sign-in)"
      );
      if (!ok) {
        window.location.href = "index.html";
      }
    }
  })();

  // Utility Functions
  function escapeHtml(s) {
    if (s === null || s === undefined) return "";
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }
  function encodeKey(s) {
    return encodeURIComponent(String(s || ""));
  }
  function decodeKey(s) {
    try {
      return decodeURIComponent(s || "");
    } catch {
      return String(s || "");
    }
  }

  // Data Management
  function readStudents() {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    try {
      return JSON.parse(raw);
    } catch (e) {
      console.warn("Failed to parse students from localStorage:", e);
      return [];
    }
  }
  function writeStudents(arr) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(arr || []));
  }

  // Seed with sample if empty for convenience
  (function seed() {
    const s = readStudents();
    if (s.length === 0) {
      const demo = [
        {
          roll: "298-2030",
          name: "Shivam Maurya",
          college: "ABC College",
          branch: "CSE",
          semester: "1",
          streak: 5,
          email: "shivam@example.com",
          location: "Lucknow",
          github: "shivam",
          linkedin: "",
          codeforces: "",
          attendance: "2025-11-01:present,2025-11-02:absent",
          marks: "[]",
        },
        {
          roll: "298-2031",
          name: "Rohit Kumar",
          college: "ABC College",
          branch: "CSE",
          semester: "1",
          streak: 2,
          email: "rohit@example.com",
          location: "Lucknow",
          github: "rohit",
          linkedin: "",
          codeforces: "",
          attendance: "2025-11-01:present",
          marks: "[]",
        },
      ];
      writeStudents(demo);
    }
  })();

  // DOM Elements (may be missing on some pages — use guards)
  const tbody = document.getElementById("studentsTbody");
  const searchInput = document.getElementById("searchInput");
  const addBtn = document.getElementById("addStudentBtn");
  const exportBtn = document.getElementById("exportBtn");
  const importFile = document.getElementById("importFile");
  const logoutBtn = document.getElementById("logoutBtn");

  // modal
  const modal = document.getElementById("modal");
  const modalCard = modal ? modal.querySelector(".modal-card") : null;
  const modalCloseBtn = document.getElementById("modalCloseBtn");
  const studentForm = document.getElementById("studentForm");
  const modalTitle = document.getElementById("modalTitle");
  const deleteBtn = document.getElementById("deleteBtn");
  const cancelBtn = document.getElementById("cancelBtn");

  // form fields
  const fRoll = document.getElementById("fRoll");
  const fName = document.getElementById("fName");
  const fCollege = document.getElementById("fCollege");
  const fBranch = document.getElementById("fBranch");
  const fSemester = document.getElementById("fSemester");
  const fStreak = document.getElementById("fStreak");
  const fEmail = document.getElementById("fEmail");
  const fLocation = document.getElementById("fLocation");
  const fGithub = document.getElementById("fGithub");
  const fLinkedin = document.getElementById("fLinkedin");
  const fCodeforces = document.getElementById("fCodeforces");
  const fAttendance = document.getElementById("fAttendance");
  const fMarks = document.getElementById("fMarks");
  const fPassword = document.getElementById("fPassword");

  let editingRoll = null; // which roll is being edited

  // UI Rendering
  function attendanceBadge(att) {
    if (!att) return '<span class="muted">—</span>';
    try {
      const parts = String(att).split(",");
      const last = parts[parts.length - 1] || "";
      if (last.includes(":")) {
        const val = last.split(":")[1].trim();
        if (/present/i.test(val)) return `<span class="badge badge-present">Present</span>`;
        if (/absent/i.test(val)) return `<span class="badge badge-absent">Absent</span>`;
      }
    } catch (e) {}
    return `<span class="muted">Recorded</span>`;
  }

  function renderTable(filter = "") {
    if (!tbody) return;
    const list = readStudents();
    const q = String(filter || "").trim().toLowerCase();
    tbody.innerHTML = "";

    const filtered = list.filter((s) => {
      if (!q) return true;
      return (
        (s.roll || "").toLowerCase().includes(q) ||
        (s.name || "").toLowerCase().includes(q) ||
        (s.branch || "").toLowerCase().includes(q)
      );
    });

    if (filtered.length === 0) {
      tbody.innerHTML = `<tr><td colspan="7" class="small muted">No students found.</td></tr>`;
      return;
    }

    for (const s of filtered) {
      const tr = document.createElement("tr");
      const encoded = encodeKey(s.roll || "");
      tr.innerHTML = ` <td>${escapeHtml(s.roll || "")}</td> <td>${escapeHtml(s.name || "")}</td> <td>${escapeHtml(s.branch || "")}</td> <td>${escapeHtml(String(s.semester || ""))}</td> <td>${escapeHtml(String(s.streak || 0))}</td> <td>${attendanceBadge(s.attendance)}</td> <td>   <button class="btn" onclick="viewStudent('${encoded}')">View</button>   <button class="btn btn-primary" onclick="editStudent('${encoded}')">Edit</button>   <button class="btn btn-danger" onclick="removeStudentConfirm('${encoded}')">Delete</button> </td> `;
      tbody.appendChild(tr);
    }
  }

  // CRUD Actions
  function viewStudent(key) {
    if (!modal || !studentForm || !modalTitle) return alert("UI not ready");
    const roll = decodeKey(key);
    const student = readStudents().find((x) => x.roll === roll);
    if (!student) return alert("Student not found");
    modalTitle.textContent = `View — ${student.name} (${student.roll})`;
    fillForm(student);
    setFormReadonly(true);
    if (deleteBtn) deleteBtn.style.display = "none";
    openModal();
  }

  function editStudent(key) {
    if (!modal || !studentForm || !modalTitle) return alert("UI not ready");
    const roll = decodeKey(key);
    const student = readStudents().find((x) => x.roll === roll);
    if (!student) return alert("Student not found");
    modalTitle.textContent = `Edit — ${student.name} (${student.roll})`;
    fillForm(student);
    setFormReadonly(false);
    editingRoll = student.roll;
    if (deleteBtn) deleteBtn.style.display = "inline-block";
    openModal();
  }

  function addStudent() {
    if (!modal || !studentForm || !modalTitle) return alert("UI not ready");
    modalTitle.textContent = "Add New Student";
    studentForm.reset();
    setFormReadonly(false);
    editingRoll = null;
    if (deleteBtn) deleteBtn.style.display = "none";
    openModal();
  }

  function fillForm(s) {
    if (!studentForm) return;
    if (fRoll) fRoll.value = s.roll || "";
    if (fName) fName.value = s.name || "";
    if (fCollege) fCollege.value = s.college || "";
    if (fBranch) fBranch.value = s.branch || "";
    if (fSemester) fSemester.value = s.semester || "";
    if (fStreak) fStreak.value = s.streak || 0;
    if (fEmail) fEmail.value = s.email || "";
    if (fLocation) fLocation.value = s.location || "";
    if (fGithub) fGithub.value = s.github || "";
    if (fLinkedin) fLinkedin.value = s.linkedin || "";
    if (fCodeforces) fCodeforces.value = s.codeforces || "";
    if (fAttendance) fAttendance.value = s.attendance || "";
    if (fMarks) fMarks.value = s.marks || "[]";
    if (fPassword) fPassword.value = s.password || "";
  }

  function setFormReadonly(flag) {
    if (!studentForm) return;
    const inputs = studentForm.querySelectorAll("input, textarea, select");
    inputs.forEach((i) => {
      try {
        i.disabled = flag;
      } catch (e) {}
    });
    const submitBtn = studentForm.querySelector('button[type="submit"]');
    if (submitBtn) submitBtn.style.display = flag ? "none" : "inline-block";
  }

  function removeStudentConfirm(key) {
    const roll = decodeKey(key);
    if (!confirm(`Delete student ${roll}? This cannot be undone.`)) return;
    removeStudent(roll);
  }

  function removeStudent(roll) {
    const arr = readStudents().filter((x) => x.roll !== roll);
    writeStudents(arr);
    renderTable(searchInput ? searchInput.value : "");
    closeModal();
  }

  // Event Handlers for studentForm submission
  if (studentForm) {
    studentForm.addEventListener("submit", function (e) {
      e.preventDefault();

      const roll = fRoll ? fRoll.value.trim() : "";
      const name = fName ? fName.value.trim() : "";
      const college = fCollege ? fCollege.value.trim() : "";
      const branch = fBranch ? fBranch.value.trim() : "";
      const semester = fSemester ? fSemester.value.trim() : "";
      const streak = fStreak ? Number(fStreak.value) || 0 : 0;
      const email = fEmail ? fEmail.value.trim() : "";
      const location = fLocation ? fLocation.value.trim() : "";
      const github = fGithub ? fGithub.value.trim() : "";
      const linkedin = fLinkedin ? fLinkedin.value.trim() : "";
      const codeforces = fCodeforces ? fCodeforces.value.trim() : "";
      const attendance = fAttendance ? fAttendance.value.trim() : "";
      const marks = fMarks ? fMarks.value.trim() : "[]";
      const password = fPassword ? fPassword.value : "";

      if (!roll || !name) {
        alert("Roll and Name are required.");
        return;
      }

      const students = readStudents();

      if (editingRoll) {
        if (roll !== editingRoll && students.some((s) => s.roll === roll)) {
          alert("Student with this roll number already exists.");
          return;
        }
        const idx = students.findIndex((s) => s.roll === editingRoll);
        if (idx !== -1) {
          students[idx] = {
            ...students[idx],  roll,  name,  college,  branch,  semester,  streak,  email,  location,  github,  linkedin,  codeforces,  attendance,  marks,  password };
        } else {
          students.push({ roll, name, college, branch, semester, streak, email, location, github, linkedin, codeforces, attendance, marks, password });
        }
      } else {
        if (students.some((s) => s.roll === roll)) {
          alert("Student already exists.");
          return;
        }
        students.push({ roll,  name,  college,  branch,  semester,  streak,  email,  location,  github,  linkedin,  codeforces,  attendance,  marks,  password,});
      }

      writeStudents(students);
      renderTable(searchInput ? searchInput.value || "" : "");
      closeModal();
    });
  }

  // delete button in modal
  if (deleteBtn) {
    deleteBtn.addEventListener("click", function () {
      if (!editingRoll) return;
      if (!confirm("Delete this student?")) return;
      removeStudent(editingRoll);
    });
  }

  // cancel
  if (cancelBtn) {
    cancelBtn.addEventListener("click", closeModal);
  }

  // Modal open/close + accessibility helpers
  function openModal() {
    if (!modal) return;
    modal.style.display = "flex";
    modal.setAttribute("aria-hidden", "false");
    // small delay to allow animations if any
    setTimeout(() => {
      // focus first input if present
      const first = studentForm ? studentForm.querySelector("input:not([disabled])") : null;
      if (first) first.focus();
      // attach document-level listeners
      document.addEventListener("keydown", onDocumentKeyDown);
      document.addEventListener("click", onDocumentClick);
    }, 60);
  }

  function closeModal() {
    if (!modal || !studentForm) return;
    modal.style.display = "none";
    modal.setAttribute("aria-hidden", "true");
    // clear fields after a short timeout (so visual close can animate)
    setTimeout(() => {
      studentForm.reset();
      editingRoll = null;
      setFormReadonly(false);
      // remove document-level listeners
      document.removeEventListener("keydown", onDocumentKeyDown);
      document.removeEventListener("click", onDocumentClick);
    }, 160);
  }

  // Close on ESC
  function onDocumentKeyDown(e) {
    if (e.key === "Escape" || e.key === "Esc") {
      closeModal();
    }
  }

  // Close when clicking outside modal card
  function onDocumentClick(e) {
    if (!modal || !modalCard) return;
    if (!modal.contains(e.target)) return;
    // if click target is the modal backdrop (not inside modalCard), close
    if (e.target === modal) {
      closeModal();
    } else {
      // if clicked outside modalCard but still inside modal (rare), check ancestors
      if (!modalCard.contains(e.target)) closeModal();
    }
  }

  // Close modal on cross button click
  if (modalCloseBtn) {
    modalCloseBtn.addEventListener("click", closeModal);
  }

  // Import / Export
  if (exportBtn) {
    exportBtn.addEventListener("click", function () {
      const arr = readStudents();
      const blob = new Blob([JSON.stringify(arr, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "codepulse_students.json";
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    });
  }

  if (importFile) {
    importFile.addEventListener("change", function (ev) {
      const file = ev.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = function (e) {
        try {
          const imported = JSON.parse(e.target.result);
          if (!Array.isArray(imported)) throw new Error("Invalid JSON format (expected array)");
          // merge imported (avoid duplicates by roll)
          const cur = readStudents();
          const merged = [...cur];
          for (const s of imported) {
            if (!s || !s.roll) continue;
            const idx = merged.findIndex((x) => x.roll === s.roll);
            if (idx === -1) merged.push(s);
            else merged[idx] = s; // overwrite
          }
          writeStudents(merged);
          renderTable(searchInput ? searchInput.value : "");
          alert("Import successful");
        } catch (ex) {
          alert("Import failed: " + (ex && ex.message ? ex.message : ex));
        }
      };
      reader.readAsText(file);
      // reset input so same file can be selected again
      ev.target.value = "";
    });
  }

  // Search & events
  if (searchInput) {
    searchInput.addEventListener("input", () => renderTable(searchInput.value));
  }
  if (addBtn) {
    addBtn.addEventListener("click", addStudent);
  }

  // logout (demo)
  if (logoutBtn) {
    logoutBtn.addEventListener("click", function () {
      sessionStorage.removeItem(ADMIN_FLAG);
      alert("Logged out (demo). Redirecting to login.");
      window.location.href = "index.html";
    });
  }

  // Seat Grid
  (function () {
    const $ = (sel) => document.querySelector(sel);

    const yearSelect = $("#yearSelect");
    const sectionSelect = $("#sectionSelect");
    const generateSeatsBtn = $("#generateSeatsBtn");
    const seatGridContainer = $("#seatGridContainer");

    function populateYearOptions() {
      if (!yearSelect) return;
      const years = [];
      for (let y = 2023; y <= 2028; y++) years.push(`${y}-${y + 4}`);
      yearSelect.innerHTML = "";
      years.forEach((y) => {
        const opt = document.createElement("option");
        opt.value = y;
        opt.textContent = y;
        yearSelect.appendChild(opt);
      });
    }

    function populateSectionOptions() {
      if (!sectionSelect) return;
      sectionSelect.innerHTML = "";
      for (let i = 1; i <= 30; i++) {
        const opt = document.createElement("option");
        opt.value = `CSE-${i}`;
        opt.textContent = `CSE ${i}`;
        sectionSelect.appendChild(opt);
      }
    }

    function renderSeatGrid(year, section) {
      if (!seatGridContainer) return;
      const students = readStudents();

      seatGridContainer.innerHTML = "";
      const grid = document.createElement("div");
      grid.className = "seat-grid";

      for (let seat = 1; seat <= 30; seat++) {
        const roll = `${year}_${section}_${String(seat).padStart(2, "0")}`;
        const student = students.find((s) => s.roll === roll);
        const tile = document.createElement("div");
        tile.className = "seat-tile " + (student ? "occupied" : "empty");
        tile.dataset.roll = roll;

        const rEl = document.createElement("div");
        rEl.className = "seat-roll";
        rEl.textContent = seat;

        const nEl = document.createElement("div");
        nEl.className = "seat-name";
        nEl.textContent = student ? `${student.name || "Student"} (${student.section || ""})` : "Empty";

        tile.appendChild(rEl);
        tile.appendChild(nEl);

        // Click -> open modal to add/edit
        tile.addEventListener("click", () => {
          if (sessionStorage.getItem(ADMIN_FLAG) !== "true") {
            alert("Only admins can add/edit students.");
            return;
          }

          const existing = students.find((s) => s.roll === roll);
          if (existing) {
            // Edit mode
            modalTitle && (modalTitle.textContent = `Edit — ${existing.name} (${existing.roll})`);
            editingRoll = existing.roll;
            if (deleteBtn) deleteBtn.style.display = "inline-block";
          } else {
            // Add mode
            modalTitle && (modalTitle.textContent = "Add New Student");
            editingRoll = null;
            if (deleteBtn) deleteBtn.style.display = "none";
            studentForm && studentForm.reset();
          }

          // Fill form
          if (fRoll) fRoll.value = roll;
          if (fName) fName.value = existing ? existing.name || "" : "";
          if (fCollege) fCollege.value = existing ? existing.college || "" : "";
          if (fBranch) fBranch.value = existing ? existing.branch || "" : "";
          if (fSemester) fSemester.value = existing ? existing.semester || "" : "";
          if (fStreak) fStreak.value = existing ? existing.streak || 0 : "";
          if (fEmail) fEmail.value = existing ? existing.email || "" : "";
          if (fLocation) fLocation.value = existing ? existing.location || "" : "";
          if (fGithub) fGithub.value = existing ? existing.github || "" : "";
          if (fLinkedin) fLinkedin.value = existing ? existing.linkedin || "" : "";
          if (fCodeforces) fCodeforces.value = existing ? existing.codeforces || "" : "";
          if (fAttendance) fAttendance.value = existing ? existing.attendance || "" : "";
          if (fMarks) fMarks.value = existing ? existing.marks || "[]" : "[]";
          if (fPassword) fPassword.value = existing ? existing.password || "" : "";

          setFormReadonly(false);
          openModal();
        });

        grid.appendChild(tile);
      }

      seatGridContainer.appendChild(grid);
    }

    if (generateSeatsBtn) {
      generateSeatsBtn.addEventListener("click", () => {
        renderSeatGrid(yearSelect ? yearSelect.value : "", sectionSelect ? sectionSelect.value : "");
      });
    }

    populateYearOptions();
    populateSectionOptions();

    // On initial load render grid if container present and selects exist
    document.addEventListener("DOMContentLoaded", () => {
      if (yearSelect && sectionSelect && seatGridContainer) {
        renderSeatGrid(yearSelect.value, sectionSelect.value);
      }
    });
  })();

  // Initialization
  renderTable();

  // quick view / edit functions must be available globally for inline onclick in table rows
  window.viewStudent = viewStudent;
  window.editStudent = editStudent;
  window.removeStudentConfirm = removeStudentConfirm;
})();
