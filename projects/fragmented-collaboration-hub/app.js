const STORAGE_KEY = "skill_gap_radar_state_v1";
const FORM_KEY = "skill_gap_radar_form_v1";

const roleSkillMap = {
  "Frontend Developer": [
    { skill: "HTML", importance: "high" },
    { skill: "CSS", importance: "high" },
    { skill: "JavaScript", importance: "high" },
    { skill: "TypeScript", importance: "medium" },
    { skill: "React", importance: "high" },
    { skill: "Accessibility", importance: "medium" },
    { skill: "Testing", importance: "medium" },
    { skill: "Git", importance: "high" },
    { skill: "REST APIs", importance: "medium" },
    { skill: "Communication", importance: "high" }
  ],
  "Backend Developer": [
    { skill: "JavaScript", importance: "medium" },
    { skill: "Node.js", importance: "high" },
    { skill: "Python", importance: "high" },
    { skill: "SQL", importance: "high" },
    { skill: "REST APIs", importance: "high" },
    { skill: "Authentication", importance: "medium" },
    { skill: "Caching", importance: "medium" },
    { skill: "Docker", importance: "medium" },
    { skill: "Git", importance: "high" },
    { skill: "System Design", importance: "medium" }
  ],
  "Full Stack Developer": [
    { skill: "HTML", importance: "high" },
    { skill: "CSS", importance: "high" },
    { skill: "JavaScript", importance: "high" },
    { skill: "React", importance: "high" },
    { skill: "Node.js", importance: "high" },
    { skill: "SQL", importance: "high" },
    { skill: "REST APIs", importance: "high" },
    { skill: "Testing", importance: "medium" },
    { skill: "Git", importance: "high" },
    { skill: "Deployment", importance: "medium" }
  ],
  "Data Analyst": [
    { skill: "SQL", importance: "high" },
    { skill: "Excel", importance: "high" },
    { skill: "Python", importance: "high" },
    { skill: "Statistics", importance: "high" },
    { skill: "Data Visualization", importance: "high" },
    { skill: "Power BI", importance: "medium" },
    { skill: "Tableau", importance: "medium" },
    { skill: "Communication", importance: "high" },
    { skill: "Business Insight", importance: "medium" },
    { skill: "A/B Testing", importance: "medium" }
  ],
  "Product Manager": [
    { skill: "Product Strategy", importance: "high" },
    { skill: "User Research", importance: "high" },
    { skill: "Roadmapping", importance: "high" },
    { skill: "Analytics", importance: "high" },
    { skill: "Communication", importance: "high" },
    { skill: "Prioritization", importance: "high" },
    { skill: "Stakeholder Management", importance: "medium" },
    { skill: "Wireframing", importance: "medium" },
    { skill: "A/B Testing", importance: "medium" },
    { skill: "Documentation", importance: "medium" }
  ],
  "UI/UX Designer": [
    { skill: "Design Systems", importance: "high" },
    { skill: "Figma", importance: "high" },
    { skill: "User Research", importance: "high" },
    { skill: "Interaction Design", importance: "high" },
    { skill: "Information Architecture", importance: "medium" },
    { skill: "Prototyping", importance: "high" },
    { skill: "Accessibility", importance: "medium" },
    { skill: "Communication", importance: "high" },
    { skill: "Usability Testing", importance: "medium" },
    { skill: "Design Handoff", importance: "medium" }
  ],
  "DevOps Engineer": [
    { skill: "Linux", importance: "high" },
    { skill: "Docker", importance: "high" },
    { skill: "Kubernetes", importance: "high" },
    { skill: "CI/CD", importance: "high" },
    { skill: "Cloud (AWS/Azure/GCP)", importance: "high" },
    { skill: "Monitoring", importance: "medium" },
    { skill: "Scripting", importance: "high" },
    { skill: "Networking", importance: "medium" },
    { skill: "Git", importance: "high" },
    { skill: "Security Basics", importance: "medium" }
  ]
};

