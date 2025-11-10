// LocalStorage-based data functions
function getStudents() {
  const raw = localStorage.getItem('codepulse_students');
  return raw ? JSON.parse(raw) : [];
}

function getStudentByRoll(roll) {
  const students = getStudents();
  return students.find(s => s.roll === roll) || null;
}

function getLeaderboardData(filterBy = 'overall', subFilter = '', sortBy = 'rank') {
  let students = getStudents();

  // Filter
  if (filterBy === 'branch' && subFilter) {
    students = students.filter(s => s.branch === subFilter);
  } else if (filterBy === 'semester' && subFilter) {
    students = students.filter(s => s.semester === subFilter);
  }

  // Sort
  if (sortBy === 'rank') {
    students.sort((a, b) => {
      const aRank = a.codechef?.rank || a.leetcode?.history?.[0]?.rank || a.hackerrank?.rank || 9999;
      const bRank = b.codechef?.rank || b.leetcode?.history?.[0]?.rank || b.hackerrank?.rank || 9999;
      return aRank - bRank;
    });
  } else if (sortBy === 'name') {
    students.sort((a, b) => a.name.localeCompare(b.name));
  }

  return students;
}

// Mock data for achievements
const achievements = [
  {
    icon: "🏆",
    title: "Top Performer",
    description: "Achieved top 10% in CodeChef contests"
  },
  {
    icon: "🔥",
    title: "Streak Master",
    description: "Maintained a 45-day GitHub contribution streak"
  },
  {
    icon: "💡",
    title: "Problem Solver",
    description: "Solved 200+ coding problems across platforms"
  },
  {
    icon: "🌟",
    title: "Rising Star",
    description: "Improved rank by 500 points in 6 months"
  }
];

// Mock data for contests
const contests = [
  {
    title: "CodePulse Monthly Contest",
    details: "Date: 15th Dec 2023 | Time: 2 PM - 5 PM",
    link: "#"
  },
  {
    title: "LeetCode Weekly Challenge",
    details: "Date: 20th Dec 2023 | Time: 10 AM - 12 PM",
    link: "#"
  },
  {
    title: "HackerRank Skill Test",
    details: "Date: 25th Dec 2023 | Time: 3 PM - 4 PM",
    link: "#"
  }
];

// Mock data for announcements
const announcements = [
  {
    category: "Academic",
    message: "Join CodePulse internship program."
  },
  {
    category: "Community",
    message: "Submit GitHub contributions."
  },
  {
    category: "Exams",
    message: "Prepare for mock coding tests."
  },
  {
    category: "Events",
    message: "Upcoming workshop on Data Structures."
  }
];

// College averages for charts
const collegeAverages = {
  codechef: [
    { date: "2023-01-01", rank: 2200 },
    { date: "2023-02-01", rank: 2100 },
    { date: "2023-03-01", rank: 2000 },
    { date: "2023-04-01", rank: 1900 },
    { date: "2023-05-01", rank: 1800 }
  ],
  leetcode: [
    { date: "2023-01-01", rank: 2700 },
    { date: "2023-02-01", rank: 2600 },
    { date: "2023-03-01", rank: 2500 },
    { date: "2023-04-01", rank: 2400 },
    { date: "2023-05-01", rank: 2300 }
  ],
  hackerrank: [
    { date: "2023-01-01", rank: 1600 },
    { date: "2023-02-01", rank: 1500 },
    { date: "2023-03-01", rank: 1400 },
    { date: "2023-04-01", rank: 1300 },
    { date: "2023-05-01", rank: 1200 }
  ]
};



// async function populateProfile() {
//   const defaultRoll = "298-2030"; // Default to Shivam Maurya
//   const student = await fetchStudentData(defaultRoll);

//   if (student) {
//     document.getElementById("profileRoll").textContent = defaultRoll;
//     document.getElementById("profileName").textContent = student.name;
//     document.getElementById("profileCollege").textContent = student.college || "Unknown College";
//     document.getElementById("profileBranch").textContent = student.branch || "Unknown Branch";
//     document.getElementById("profileSemester").textContent = student.semester || "Unknown Semester";
//     document.getElementById("profileStreak").textContent = (student.streak || 0) + " days";

