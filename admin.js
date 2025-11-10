const STORAGE_KEY = "codepulse_students";
      const ADMIN_FLAG = "codepulse_admin"; // demo flag stored in sessionStorage by login page (optional)

      // Protect page: if sessionStorage not show admin flag, prompt to login
      (function protect() {
        const admin = sessionStorage.getItem(ADMIN_FLAG);
        // if your login page didn't set this, you can comment out next lines.
        if (admin !== "true") {
          // Optional: allow access when not set (for dev). We'll still show a confirm.
          const ok = confirm(
            "Admin not signed-in via demo flow. Continue to admin dashboard? (In production, require sign-in)"
          );
          if (!ok) {
            window.location.href = "login.html";
          }
        }
      })();

      // --- Data CRUD ---
      function readStudents() {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return [];
        try {
          return JSON.parse(raw);
        } catch (e) {
          return [];
        }
      }
      function writeStudents(arr) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(arr));
      }

      // seed with sample if empty for convenience
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

      // --- DOM elements ---
      const tbody = document.getElementById("studentsTbody");
      const searchInput = document.getElementById("searchInput");
      const addBtn = document.getElementById("addStudentBtn");
      const exportBtn = document.getElementById("exportBtn");
      const importFile = document.getElementById("importFile");
      const logoutBtn = document.getElementById("logoutBtn");

      // modal
      const modal = document.getElementById("modal");
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

      let editingRoll = null; // which roll is being edited

      // --- Render table ---
      function renderTable(filter = "") {
        const list = readStudents();
        const q = filter.trim().toLowerCase();
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
          tr.innerHTML = `
      <td>${escapeHtml(s.roll || "")}</td>
      <td>${escapeHtml(s.name || "")}</td>
      <td>${escapeHtml(s.branch || "")}</td>
      <td>${escapeHtml(s.semester || "")}</td>
      <td>${escapeHtml(String(s.streak || 0))}</td>
      <td>${attendanceBadge(s.attendance)}</td>
      <td>
        <button class="btn" onclick="viewStudent('${encodeKey(
          s.roll
        )}')">View</button>
        <button class="btn btn-primary" onclick="editStudent('${encodeKey(
          s.roll
        )}')">Edit</button>
        <button class="btn btn-danger" onclick="removeStudentConfirm('${encodeKey(
          s.roll
        )}')">Delete</button>
      </td>
    `;
          tbody.appendChild(tr);
        }
      }

      function attendanceBadge(att) {
        if (!att) return '<span class="muted">—</span>';
        // simple parse: if last entry present -> present badge
        try {
          const parts = att.split(",");
          const last = parts[parts.length - 1];
          if (last.includes(":")) {
            const val = last.split(":")[1].trim();
            if (/present/i.test(val))
              return `<span class="badge badge-present">Present</span>`;
            if (/absent/i.test(val))
              return `<span class="badge badge-absent">Absent</span>`;
          }
        } catch (e) {}
        return `<span class="muted">Recorded</span>`;
      }

      // --- Helpers ---
      function escapeHtml(s) {
        if (!s) return "";
        return String(s).replace(
          /[&<>"]/g,
          (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c])
        );
      }
      function encodeKey(s) {
        return encodeURIComponent(String(s || ""));
      }
      function decodeKey(s) {
        return decodeURIComponent(s || "");
      }

      // --- CRUD actions ---
      function viewStudent(key) {
        const roll = decodeKey(key);
        const student = readStudents().find((x) => x.roll === roll);
        if (!student) return alert("Student not found");
        // populate a readonly view by filling fields but disabling them
        modalTitle.textContent = `View — ${student.name} (${student.roll})`;
        fillForm(student);
        setFormReadonly(true);
        deleteBtn.style.display = "none";
        modal.style.display = "flex";
      }

      function editStudent(key) {
        const roll = decodeKey(key);
        const student = readStudents().find((x) => x.roll === roll);
        if (!student) return alert("Student not found");
        modalTitle.textContent = `Edit — ${student.name} (${student.roll})`;
        fillForm(student);
        setFormReadonly(false);
        editingRoll = student.roll;
        deleteBtn.style.display = "inline-block";
        modal.style.display = "flex";
      }

      function addStudent() {
        modalTitle.textContent = "Add New Student";
        studentForm.reset();
        setFormReadonly(false);
        editingRoll = null;
        deleteBtn.style.display = "none";
        modal.style.display = "flex";
      }

      function fillForm(s) {
        fRoll.value = s.roll || "";
        fName.value = s.name || "";
        fCollege.value = s.college || "";
        fBranch.value = s.branch || "";
        fSemester.value = s.semester || "";
        fStreak.value = s.streak || 0;
        fEmail.value = s.email || "";
        fLocation.value = s.location || "";
        fGithub.value = s.github || "";
        fLinkedin.value = s.linkedin || "";
        fCodeforces.value = s.codeforces || "";
        fAttendance.value = s.attendance || "";
        fMarks.value = s.marks || "[]";
      }

      function setFormReadonly(flag) {
        const inputs = studentForm.querySelectorAll("input");
        inputs.forEach((i) => (i.disabled = flag));
        studentForm.querySelector('button[type="submit"]').style.display = flag
          ? "none"
          : "inline-block";
      }

      function removeStudentConfirm(key) {
        const roll = decodeKey(key);
        if (!confirm(`Delete student ${roll}? This cannot be undone.`)) return;
        removeStudent(roll);
      }

      function removeStudent(roll) {
        const arr = readStudents().filter((x) => x.roll !== roll);
        writeStudents(arr);
        renderTable(searchInput.value);
        closeModal();
      }


      studentForm.addEventListener("submit", function (e) {
        e.preventDefault();

        const roll = fRoll.value.trim();
        const name = fName.value.trim();
        const college = fCollege.value.trim();
        const branch = fBranch.value.trim();
        const semester = fSemester.value.trim();
        const streak = Number(fStreak.value) || 0;
        const email = fEmail.value.trim();
        const location = fLocation.value.trim();
        const github = fGithub.value.trim();
        const linkedin = fLinkedin.value.trim();
        const codeforces = fCodeforces.value.trim();
        const attendance = fAttendance.value.trim();
        const marks = fMarks.value.trim();
        const password = document.getElementById("fPassword").value; // new line

        if (!roll || !name) {
          alert("Roll and Name are required.");
          return;
        }

        const students = readStudents();

        if (editingRoll) {
          const idx = students.findIndex((s) => s.roll === editingRoll);
          if (idx !== -1) {
            students[idx] = {
              ...students[idx],
              roll,
              name,
              college,
              branch,
              semester,
              streak,
              email,
              location,
              github,
              linkedin,
              codeforces,
              attendance,
              marks,
              password,
            };
          }
        } else {
          if (students.some((s) => s.roll === roll)) {
            alert("Student already exists.");
            return;
          }
          students.push({
            roll,
            name,
            college,
            branch,
            semester,
            streak,
            email,
            location,
            github,
            linkedin,
            codeforces,
            attendance,
            marks,
            password,
          });
        }

        writeStudents(students);
        renderTable(searchInput.value || "");
        closeModal();
      });

      // delete button in modal
      deleteBtn.addEventListener("click", function () {
        if (!editingRoll) return;
        if (!confirm("Delete this student?")) return;
        removeStudent(editingRoll);
      });

      // cancel
      cancelBtn.addEventListener("click", closeModal);

      // close modal utility
      function closeModal() {
        modal.style.display = "none";
        setTimeout(() => {
          // clear fields
          studentForm.reset();
          editingRoll = null;
        }, 200);
      }

      // --- Import / Export ---
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

      importFile.addEventListener("change", function (ev) {
        const file = ev.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = function (e) {
          try {
            const imported = JSON.parse(e.target.result);
            if (!Array.isArray(imported))
              throw new Error("Invalid JSON format (expected array)");
            // merge imported (avoid duplicates by roll)
            const cur = readStudents();
            const merged = [...cur];
            for (const s of imported) {
              if (!s.roll) continue;
              const idx = merged.findIndex((x) => x.roll === s.roll);
              if (idx === -1) merged.push(s);
              else merged[idx] = s; // overwrite
            }
            writeStudents(merged);
            renderTable();
            alert("Import successful");
          } catch (ex) {
            alert("Import failed: " + ex.message);
          }
        };
        reader.readAsText(file);
        // reset input
        ev.target.value = "";
      });

      // --- Search & events ---
      searchInput.addEventListener("input", () =>
        renderTable(searchInput.value)
      );
      addBtn.addEventListener("click", addStudent);

      // quick view / edit functions must be available globally for inline onclick in table rows
      window.viewStudent = viewStudent;
      window.editStudent = editStudent;
      window.removeStudentConfirm = removeStudentConfirm;

      // logout (demo)
      logoutBtn.addEventListener("click", function () {
        sessionStorage.removeItem(ADMIN_FLAG);
        alert("Logged out (demo). Redirecting to login.");
        window.location.href = "index.html";
      });

      // initial render
      renderTable();

      // ========== Seat-grid / Year-Section logic for admin ==========
      (function () {
        const $ = (sel) => document.querySelector(sel);

        const yearSelect = $("#yearSelect");
        const sectionSelect = $("#sectionSelect");
        const generateSeatsBtn = $("#generateSeatsBtn");
        const seatGridContainer = $("#seatGridContainer");

        function populateYearOptions() {
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
          sectionSelect.innerHTML = "";
          for (let i = 1; i <= 30; i++) {
            const opt = document.createElement("option");
            opt.value = `CSE-${i}`;
            opt.textContent = `CSE ${i}`;
            sectionSelect.appendChild(opt);
          }
        }

        function renderSeatGrid(year, section) {
          const students =
            typeof readStudents === "function"
              ? readStudents()
              : JSON.parse(localStorage.getItem("codepulse_students") || "[]");

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
            nEl.textContent = student
              ? `${student.name || "Student"} (${student.section || ""})`
              : "Empty";

            tile.appendChild(rEl);
            tile.appendChild(nEl);

            // Click -> open modal to add/edit
            tile.addEventListener("click", () => {
              if (sessionStorage.getItem("codepulse_role") !== "admin") {
                alert("Only admins can add/edit students.");
                return;
              }

              const existing = students.find((s) => s.roll === roll);
              if (existing) {
                // Edit mode
                modalTitle.textContent = `Edit — ${existing.name} (${existing.roll})`;
                editingRoll = existing.roll;
                deleteBtn.style.display = "inline-block";
              } else {
                // Add mode
                modalTitle.textContent = "Add New Student";
                editingRoll = null;
                deleteBtn.style.display = "none";
                studentForm.reset();
              }

              // Fill form
              fRoll.value = roll;
              fName.value = existing ? existing.name || "" : "";
              fCollege.value = existing ? existing.college || "" : "";
              fBranch.value = existing ? existing.branch || "" : "";
              fSemester.value = existing ? existing.semester || "" : "";
              fStreak.value = existing ? existing.streak || 0 : "";
              fEmail.value = existing ? existing.email || "" : "";
              fLocation.value = existing ? existing.location || "" : "";
              fGithub.value = existing ? existing.github || "" : "";
              fLinkedin.value = existing ? existing.linkedin || "" : "";
              fCodeforces.value = existing ? existing.codeforces || "" : "";
              fAttendance.value = existing ? existing.attendance || "" : "";
              fMarks.value = existing ? existing.marks || "[]" : "[]";
              document.getElementById("fPassword").value = existing
                ? existing.password || ""
                : "";

              setFormReadonly(false);
              modal.style.display = "flex";
            });

            grid.appendChild(tile);
          }

          seatGridContainer.appendChild(grid);
        }

        generateSeatsBtn.addEventListener("click", () => {
          renderSeatGrid(yearSelect.value, sectionSelect.value);
        });

        populateYearOptions();
        populateSectionOptions();

        document.addEventListener("DOMContentLoaded", () => {
          renderSeatGrid(yearSelect.value, sectionSelect.value);
        });
      })();