const projectBank = {
  "Frontend Developer": [
    { title: "Responsive Dashboard", goal: "Build role-based dashboard with API data.", skills: ["React", "TypeScript", "REST APIs"] },
    { title: "Accessibility Audit Tool", goal: "Create mini tool to scan color contrast and aria labels.", skills: ["Accessibility", "JavaScript", "CSS"] },
    { title: "Testing-first Todo App", goal: "Ship feature-complete app with unit and integration tests.", skills: ["Testing", "React", "Git"] }
  ],
  "Backend Developer": [
    { title: "Auth API Boilerplate", goal: "Develop production-ready auth and session system.", skills: ["Node.js", "Authentication", "REST APIs"] },
    { title: "Analytics Event Ingestion", goal: "Build ingestion service with queue and SQL storage.", skills: ["SQL", "Caching", "System Design"] },
    { title: "Dockerized Microservice", goal: "Containerize and deploy resilient backend service.", skills: ["Docker", "Git", "Python"] }
  ],
  "Full Stack Developer": [
    { title: "Job Tracker SaaS", goal: "Create app for tracking applications and interviews.", skills: ["React", "Node.js", "SQL"] },
    { title: "Realtime Collaboration Board", goal: "Build board with comments, auth and deployment.", skills: ["REST APIs", "Deployment", "Testing"] },
    { title: "Portfolio CMS", goal: "Build headless CMS-backed personal portfolio.", skills: ["JavaScript", "Git", "HTML"] }
  ],
  "Data Analyst": [
    { title: "Sales Performance Analyzer", goal: "Build report dashboard with cohort and trend analysis.", skills: ["SQL", "Data Visualization", "Statistics"] },
    { title: "Marketing A/B Analysis", goal: "Analyze experiments and present confidence insights.", skills: ["A/B Testing", "Python", "Business Insight"] },
    { title: "Operational KPI Tracker", goal: "Create weekly automated KPI snapshots.", skills: ["Excel", "Power BI", "Communication"] }
  ],
  "Product Manager": [
    { title: "Feature Prioritization Framework", goal: "Design weighted scoring model and implementation plan.", skills: ["Prioritization", "Product Strategy", "Roadmapping"] },
    { title: "Onboarding Funnel Audit", goal: "Diagnose drop-offs and propose experiments.", skills: ["Analytics", "User Research", "A/B Testing"] },
    { title: "Product Requirement Library", goal: "Write reusable PRD templates with clear acceptance criteria.", skills: ["Documentation", "Communication", "Stakeholder Management"] }
  ],
  "UI/UX Designer": [
    { title: "Design System Starter", goal: "Create scalable design tokens and components.", skills: ["Design Systems", "Figma", "Design Handoff"] },
    { title: "Usability Test Sprint", goal: "Run 5 usability sessions and iterate flow.", skills: ["Usability Testing", "User Research", "Interaction Design"] },
    { title: "Mobile-first Prototype", goal: "Build full mobile prototype with IA clarity.", skills: ["Prototyping", "Information Architecture", "Accessibility"] }
  ],
  "DevOps Engineer": [
    { title: "CI/CD Pipeline Lab", goal: "Set up build-test-deploy pipeline with quality gates.", skills: ["CI/CD", "Git", "Scripting"] },
    { title: "Cloud Monitoring Stack", goal: "Deploy logs, metrics, and alerting setup.", skills: ["Monitoring", "Cloud (AWS/Azure/GCP)", "Linux"] },
    { title: "Kubernetes Rollout Demo", goal: "Deploy service with rolling updates and rollback.", skills: ["Kubernetes", "Docker", "Networking"] }
  ]
};

const appState = {
  activeTab: "summary",
  report: null,
  progressMap: {}
};

const ids = [
  "candidateName",
  "experienceLevel",
  "targetRole",
  "weeklyHours",
  "jobLinks",
  "jobDescription",
  "resumeText",
  "learningMode",
  "goalTimeline"
];

const tabs = Array.from(document.querySelectorAll(".tab"));
const tabContent = document.getElementById("tabContent");

const scoreNodes = {
  match: document.getElementById("matchScore"),
  gap: document.getElementById("gapScore"),
  roadmap: document.getElementById("roadmapScore"),
  readiness: document.getElementById("readinessScore")
};

init();