//     // Fetch GitHub avatar
//     fetchGitHubAvatar(student.github_username);

//     // Set social links
//     document.getElementById("linkedinLink").href = student.linkedin || "#";
//     document.getElementById("githubLink").href = "https://github.com/" + (student.github_username || "");
//     document.getElementById("codeforcesLink").href = student.codeforces || "#";
//   }
// }

async function populateProfile() {
  const storedRoll = sessionStorage.getItem('codepulse_student');
  const raw = localStorage.getItem('codepulse_students');
  const students = raw ? JSON.parse(raw) : [];
  const student = students.find(s => s.roll === storedRoll);

  if (!student) {
    console.warn("Student not found in localStorage.");
    return;
  }

  document.getElementById("profileRoll").textContent = student.roll;
  document.getElementById("profileName").textContent = student.name;
  document.getElementById("profileCollege").textContent = student.college || "Unknown College";
  document.getElementById("profileBranch").textContent = student.branch || "Unknown Branch";
  document.getElementById("profileSemester").textContent = student.semester || "Unknown Semester";
  document.getElementById("profileStreak").textContent = (student.streak || 0) + " days";
  document.getElementById("profileEmail").textContent = student.email || "Not provided";
  document.getElementById("profileLocation").textContent = student.location || "Not provided";
  document.getElementById("profileAvatar").src = "./images/github.webp";

  // Populate quiz marks
  populateQuizMarks(student);
}

function populateQuizMarks(student) {
  const marks = student.marks ? JSON.parse(student.marks) : [];
  const subjectMap = {
    "Mathematics": "math-score",
    "Physics": "physics-score",
    "Chemistry": "chemistry-score",
    "Computer Science": "cs-score",
    "Data Structures": "ds-score",
    "Algorithms": "algo-score",
    "Operating Systems": "os-score"
  };

  // Reset all to N/A
  Object.values(subjectMap).forEach(id => {
    document.getElementById(id).textContent = "N/A";
  });

  // Set marks for available subjects
  marks.forEach(mark => {
    const id = subjectMap[mark.subject];
    if (id) {
      document.getElementById(id).textContent = mark.marks + "%";
    }
  });
}




