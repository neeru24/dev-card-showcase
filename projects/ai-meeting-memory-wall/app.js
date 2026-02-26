const STORAGE_KEY = "ai_meeting_memory_wall_v1";

const appState = {
  meetings: [],
  activeId: null,
  activeTab: "decisions"
};

const ids = {
  meetingForm: document.getElementById("meetingForm"),
  meetingTitle: document.getElementById("meetingTitle"),
  meetingDate: document.getElementById("meetingDate"),
  participants: document.getElementById("participants"),
  transcript: document.getElementById("transcript"),
  formHint: document.getElementById("formHint"),
  demoBtn: document.getElementById("demoBtn"),
  clearBtn: document.getElementById("clearBtn"),
  decisionCount: document.getElementById("decisionCount"),
  actionCount: document.getElementById("actionCount"),
  questionCount: document.getElementById("questionCount"),
  followCount: document.getElementById("followCount"),
  tabContent: document.getElementById("tabContent"),
  meetingWall: document.getElementById("meetingWall")
};

const tabs = Array.from(document.querySelectorAll(".tab"));

init();

function init() {
  hydrate();
  bindEvents();
  setDefaultDate();
  ensureActive();
  render();
}

function bindEvents() {
  ids.meetingForm.addEventListener("submit", onAnalyzeMeeting);
  ids.demoBtn.addEventListener("click", loadDemo);
  ids.clearBtn.addEventListener("click", clearWorkspace);

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      appState.activeTab = tab.dataset.tab;
      persist();
      renderTabs();
    });
  });
}

function setDefaultDate() {
  if (!ids.meetingDate.value) {
    ids.meetingDate.value = new Date().toISOString().slice(0, 10);
  }
}