function init() {
  hydrate();
  bindEvents();
  if (appState.report) {
    paintScores(appState.report.scores);
    renderActiveTab();
  } else {
    tabContent.innerHTML = `<p class="muted">Fill inputs and run analysis to generate report.</p>`;
  }
}

function bindEvents() {
  document.getElementById("analyzeBtn").addEventListener("click", analyze);
  document.getElementById("loadDemoBtn").addEventListener("click", loadDemo);
  document.getElementById("resetBtn").addEventListener("click", onReset);
  document.getElementById("copyReportBtn").addEventListener("click", copyReport);
  document.getElementById("downloadReportBtn").addEventListener("click", downloadReport);

  tabs.forEach((tab) => tab.addEventListener("click", () => {
    appState.activeTab = tab.dataset.tab;
    persist();
    renderActiveTab();
  }));

  ids.forEach((id) => {
    const node = document.getElementById(id);
    node.addEventListener("change", persistForm);
    node.addEventListener("input", persistForm);
  });
}

function analyze() {
  const input = collectInput();
  if (!input) return;

  const parsedResumeSkills = extractSkills(input.resumeText, input.targetRole);
  const parsedJdSkills = extractSkills(input.jobDescription, input.targetRole, true);
  const roleSkills = roleSkillMap[input.targetRole] || [];

  const mergedRoleSkills = mergeRoleWithJd(roleSkills, parsedJdSkills);
  const matrix = buildSkillMatrix(mergedRoleSkills, parsedResumeSkills);
  const scores = scoreMatrix(matrix, input.weeklyHours, input.goalTimeline);
  const roadmap = buildRoadmap(matrix, input);
  const projects = buildProjects(input.targetRole, matrix);
  const nextSteps = buildNextSteps(matrix, input);
  const monetization = [
    "Free: 1 active target role and basic roadmap",
    "Pro Monthly: unlimited role tracking + AI feedback loops",
    "Mentor Add-on: expert-reviewed 30-day plan and mock interview advice",
    "Institution Pack: dashboard for bootcamps and colleges"
  ];

  const report = {
    generatedAt: new Date().toISOString(),
    input,
    parsedResumeSkills,
    parsedJdSkills,
    matrix,
    scores,
    roadmap,
    projects,
    nextSteps,
    monetization
  };

  appState.report = report;
  paintScores(scores);
  setHint("Skill report generated. Review tabs and track daily progress.", false);
  persist();
  renderActiveTab();
}

function collectInput() {
  const input = {
    candidateName: getVal("candidateName").trim(),
    experienceLevel: getVal("experienceLevel"),
    targetRole: getVal("targetRole"),
    weeklyHours: Number(getVal("weeklyHours")) || 10,
    jobLinks: getVal("jobLinks").trim(),
    jobDescription: getVal("jobDescription").trim(),
    resumeText: getVal("resumeText").trim(),
    learningMode: getVal("learningMode"),
    goalTimeline: getVal("goalTimeline")
  };

  if (!input.candidateName || !input.targetRole || !input.jobDescription || !input.resumeText) {
    setHint("Please fill name, target role, JD text, and resume text.", true);
    return null;
  }
  return input;
}

function extractSkills(rawText, role, includeRoleDefaults = false) {
  const text = rawText.toLowerCase();
  const allRoleSkills = Object.values(roleSkillMap).flat().map((s) => s.skill);
  const baseSet = new Set(includeRoleDefaults ? (roleSkillMap[role] || []).map((s) => s.skill) : []);
  allRoleSkills.forEach((skill) => {
    const pattern = new RegExp(`\\b${escapeRegex(skill.toLowerCase())}\\b`, "i");
    if (pattern.test(text)) baseSet.add(skill);
  });
  return Array.from(baseSet);
}

function mergeRoleWithJd(roleSkills, jdSkills) {
  const map = new Map();
  roleSkills.forEach((item) => map.set(item.skill, { ...item }));
  jdSkills.forEach((skill) => {
    if (!map.has(skill)) map.set(skill, { skill, importance: "medium" });
  });
  return Array.from(map.values());
}