async function fetchGitHubAvatar(username) {
  const avatarElement = document.getElementById("profileAvatar");
  const spinner = document.createElement("div");
  spinner.className = "loading";
  avatarElement.parentNode.insertBefore(spinner, avatarElement);

  try {
    const response = await fetch(`https://api.github.com/users/${username}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    if (data.avatar_url) {
      avatarElement.src = data.avatar_url;
    }
  } catch (error) {
    console.error("Error fetching GitHub avatar:", error);
    // Fallback to a default avatar or leave empty
  } finally {
    spinner.remove();
  }
}

function toggleTheme() {
  const body = document.body;
  const toggleButton = document.getElementById("themeToggle");

  if (body.classList.contains("dark")) {
    body.classList.remove("dark");
    toggleButton.textContent = "Switch to Dark Theme";
  } else {
    body.classList.add("dark");
    toggleButton.textContent = "Switch to Light Theme";
  }
}

// Typewriter effect for header
function typewriterEffect() {
  const header = document.querySelector('.header h1');
  header.classList.add('typewriter');
}

// Scroll-triggered animations
function handleScrollAnimations() {
  const elements = document.querySelectorAll('.animate-on-scroll');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('animate');
      }
    });
  }, { threshold: 0.1 });

  elements.forEach(el => observer.observe(el));
}

// Staggered fade-in for grid items
function animateGridItems() {
  const gridItems = document.querySelectorAll('.achievement-item, .resource-category, .tip-item');
  gridItems.forEach((item, index) => {
    item.classList.add('grid-item');
    item.style.animationDelay = `${index * 0.1}s`;
    item.classList.add('fade-in');
  });
}

// Enhanced leaderboard animation
function animateLeaderboardItems() {
  const leaderboardItems = document.querySelectorAll('.leaderboard-item');
  leaderboardItems.forEach((item, index) => {
    item.classList.add('animate-on-scroll');
    item.style.transitionDelay = `${index * 0.05}s`;
  });
}

// Pulse animation for announcements
function animateAnnouncements() {
  const announcements = document.querySelectorAll('.announcement-item');
  announcements.forEach((item, index) => {
    if (index < 2) { // First two announcements get pulse effect
      item.classList.add('pulse');
    }
  });
}

// Hero banner animation
function animateHeroBanner() {
  const heroImg = document.querySelector('.hero-banner img');
  heroImg.classList.add('animate-on-scroll');
}

// Bounce effect for achievement icons on click
function addIconBounce() {
  const icons = document.querySelectorAll('.achievement-icon');
  icons.forEach(icon => {
    icon.addEventListener('click', () => {
      icon.classList.add('bounce');
      setTimeout(() => icon.classList.remove('bounce'), 600);
    });
  });
}

// Function to handle rank check button click
async function fetchStudent() {
  const rollInput = document.getElementById("rollInput").value;
  if (!rollInput) {
    alert("Please enter a roll number.");
    return;
  }
  const student = await fetchStudentData(rollInput);
  const stats = await fetchStatsData(rollInput);
  if (student && stats) {
    alert(`Student: ${student.name}, Roll: ${student.roll}, Rank: ${stats.rank}`);
  } else {
    alert("Student not found.");
  }
}

// Hamburger menu toggle
function toggleHamburgerMenu() {
  const hamburger = document.getElementById('hamburgerMenu');
  const sidebar = document.querySelector('.sidebar');
  hamburger.classList.toggle('active');
  sidebar.classList.toggle('active');
}

// Call populateProfile on page load
window.onload = function() {
  populateProfile();
  renderRankGraphs();
  renderLeaderboard();
  setupLeaderboardFilters();
  renderAchievements();
  renderContests();
  renderAnnouncements();
  setupLeaderboardSearch();

  // Initialize animations
  typewriterEffect();
  handleScrollAnimations();
  animateGridItems();
  animateLeaderboardItems();
  animateAnnouncements();
  animateHeroBanner();
  addIconBounce();

  // Add hamburger menu event listener
  document.getElementById('hamburgerMenu').addEventListener('click', toggleHamburgerMenu);
};

async function renderRankGraphs() {
  const storedRoll = sessionStorage.getItem('codepulse_student');
  const student = getStudentByRoll(storedRoll);

  if (!student) return;

  // Mock stats data for charts
  const statsData = {
    codechef: {
      history: [
        { date: "2023-01-01", rank: 2500 },
        { date: "2023-02-01", rank: 2400 },
        { date: "2023-03-01", rank: 2300 },
        { date: "2023-04-01", rank: 2200 },
        { date: "2023-05-01", rank: 2100 }
      ]
    },
    leetcode: {
      history: [
        { date: "2023-01-01", rank: 3000 },
        { date: "2023-02-01", rank: 2900 },
        { date: "2023-03-01", rank: 2800 },
        { date: "2023-04-01", rank: 2700 },
        { date: "2023-05-01", rank: 2600 }
      ]
    },
    hackerrank: {
      history: [
        { date: "2023-01-01", rank: 1800 },
        { date: "2023-02-01", rank: 1700 },
        { date: "2023-03-01", rank: 1600 },
        { date: "2023-04-01", rank: 1500 },
        { date: "2023-05-01", rank: 1400 }
      ]
    },
    collegeAverages: collegeAverages
  };

  // CodeChef Chart
  const codechefCtx = document.getElementById('codechefChart').getContext('2d');
  const codechefLabels = statsData.codechef.history.map(item => item.date);
  const codechefData = statsData.codechef.history.map(item => parseInt(item.rank));
  const collegeCodechefData = statsData.collegeAverages.codechef.map(item => parseInt(item.rank));

  new Chart(codechefCtx, {
    type: 'line',
    data: {
      labels: codechefLabels,
      datasets: [{
        label: 'Your Rank',
        data: codechefData,
        borderColor: 'rgba(0, 119, 204, 1)',
        backgroundColor: 'rgba(0, 119, 204, 0.1)',
        tension: 0.1
      }, {
        label: 'College Average',
        data: collegeCodechefData,
        borderColor: 'rgba(255, 193, 7, 1)',
        backgroundColor: 'rgba(255, 193, 7, 0.1)',
        tension: 0.1
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: 'top',
        },
        title: {
          display: true,
          text: 'CodeChef Rank Progression'
        },
        tooltip: {
          enabled: true,
          callbacks: {
            label: function(context) {
              return `${context.dataset.label}: Rank ${context.parsed.y} on ${context.label}`;
            }
          }
        }
      },
      scales: {
        y: {
          beginAtZero: false,
          reverse: true // Lower rank is better
        }
      }
    }
  });

  // LeetCode Chart
  const leetcodeCtx = document.getElementById('leetcodeChart').getContext('2d');
  const leetcodeLabels = statsData.leetcode.history.map(item => item.date);
  const leetcodeData = statsData.leetcode.history.map(item => parseInt(item.rank));
  const collegeLeetcodeData = statsData.collegeAverages.leetcode.map(item => parseInt(item.rank));

  new Chart(leetcodeCtx, {
    type: 'line',
    data: {
      labels: leetcodeLabels,
      datasets: [{
        label: 'Your Rank',
        data: leetcodeData,
        borderColor: 'rgba(0, 119, 204, 1)',
        backgroundColor: 'rgba(0, 119, 204, 0.1)',
        tension: 0.1
      }, {
        label: 'College Average',
        data: collegeLeetcodeData,
        borderColor: 'rgba(255, 193, 7, 1)',
        backgroundColor: 'rgba(255, 193, 7, 0.1)',
        tension: 0.1
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: 'top',
        },
        title: {
          display: true,
          text: 'LeetCode Rank Progression'
        },
        tooltip: {
          enabled: true,
          callbacks: {
            label: function(context) {
              return `${context.dataset.label}: Rank ${context.parsed.y} on ${context.label}`;
            }
          }
        }
      },
      scales: {
        y: {
          beginAtZero: false,
          reverse: true // Lower rank is better
        }
      }
    }
  });

  // HackerRank Chart
  const hackerrankCtx = document.getElementById('hackerrankChart').getContext('2d');
  const hackerrankLabels = statsData.hackerrank.history.map(item => item.date);
  const hackerrankData = statsData.hackerrank.history.map(item => parseInt(item.rank));
  const collegeHackerrankData = statsData.collegeAverages.hackerrank.map(item => parseInt(item.rank));

  new Chart(hackerrankCtx, {
    type: 'line',
    data: {
      labels: hackerrankLabels,
      datasets: [{
        label: 'Your Rank',
        data: hackerrankData,
        borderColor: 'rgba(0, 119, 204, 1)',
        backgroundColor: 'rgba(0, 119, 204, 0.1)',
        tension: 0.1
      }, {
        label: 'College Average',
        data: collegeHackerrankData,
        borderColor: 'rgba(255, 193, 7, 1)',
        backgroundColor: 'rgba(255, 193, 7, 0.1)',
        tension: 0.1
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: 'top',
        },
        title: {
          display: true,
          text: 'HackerRank Rank Progression'
        },
        tooltip: {
          enabled: true,
          callbacks: {
            label: function(context) {
              return `${context.dataset.label}: Rank ${context.parsed.y} on ${context.label}`;
            }
          }
        }
      },
      scales: {
        y: {
          beginAtZero: false,
          reverse: true // Lower rank is better
        }
      }
    }
  });
}

function renderLeaderboard() {
  const filterBy = document.getElementById("filterBy").value;
  const subFilter = document.getElementById("subFilter").value;
  const sortBy = document.getElementById("sortBy").value;

  let students = getLeaderboardData(filterBy, subFilter, sortBy);

  const leaderboardList = document.getElementById("leaderboard-list");
  leaderboardList.innerHTML = "";

  students.forEach((student, index) => {
    const leaderboardItem = document.createElement("div");
    leaderboardItem.className = "leaderboard-item";
    leaderboardItem.innerHTML = `
      <div class="rank">${index + 1}</div>
      <div class="student-info">
        <img src="" alt="${student.name}" class="student-avatar" id="avatar-${student.roll}">
        <div>
          <div class="student-name">${student.name}</div>
          <div class="student-details">${student.branch} - ${student.semester}</div>
        </div>
      </div>
      <div class="student-stats">
        <div>CodeChef: ${student.codechef?.rank || 'N/A'}</div>
        <div>LeetCode: ${student.leetcode?.history?.[0]?.rank || 'N/A'}</div>
        <div>HackerRank: ${student.hackerrank?.rank || 'N/A'}</div>
      </div>
    `;
    leaderboardList.appendChild(leaderboardItem);

    // Fetch avatar
    fetchGitHubAvatarForLeaderboard(student.github_username, `avatar-${student.roll}`);
  });
}

function setupLeaderboardFilters() {
  const filterBySelect = document.getElementById("filterBy");
  const subFilterSelect = document.getElementById("subFilter");
  const sortBySelect = document.getElementById("sortBy");

  filterBySelect.addEventListener("change", function() {
    const filterValue = this.value;
    subFilterSelect.innerHTML = '<option value="">Select...</option>';
    subFilterSelect.style.display = "none";

    if (filterValue === "branch") {
      const students = getLeaderboardData();
      const branches = [...new Set(students.map(s => s.branch))];
      branches.forEach(branch => {
        const option = document.createElement("option");
        option.value = branch;
        option.textContent = branch;
        subFilterSelect.appendChild(option);
      });
      subFilterSelect.style.display = "inline-block";
    } else if (filterValue === "semester") {
      const students = getLeaderboardData();
      const semesters = [...new Set(students.map(s => s.semester))];
      semesters.forEach(semester => {
        const option = document.createElement("option");
        option.value = semester;
        option.textContent = semester;
        subFilterSelect.appendChild(option);
      });
      subFilterSelect.style.display = "inline-block";
    }

    renderLeaderboard();
  });

  subFilterSelect.addEventListener("change", renderLeaderboard);
  sortBySelect.addEventListener("change", renderLeaderboard);
}

async function fetchGitHubAvatarForLeaderboard(username, elementId) {
  const avatarElement = document.getElementById(elementId);
  const spinner = document.createElement("div");
  spinner.className = "loading";
  avatarElement.parentNode.insertBefore(spinner, avatarElement);

  try {
    const response = await fetch(`https://api.github.com/users/${username}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    if (data.avatar_url) {
      avatarElement.src = data.avatar_url;
    }
  } catch (error) {
    console.error("Error fetching GitHub avatar for leaderboard:", error);
  } finally {
    spinner.remove();
  }
}