function onAnalyzeMeeting(event) {
  event.preventDefault();

  const title = ids.meetingTitle.value.trim();
  const date = ids.meetingDate.value;
  const participants = ids.participants.value.trim();
  const transcript = ids.transcript.value.trim();

  if (!title || !date || !transcript) {
    setHint("Please fill title, date, and transcript.", true);
    return;
  }

  const extracted = extractMeetingSignals(transcript);
  const meeting = {
    id: `m_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    title,
    date,
    participants,
    transcript,
    decisions: extracted.decisions,
    actions: extracted.actions,
    questions: extracted.questions,
    createdAt: new Date().toISOString()
  };

  appState.meetings.unshift(meeting);
  appState.activeId = meeting.id;
  appState.activeTab = "decisions";

  persist();
  render();
  setHint("Meeting analyzed and saved to memory wall.", false);
}

function extractMeetingSignals(text) {
  const lines = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  const decisions = [];
  const actions = [];
  const questions = [];

  lines.forEach((raw, idx) => {
    const line = raw.replace(/^[-*]\s*/, "");
    const lower = line.toLowerCase();

    const looksDecision =
      /^decision[:\-]/i.test(line) ||
      /\b(decided|agreed|approved|concluded|finalized)\b/i.test(line);

    const looksAction =
      /^action[:\-]/i.test(line) ||
      /^todo[:\-]/i.test(line) ||
      /^follow[- ]?up[:\-]/i.test(line) ||
      /\b(owner|assignee)\b/i.test(line) ||
      /\bwill\b/i.test(line);

    const looksQuestion =
      /^open question[:\-]/i.test(line) ||
      /^question[:\-]/i.test(line) ||
      line.endsWith("?");

    if (looksDecision) {
      decisions.push(cleanPrefix(line, ["Decision:", "Decision-", "Decision"]));
      return;
    }

    if (looksQuestion) {
      questions.push(cleanPrefix(line, ["Open question:", "Question:", "Open question"]));
      return;
    }

    if (looksAction) {
      const owner = extractOwner(line);
      const due = extractDue(line);
      actions.push({
        id: `a_${Date.now()}_${idx}_${Math.random().toString(36).slice(2, 6)}`,
        text: cleanPrefix(line, ["Action:", "TODO:", "Follow-up:", "Follow up:"]),
        owner,
        due,
        status: "Pending",
        followUp: /follow[- ]?up|blocked|waiting|pending/i.test(line)
      });
      return;
    }

    if (/\b(decision|action|question)\b/i.test(lower)) {
      questions.push(line);
    }
  });

  if (!decisions.length) decisions.push("No explicit decision detected. Confirm final agreement in next sync.");
  if (!actions.length) {
    actions.push({
      id: `a_${Date.now()}_fallback`,
      text: "Review transcript and assign at least one concrete next step.",
      owner: "Unassigned",
      due: "TBD",
      status: "Pending",
      followUp: true
    });
  }
  if (!questions.length) questions.push("No open questions detected.");

  return { decisions, actions, questions };
}

function extractOwner(line) {
  const atMention = line.match(/@(\w[\w.-]{1,28})/);
  if (atMention) return `@${atMention[1]}`;

  const ownerMatch = line.match(/(?:owner|assignee)\s*[:\-]\s*([A-Za-z][A-Za-z .'-]{1,34})/i);
  if (ownerMatch) return ownerMatch[1].trim();

  return "Unassigned";
}

function extractDue(line) {
  const dueMatch = line.match(/(?:due|by)\s*[:\-]?\s*((?:\d{4}-\d{2}-\d{2})|(?:[A-Za-z]{3,9}\s+\d{1,2})|tomorrow|next week|friday|monday)/i);
  if (dueMatch) return dueMatch[1];
  return "TBD";
}

function render() {
  ensureActive();
  renderCounts();
  renderTabs();
  renderWall();
}

function ensureActive() {
  if (!appState.activeId && appState.meetings.length) {
    appState.activeId = appState.meetings[0].id;
  }
}

function activeMeeting() {
  return appState.meetings.find((m) => m.id === appState.activeId) || null;
}

function renderCounts() {
  const meeting = activeMeeting();
  if (!meeting) {
    ids.decisionCount.textContent = "0";
    ids.actionCount.textContent = "0";
    ids.questionCount.textContent = "0";
    ids.followCount.textContent = "0";
    return;
  }

  const follow = meeting.actions.filter((a) => a.followUp || a.status !== "Done").length;
  ids.decisionCount.textContent = String(meeting.decisions.length);
  ids.actionCount.textContent = String(meeting.actions.length);
  ids.questionCount.textContent = String(meeting.questions.length);
  ids.followCount.textContent = String(follow);
}

function renderTabs() {
  tabs.forEach((tab) => tab.classList.toggle("is-active", tab.dataset.tab === appState.activeTab));
  const meeting = activeMeeting();

  if (!meeting) {
    ids.tabContent.innerHTML = '<p class="hint">Analyze a meeting to populate the wall.</p>';
    return;
  }

  if (appState.activeTab === "decisions") return renderDecisions(meeting);
  if (appState.activeTab === "actions") return renderActions(meeting);
  if (appState.activeTab === "questions") return renderQuestions(meeting);
  return renderSummary(meeting);
}

function renderDecisions(meeting) {
  const node = template("decisionTemplate");
  const list = node.querySelector("#decisionList");
  meeting.decisions.forEach((decision, idx) => {
    const block = document.createElement("article");
    block.className = "block";
    block.innerHTML = `<h4>Decision ${idx + 1}</h4><p>${escapeHtml(decision)}</p>`;
    list.appendChild(block);
  });
  swap(node);
}

function renderActions(meeting) {
  const node = template("actionsTemplate");
  const rows = node.querySelector("#actionRows");

  meeting.actions.forEach((action) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${escapeHtml(action.text)}</td>
      <td>${escapeHtml(action.owner || "Unassigned")}</td>
      <td>${escapeHtml(action.due || "TBD")}</td>
      <td>
        <select data-action-status="${action.id}">
          <option value="Pending" ${action.status === "Pending" ? "selected" : ""}>Pending</option>
          <option value="In Progress" ${action.status === "In Progress" ? "selected" : ""}>In Progress</option>
          <option value="Done" ${action.status === "Done" ? "selected" : ""}>Done</option>
        </select>
      </td>
      <td>
        <label>
          <input type="checkbox" data-action-follow="${action.id}" ${action.followUp ? "checked" : ""}>
          ${action.followUp ? "Yes" : "No"}
        </label>
      </td>
    `;
    rows.appendChild(tr);
  });

  swap(node);

  ids.tabContent.querySelectorAll("[data-action-status]").forEach((select) => {
    select.addEventListener("change", (e) => {
      updateAction(select.getAttribute("data-action-status"), { status: e.target.value });
    });
  });

  ids.tabContent.querySelectorAll("[data-action-follow]").forEach((input) => {
    input.addEventListener("change", (e) => {
      updateAction(input.getAttribute("data-action-follow"), { followUp: e.target.checked });
    });
  });
}