function buildSkillMatrix(requiredSkills, resumeSkills) {
  const resumeSet = new Set(resumeSkills.map((s) => s.toLowerCase()));
  return requiredSkills.map((item) => {
    const hasSkill = resumeSet.has(item.skill.toLowerCase());
    const action = hasSkill
      ? "Keep practicing with role-specific projects."
      : item.importance === "high"
        ? "Prioritize immediately in week 1-2."
        : "Add in week 3-4 with practical exercises.";
    return {
      skill: item.skill,
      importance: item.importance,
      status: hasSkill ? "present" : "missing",
      action
    };
  });
}

function scoreMatrix(matrix, weeklyHours, goalTimeline) {
  const total = matrix.length;
  const present = matrix.filter((m) => m.status === "present").length;
  const missingHigh = matrix.filter((m) => m.status === "missing" && m.importance === "high").length;
  const missingMedium = matrix.filter((m) => m.status === "missing" && m.importance === "medium").length;

  let match = Math.round((present / total) * 100);
  let gap = 100 - match;
  let roadmap = 55 + Math.min(25, weeklyHours);
  let readiness = 48 + Math.round(present * 2.6) - (missingHigh * 4);

  if (goalTimeline === "60 days") {
    roadmap += 6;
    readiness += 4;
  }
  if (goalTimeline === "90 days") {
    roadmap += 10;
    readiness += 8;
  }

  gap += missingHigh * 3 + missingMedium;
  roadmap -= missingHigh * 2;

  return {
    match: clamp(match),
    gap: clamp(gap),
    roadmap: clamp(roadmap),
    readiness: clamp(readiness)
  };
}

function buildRoadmap(matrix, input) {
  const missing = matrix.filter((m) => m.status === "missing");
  const highMissing = missing.filter((m) => m.importance === "high").map((m) => m.skill);
  const medMissing = missing.filter((m) => m.importance === "medium").map((m) => m.skill);

  const week1 = highMissing.slice(0, 3);
  const week2 = highMissing.slice(3, 6).concat(medMissing.slice(0, 1));
  const week3 = medMissing.slice(1, 4);
  const week4 = medMissing.slice(4, 7);

  return [
    {
      week: "Week 1",
      title: "Core Foundation Sprint",
      tasks: week1.length ? week1 : ["Strengthen one core role skill", "Revise fundamentals", "Take quick assessment"],
      output: "Daily notes + 1 mini implementation"
    },
    {
      week: "Week 2",
      title: "Applied Learning Sprint",
      tasks: week2.length ? week2 : ["Build hands-on mini feature", "Practice interview questions", "Refactor solutions"],
      output: "1 role-focused mini project"
    },
    {
      week: "Week 3",
      title: "Portfolio Depth Sprint",
      tasks: week3.length ? week3 : ["Add measurable results to projects", "Polish documentation", "Revise weak concepts"],
      output: "Updated portfolio + README improvements"
    },
    {
      week: "Week 4",
      title: "Interview Readiness Sprint",
      tasks: week4.length ? week4 : ["Mock interviews", "Resume updates", "Role-based problem solving"],
      output: "Interview kit + polished resume"
    }
  ].map((weekPlan) => ({
    ...weekPlan,
    hours: recommendHours(input.weeklyHours, weekPlan.week)
  }));
}

function buildProjects(role, matrix) {
  const base = projectBank[role] || [];
  const missing = matrix.filter((m) => m.status === "missing").map((m) => m.skill.toLowerCase());

  return base.map((project) => {
    const alignment = project.skills.reduce((score, skill) => (
      score + (missing.includes(skill.toLowerCase()) ? 1 : 0)
    ), 0);
    const priority = alignment >= 2 ? "high" : alignment === 1 ? "medium" : "low";
    return { ...project, priority };
  }).sort((a, b) => priorityOrder(b.priority) - priorityOrder(a.priority));
}