function renderAchievements() {
  const achievementsGrid = document.getElementById("achievements-grid");
  achievementsGrid.innerHTML = "";

  achievements.forEach(achievement => {
    const achievementItem = document.createElement("div");
    achievementItem.className = "achievement-item";
    achievementItem.innerHTML = `
      <div class="achievement-icon">${achievement.icon}</div>
      <div class="achievement-title">${achievement.title}</div>
      <div class="achievement-description">${achievement.description}</div>
    `;
    achievementsGrid.appendChild(achievementItem);
  });
}

function renderContests() {
  const contestsList = document.getElementById("contests-list");
  contestsList.innerHTML = "";

  contests.forEach(contest => {
    const contestItem = document.createElement("div");
    contestItem.className = "contest-item";
    contestItem.innerHTML = `
      <div class="contest-title">${contest.title}</div>
      <div class="contest-details">${contest.details}</div>
      <a href="${contest.link}" class="contest-link">Register</a>
    `;
    contestsList.appendChild(contestItem);
  });
}

function renderAnnouncements() {
  const announcementsList = document.getElementById("announcements-list");
  announcementsList.innerHTML = "";

  announcements.forEach(announcement => {
    const announcementItem = document.createElement("div");
    announcementItem.className = "announcement-item";
    announcementItem.innerHTML = `
      <strong>${announcement.category}:</strong> ${announcement.message}
    `;
    announcementsList.appendChild(announcementItem);
  });
}

function setupLeaderboardSearch() {
  const searchInput = document.getElementById("leaderboardSearch");

  searchInput.addEventListener("input", function() {
    const query = this.value.toLowerCase();
    const leaderboardItems = document.querySelectorAll(".leaderboard-item");

    leaderboardItems.forEach(item => {
      const name = item.querySelector(".student-name").textContent.toLowerCase();
      const roll = item.querySelector(".student-avatar").alt.toLowerCase(); // Assuming roll is in alt

      if (name.includes(query) || roll.includes(query)) {
        item.style.display = "flex";
      } else {
        item.style.display = "none";
      }
    });
  });
}