function renderQuestions(meeting) {
  const node = template("questionTemplate");
  const list = node.querySelector("#questionList");
  meeting.questions.forEach((question, idx) => {
    const block = document.createElement("article");
    block.className = "block";
    block.innerHTML = `<h4>Open Question ${idx + 1}</h4><p>${escapeHtml(question)}</p>`;
    list.appendChild(block);
  });
  swap(node);
}

function renderSummary(meeting) {
  const node = template("summaryTemplate");
  const done = meeting.actions.filter((a) => a.status === "Done").length;
  const pending = meeting.actions.filter((a) => a.status !== "Done").length;

  node.querySelector("#snapshotText").textContent =
    `${meeting.title} on ${meeting.date}. Decisions: ${meeting.decisions.length}, actions: ${meeting.actions.length}, open questions: ${meeting.questions.length}. Completion: ${done}/${meeting.actions.length}.`;

  const summaryItems = [
    `${pending} action item(s) still pending.`,
    `${meeting.actions.filter((a) => a.followUp).length} action(s) explicitly marked for follow-up.`,
    `Top unresolved question: ${meeting.questions[0] || "None"}`
  ];

  summaryItems.forEach((text) => {
    const li = document.createElement("li");
    li.textContent = text;
    node.querySelector("#summaryList").appendChild(li);
  });

  swap(node);
}

function updateAction(actionId, patch) {
  const meeting = activeMeeting();
  if (!meeting) return;

  const action = meeting.actions.find((item) => item.id === actionId);
  if (!action) return;

  Object.assign(action, patch);
  persist();
  render();
}

function renderWall() {
  ids.meetingWall.innerHTML = "";

  if (!appState.meetings.length) {
    ids.meetingWall.innerHTML = '<p class="hint">No meetings stored yet.</p>';
    return;
  }

  appState.meetings.forEach((meeting) => {
    const card = document.createElement("article");
    card.className = `wall-card${meeting.id === appState.activeId ? " is-active" : ""}`;
    card.innerHTML = `
      <h4>${escapeHtml(meeting.title)}</h4>
      <p class="wall-meta">${escapeHtml(meeting.date)} | ${escapeHtml(meeting.participants || "No participants listed")}</p>
      <div class="wall-row">
        <span class="badge">${meeting.decisions.length} decisions</span>
        <span class="badge">${meeting.actions.length} actions</span>
        <span class="badge">${meeting.questions.length} questions</span>
      </div>
    `;
    card.addEventListener("click", () => {
      appState.activeId = meeting.id;
      persist();
      render();
    });
    ids.meetingWall.appendChild(card);
  });
}

function loadDemo() {
  const demoText = [
    "Decision: Approve beta launch for March 10.",
    "Action: @Ayaan will finalize release checklist by 2026-03-03.",
    "Action: Owner: Priya to prepare migration notes by Mar 4.",
    "Open question: Do we require rollback drills before launch?",
    "We agreed to keep feature flag default OFF in week one.",
    "TODO: Assignee- Jayanta to align support FAQ by next week.",
    "Question: Which cohort gets early access first?"
  ].join("\n");

  ids.meetingTitle.value = "Product Weekly Sync";
  ids.meetingDate.value = new Date().toISOString().slice(0, 10);
  ids.participants.value = "Ayaan, Jayanta, Priya";
  ids.transcript.value = demoText;
  setHint("Demo transcript loaded. Click Analyze + Save.", false);
}

function clearWorkspace() {
  appState.meetings = [];
  appState.activeId = null;
  appState.activeTab = "decisions";
  localStorage.removeItem(STORAGE_KEY);
  render();
  setHint("Workspace cleared.", false);
}

function persist() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(appState));
}

function hydrate() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed.meetings)) appState.meetings = parsed.meetings;
    if (typeof parsed.activeId === "string") appState.activeId = parsed.activeId;
    if (typeof parsed.activeTab === "string") appState.activeTab = parsed.activeTab;
  } catch (error) {
    console.error("hydrate failed", error);
  }
}

function setHint(message, isError) {
  ids.formHint.textContent = message;
  ids.formHint.style.color = isError ? "var(--danger)" : "var(--muted)";
}

function template(id) {
  return document.getElementById(id).content.firstElementChild.cloneNode(true);
}

function swap(node) {
  ids.tabContent.innerHTML = "";
  ids.tabContent.appendChild(node);
}

function cleanPrefix(text, prefixes) {
  let out = text;
  prefixes.forEach((p) => {
    const escaped = p.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    out = out.replace(new RegExp(`^${escaped}\\s*`, "i"), "");
  });
  return out.trim();
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