function buildNextSteps(matrix, input) {
  const missingHigh = matrix.filter((m) => m.status === "missing" && m.importance === "high").map((m) => m.skill);
  const missingMedium = matrix.filter((m) => m.status === "missing" && m.importance === "medium").map((m) => m.skill);
  const present = matrix.filter((m) => m.status === "present").map((m) => m.skill);

  return [
    `In next 7 days, close 1-2 high-priority skills: ${missingHigh.slice(0, 2).join(", ") || "none pending"}.`,
    `Build one focused project proving ${input.targetRole} readiness.`,
    `Schedule 2 mock interviews and practice role-specific questions.`,
    `Update resume bullets with outcomes and measurable results.`,
    `Use existing strengths (${present.slice(0, 3).join(", ") || "core fundamentals"}) as your interview pitch.`,
    `Medium-priority backlog: ${missingMedium.slice(0, 4).join(", ") || "maintain depth in current stack"}.`
  ];
}

function renderActiveTab() {
  if (!appState.report) {
    tabContent.innerHTML = `<p class="muted">Fill inputs and run analysis to generate report.</p>`;
    return;
  }
  markActiveTab();
  const report = appState.report;
  if (appState.activeTab === "summary") return renderSummary(report);
  if (appState.activeTab === "skills") return renderSkills(report);
  if (appState.activeTab === "roadmap") return renderRoadmap(report);
  if (appState.activeTab === "projects") return renderProjects(report);
  if (appState.activeTab === "progress") return renderProgress(report);
  if (appState.activeTab === "next") return renderNext(report);
}

function renderSummary(report) {
  const node = template("summaryTemplate");
  node.querySelector("#candidateSummaryText").textContent =
    `${report.input.candidateName} targeting ${report.input.targetRole} (${report.input.experienceLevel}). Resume matched ${report.matrix.filter((m) => m.status === "present").length}/${report.matrix.length} role-relevant skills.`;

  const strengths = report.matrix.filter((m) => m.status === "present").slice(0, 6).map((m) => m.skill);
  const gaps = report.matrix.filter((m) => m.status === "missing").slice(0, 6).map((m) => `${m.skill} (${m.importance})`);
  strengths.forEach((s) => node.querySelector("#strengthList").appendChild(li(s)));
  gaps.forEach((g) => node.querySelector("#priorityGapList").appendChild(li(g)));

  node.querySelector("#scoreInsightText").textContent =
    `Current match ${report.scores.match}/100. Focus on high-importance missing skills first to raise interview readiness beyond ${Math.min(95, report.scores.readiness + 12)}/100 in 30 days.`;
  swap(node);
}

function renderSkills(report) {
  const node = template("skillsTemplate");
  node.querySelector("#roleSkillHead").textContent =
    `Extracted ${report.parsedJdSkills.length} role signals from JD data and mapped against your resume profile.`;
  const body = node.querySelector("#skillRows");
  report.matrix.forEach((item) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${escapeHtml(item.skill)}</td>
      <td>${statusPill(item.status)}</td>
      <td>${importancePill(item.importance)}</td>
      <td>${escapeHtml(item.action)}</td>
    `;
    body.appendChild(row);
  });
  swap(node);
}

function renderRoadmap(report) {
  const node = template("roadmapTemplate");
  node.querySelector("#roadmapIntro").textContent =
    `${report.input.weeklyHours} hours/week planned with ${report.input.learningMode.toLowerCase()} mode.`;
  const grid = node.querySelector("#roadmapGrid");
  report.roadmap.forEach((week) => {
    const card = document.createElement("article");
    card.className = "roadmap-card";
    card.innerHTML = `
      <h4>${escapeHtml(week.week)} - ${escapeHtml(week.title)}</h4>
      <p><strong>Time:</strong> ${escapeHtml(week.hours)}</p>
      <p><strong>Output:</strong> ${escapeHtml(week.output)}</p>
      <ul>${week.tasks.map((task) => `<li>${escapeHtml(task)}</li>`).join("")}</ul>
    `;
    grid.appendChild(card);
  });
  swap(node);
}

function renderProjects(report) {
  const node = template("projectsTemplate");
  node.querySelector("#projectIntro").textContent =
    `Projects are prioritized by alignment with your missing skills for ${report.input.targetRole}.`;
  const grid = node.querySelector("#projectGrid");
  report.projects.forEach((project) => {
    const card = document.createElement("article");
    card.className = "project-card";
    card.innerHTML = `
      <h4>${escapeHtml(project.title)} ${priorityBadge(project.priority)}</h4>
      <p>${escapeHtml(project.goal)}</p>
      <ul class="stack-mini">${project.skills.map((skill) => `<li>${escapeHtml(skill)}</li>`).join("")}</ul>
    `;
    grid.appendChild(card);
  });
  swap(node);
}

function renderProgress(report) {
  const node = template("progressTemplate");
  const tasks = report.roadmap.flatMap((w) => w.tasks).slice(0, 12);
  const container = node.querySelector("#progressChecklist");
  let done = 0;

  tasks.forEach((task, idx) => {
    const id = `task_${idx}_${slug(task)}`;
    const checked = Boolean(appState.progressMap[id]);
    if (checked) done += 1;
    const row = document.createElement("div");
    row.className = "check-row";
    row.innerHTML = `
      <label>
        <input type="checkbox" data-task-id="${id}" ${checked ? "checked" : ""}>
        <span>${escapeHtml(task)}</span>
      </label>
      <span class="check-tag">Day ${idx + 1}</span>
    `;
    container.appendChild(row);
  });

  const pct = tasks.length ? Math.round((done / tasks.length) * 100) : 0;
  node.querySelector("#progressText").textContent = `${done}/${tasks.length} tasks complete (${pct}%)`;
  node.querySelector("#progressFill").style.width = `${pct}%`;
  swap(node);

  container.querySelectorAll('input[type="checkbox"]').forEach((cb) => {
    cb.addEventListener("change", (e) => {
      const taskId = e.target.getAttribute("data-task-id");
      appState.progressMap[taskId] = e.target.checked;
      persist();
      renderProgress(report);
    });
  });
}

function renderNext(report) {
  const node = template("nextTemplate");
  report.nextSteps.forEach((step) => node.querySelector("#nextStepsList").appendChild(li(step)));
  report.monetization.forEach((line) => node.querySelector("#monetizationList").appendChild(li(line)));
  swap(node);
}

function copyReport() {
  if (!appState.report) {
    setHint("Analyze first, then copy report.", true);
    return;
  }
  const r = appState.report;
  const text = [
    `Candidate: ${r.input.candidateName}`,
    `Target Role: ${r.input.targetRole}`,
    `Current Match: ${r.scores.match}/100`,
    `Gap Severity: ${r.scores.gap}/100`,
    `Interview Readiness: ${r.scores.readiness}/100`,
    "",
    "Top Missing Skills:",
    ...r.matrix.filter((m) => m.status === "missing").slice(0, 6).map((m) => `- ${m.skill} (${m.importance})`),
    "",
    "Next Steps:",
    ...r.nextSteps.map((s) => `- ${s}`)
  ].join("\n");

  navigator.clipboard.writeText(text)
    .then(() => setHint("Report copied to clipboard.", false))
    .catch(() => setHint("Clipboard unavailable in this context.", true));
}

function downloadReport() {
  if (!appState.report) {
    setHint("Analyze first, then download report.", true);
    return;
  }
  const blob = new Blob([JSON.stringify(appState.report, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${slug(appState.report.input.candidateName)}-skill-gap-report.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function loadDemo() {
  const demo = {
    candidateName: "Ayaan Shaikh",
    experienceLevel: "Fresher",
    targetRole: "Frontend Developer",
    weeklyHours: "12",
    jobLinks: "https://company.com/careers/frontend-developer\nhttps://startup.io/jobs/react-intern",
    jobDescription: "We are hiring a Frontend Developer with strong React, JavaScript, CSS, testing, accessibility, communication and Git workflow skills. Experience with TypeScript and REST APIs preferred.",
    resumeText: "Built responsive portfolio using HTML CSS JavaScript. Created mini apps with React and integrated REST APIs. Collaborated in team projects using Git. Familiar with accessibility basics.",
    learningMode: "Project-first",
    goalTimeline: "30 days"
  };
  Object.keys(demo).forEach((key) => {
    const node = document.getElementById(key);
    if (node) node.value = demo[key];
  });
  persistForm();
  setHint("Demo loaded. Click Analyze Skill Gaps.", false);
}

function onReset() {
  setTimeout(() => {
    appState.report = null;
    appState.progressMap = {};
    clearScores();
    tabContent.innerHTML = `<p class="muted">Fill inputs and run analysis to generate report.</p>`;
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(FORM_KEY);
  }, 0);
}

function paintScores(scores) {
  setScore(scoreNodes.match, scores.match, false);
  setScore(scoreNodes.gap, scores.gap, true);
  setScore(scoreNodes.roadmap, scores.roadmap, false);
  setScore(scoreNodes.readiness, scores.readiness, false);
}

function setScore(node, value, reverse = false) {
  node.textContent = `${value}/100`;
  if (reverse) {
    node.style.color = value <= 40 ? "var(--ok)" : value <= 65 ? "var(--warn)" : "var(--danger)";
    return;
  }
  node.style.color = value >= 75 ? "var(--ok)" : value >= 55 ? "var(--warn)" : "var(--danger)";
}

function clearScores() {
  Object.values(scoreNodes).forEach((n) => {
    n.textContent = "--";
    n.style.color = "";
  });
}

function persist() {
  persistForm();
  localStorage.setItem(STORAGE_KEY, JSON.stringify({
    activeTab: appState.activeTab,
    report: appState.report,
    progressMap: appState.progressMap
  }));
}

function persistForm() {
  const data = {};
  ids.forEach((id) => data[id] = getVal(id));
  localStorage.setItem(FORM_KEY, JSON.stringify(data));
}

function hydrate() {
  try {
    const rawForm = localStorage.getItem(FORM_KEY);
    if (rawForm) {
      const data = JSON.parse(rawForm);
      ids.forEach((id) => {
        if (typeof data[id] === "string") {
          document.getElementById(id).value = data[id];
        }
      });
    }
    const rawState = localStorage.getItem(STORAGE_KEY);
    if (!rawState) return;
    const parsed = JSON.parse(rawState);
    if (parsed.activeTab) appState.activeTab = parsed.activeTab;
    if (parsed.report) appState.report = parsed.report;
    if (parsed.progressMap) appState.progressMap = parsed.progressMap;
  } catch (err) {
    console.error("hydrate failed", err);
  }
}

function markActiveTab() {
  tabs.forEach((tab) => {
    tab.classList.toggle("is-active", tab.dataset.tab === appState.activeTab);
  });
}

function setHint(message, isError) {
  const hint = document.getElementById("formHint");
  hint.textContent = message;
  hint.style.color = isError ? "var(--danger)" : "var(--muted)";
}

function template(id) {
  return document.getElementById(id).content.firstElementChild.cloneNode(true);
}

function swap(node) {
  tabContent.innerHTML = "";
  tabContent.appendChild(node);
}

function li(text) {
  const node = document.createElement("li");
  node.textContent = text;
  return node;
}

function getVal(id) {
  return document.getElementById(id).value;
}

function clamp(value) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function recommendHours(weeklyHours, weekLabel) {
  const base = Math.max(4, weeklyHours);
  if (weekLabel === "Week 4") return `${Math.max(4, base - 2)} hrs`;
  if (weekLabel === "Week 2") return `${base + 1} hrs`;
  return `${base} hrs`;
}

function priorityOrder(priority) {
  if (priority === "high") return 3;
  if (priority === "medium") return 2;
  return 1;
}

function slug(value) {
  return String(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60) || "candidate";
}

function statusPill(status) {
  if (status === "present") return `<span class="pill pill-low">Present</span>`;
  return `<span class="pill pill-high">Missing</span>`;
}

function importancePill(importance) {
  if (importance === "high") return `<span class="pill pill-high">High</span>`;
  return `<span class="pill pill-medium">Medium</span>`;
}

function priorityBadge(priority) {
  if (priority === "high") return `<span class="pill pill-high">High Priority</span>`;
  if (priority === "medium") return `<span class="pill pill-medium">Medium Priority</span>`;
  return `<span class="pill pill-low">Low Priority</span>`;
}

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function escapeHtml(input) {
  return String(input)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
