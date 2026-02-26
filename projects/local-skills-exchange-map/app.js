const STORAGE_KEY = "local_skills_exchange_map_v1";

const state = {
  profiles: [],
  currentId: null,
  radiusKm: 10
};

const nodes = {
  profileForm: document.getElementById("profileForm"),
  name: document.getElementById("name"),
  area: document.getElementById("area"),
  lat: document.getElementById("lat"),
  lng: document.getElementById("lng"),
  radius: document.getElementById("radius"),
  offerSkills: document.getElementById("offerSkills"),
  learnSkills: document.getElementById("learnSkills"),
  locateBtn: document.getElementById("locateBtn"),
  demoBtn: document.getElementById("demoBtn"),
  clearBtn: document.getElementById("clearBtn"),
  hint: document.getElementById("hint"),
  totalProfiles: document.getElementById("totalProfiles"),
  nearbyCount: document.getElementById("nearbyCount"),
  matchCount: document.getElementById("matchCount"),
  avgDistance: document.getElementById("avgDistance"),
  matchList: document.getElementById("matchList"),
  profileGrid: document.getElementById("profileGrid"),
  mapCanvas: document.getElementById("mapCanvas")
};

init();

function init() {
  hydrate();
  bindEvents();
  render();
}

function bindEvents() {
  nodes.profileForm.addEventListener("submit", onSaveProfile);
  nodes.locateBtn.addEventListener("click", useLocation);
  nodes.demoBtn.addEventListener("click", loadDemo);
  nodes.clearBtn.addEventListener("click", clearAll);
}

function onSaveProfile(event) {
  event.preventDefault();

  const profile = {
    id: `p_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    name: nodes.name.value.trim(),
    area: nodes.area.value.trim(),
    lat: Number(nodes.lat.value),
    lng: Number(nodes.lng.value),
    radiusKm: clampNum(Number(nodes.radius.value) || 10, 1, 100),
    offer: parseSkills(nodes.offerSkills.value),
    learn: parseSkills(nodes.learnSkills.value),
    createdAt: new Date().toISOString()
  };

  if (!profile.name || Number.isNaN(profile.lat) || Number.isNaN(profile.lng) || !profile.offer.length || !profile.learn.length) {
    setHint("Name, location, offer skills, and learn skills are required.", true);
    return;
  }

  state.profiles.unshift(profile);
  state.currentId = profile.id;
  state.radiusKm = profile.radiusKm;

  persist();
  render();
  nodes.profileForm.reset();
  nodes.radius.value = "10";
  setHint("Profile saved and matched with nearby learners.", false);
}

function parseSkills(value) {
  return Array.from(new Set(
    value
      .split(",")
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean)
  ));
}

function useLocation() {
  if (!navigator.geolocation) {
    setHint("Geolocation not supported in this browser.", true);
    return;
  }

  navigator.geolocation.getCurrentPosition(
    (pos) => {
      nodes.lat.value = pos.coords.latitude.toFixed(6);
      nodes.lng.value = pos.coords.longitude.toFixed(6);
      setHint("Location captured.", false);
    },
    () => setHint("Could not fetch location. Enter coordinates manually.", true),
    { enableHighAccuracy: true, timeout: 7000 }
  );
}

function render() {
  const current = getCurrentProfile();
  const matches = current ? computeMatches(current) : [];

  renderMetrics(matches);
  renderMatchList(matches);
  renderProfiles(current, matches);
  drawMap(current, matches);
}

function getCurrentProfile() {
  if (!state.currentId) return null;
  return state.profiles.find((p) => p.id === state.currentId) || null;
}

function computeMatches(current) {
  const radius = current ? current.radiusKm : state.radiusKm;

  return state.profiles
    .filter((other) => other.id !== current.id)
    .map((other) => {
      const distanceKm = haversine(current.lat, current.lng, other.lat, other.lng);
      const theyCanTeach = overlap(current.learn, other.offer);
      const theyWant = overlap(current.offer, other.learn);
      const twoWay = theyCanTeach.length > 0 && theyWant.length > 0;
      return { other, distanceKm, theyCanTeach, theyWant, twoWay };
    })
    .filter((m) => m.distanceKm <= radius)
    .sort((a, b) => {
      if (Number(b.twoWay) !== Number(a.twoWay)) return Number(b.twoWay) - Number(a.twoWay);
      return a.distanceKm - b.distanceKm;
    });
}

function renderMetrics(matches) {
  nodes.totalProfiles.textContent = String(state.profiles.length);
  nodes.nearbyCount.textContent = String(matches.length);
  const twoWay = matches.filter((m) => m.twoWay);
  nodes.matchCount.textContent = String(twoWay.length);
  nodes.avgDistance.textContent = matches.length ? `${avg(matches.map((m) => m.distanceKm)).toFixed(1)} km` : "--";
}

function renderMatchList(matches) {
  nodes.matchList.innerHTML = "";

  if (!state.currentId) {
    appendList("Save your profile to see nearby matches.");
    return;
  }

  if (!matches.length) {
    appendList("No nearby match found in your radius. Increase distance or add more profiles.");
    return;
  }

  matches.slice(0, 8).forEach((m) => {
    const li = document.createElement("li");
    const type = m.twoWay ? "Two-way exchange" : "One-way help";
    li.textContent = `${m.other.name} (${m.distanceKm.toFixed(1)} km) - ${type}. Learn: ${joinSkills(m.theyCanTeach)} | Teach: ${joinSkills(m.theyWant)}`;
    nodes.matchList.appendChild(li);
  });
}

function renderProfiles(current, matches) {
  nodes.profileGrid.innerHTML = "";

  if (!state.profiles.length) {
    nodes.profileGrid.innerHTML = '<p class="hint">No profiles yet.</p>';
    return;
  }

  const matchMap = new Map(matches.map((m) => [m.other.id, m]));

  state.profiles.forEach((profile) => {
    const card = document.createElement("article");
    card.className = "profile-card";

    const isCurrent = current && profile.id === current.id;
    const match = matchMap.get(profile.id);

    card.innerHTML = `
      <h4>${escapeHtml(profile.name)} ${isCurrent ? "(You)" : ""}</h4>
      <p class="profile-meta">${escapeHtml(profile.area || "Area unknown")} | ${profile.lat.toFixed(4)}, ${profile.lng.toFixed(4)}</p>
      ${match ? `<p class="profile-meta">${match.distanceKm.toFixed(1)} km away | ${match.twoWay ? "Two-way match" : "Nearby"}</p>` : ""}
      <div class="tag-row">${profile.offer.map((s) => `<span class="tag">Teaches: ${escapeHtml(s)}</span>`).join("")}</div>
      <div class="tag-row">${profile.learn.map((s) => `<span class="tag">Learns: ${escapeHtml(s)}</span>`).join("")}</div>
    `;

    if (!isCurrent) {
      card.addEventListener("click", () => {
        state.currentId = profile.id;
        state.radiusKm = profile.radiusKm || 10;
        persist();
        render();
      });
    }

    nodes.profileGrid.appendChild(card);
  });
}

function drawMap(current, matches) {
  const canvas = nodes.mapCanvas;
  const ctx = canvas.getContext("2d");
  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  const width = Math.max(620, Math.floor(rect.width));
  const height = 330;

  canvas.width = Math.floor(width * dpr);
  canvas.height = Math.floor(height * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  ctx.clearRect(0, 0, width, height);
  drawMapBase(ctx, width, height);

  if (!state.profiles.length) {
    ctx.fillStyle = "#4f667f";
    ctx.font = '600 14px "Plus Jakarta Sans", sans-serif';
    ctx.fillText("No map points yet.", 18, 28);
    return;
  }

  const points = current ? [current, ...matches.map((m) => m.other)] : state.profiles;
  const latMin = Math.min(...points.map((p) => p.lat));
  const latMax = Math.max(...points.map((p) => p.lat));
  const lngMin = Math.min(...points.map((p) => p.lng));
  const lngMax = Math.max(...points.map((p) => p.lng));

  points.forEach((p) => {
    const x = scale(p.lng, lngMin, lngMax, 24, width - 24);
    const y = scale(p.lat, latMin, latMax, height - 24, 24);
    const isCurrent = current && p.id === current.id;

    ctx.fillStyle = isCurrent ? "#0f7b66" : "#e48a29";
    ctx.beginPath();
    ctx.arc(x, y, isCurrent ? 6 : 4, 0, Math.PI * 2);
    ctx.fill();
  });

  ctx.fillStyle = "#344d67";
  ctx.font = '500 11px "IBM Plex Mono", monospace';
  ctx.fillText("Green = selected profile, Orange = nearby profiles", 12, height - 10);
}

function drawMapBase(ctx, width, height) {
  ctx.fillStyle = "#f9fcff";
  ctx.fillRect(0, 0, width, height);
  ctx.strokeStyle = "#e4edf7";
  for (let i = 0; i < 10; i += 1) {
    const x = 18 + ((width - 36) * i) / 9;
    ctx.beginPath();
    ctx.moveTo(x, 18);
    ctx.lineTo(x, height - 18);
    ctx.stroke();
  }
  for (let j = 0; j < 7; j += 1) {
    const y = 18 + ((height - 36) * j) / 6;
    ctx.beginPath();
    ctx.moveTo(18, y);
    ctx.lineTo(width - 18, y);
    ctx.stroke();
  }
}

function overlap(a, b) {
  const setB = new Set(b);
  return a.filter((item) => setB.has(item));
}

function joinSkills(skills) {
  return skills.length ? skills.join(", ") : "none";
}

function loadDemo() {
  state.profiles = [
    makeProfile("Ayaan", "Andheri East", 19.1136, 72.8697, 12, ["javascript", "graphic design", "english tutoring"], ["python", "public speaking"]),
    makeProfile("Priya", "Powai", 19.1187, 72.9050, 15, ["python", "data analysis"], ["graphic design", "spoken english"]),
    makeProfile("Jayanta", "Bandra", 19.0596, 72.8295, 10, ["public speaking", "ui design"], ["javascript", "french"]),
    makeProfile("Ravi", "Ghatkopar", 19.0864, 72.9081, 10, ["french", "math tutoring"], ["ui design", "coding"]),
    makeProfile("Sara", "Kurla", 19.0728, 72.8826, 8, ["coding", "excel"], ["graphic design", "language tutoring"])
  ];
  state.currentId = state.profiles[0].id;
  state.radiusKm = state.profiles[0].radiusKm;
  persist();
  render();
  setHint("Demo profiles loaded.", false);
}

function makeProfile(name, area, lat, lng, radiusKm, offer, learn) {
  return {
    id: `p_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    name,
    area,
    lat,
    lng,
    radiusKm,
    offer,
    learn,
    createdAt: new Date().toISOString()
  };
}

function clearAll() {
  state.profiles = [];
  state.currentId = null;
  state.radiusKm = 10;
  persist();
  render();
  setHint("All data cleared.", false);
}

function appendList(text) {
  const li = document.createElement("li");
  li.textContent = text;
  nodes.matchList.appendChild(li);
}

function haversine(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(v) {
  return (v * Math.PI) / 180;
}

function avg(values) {
  return values.reduce((sum, n) => sum + n, 0) / values.length;
}

function clampNum(v, min, max) {
  return Math.max(min, Math.min(max, v));
}

function scale(value, inMin, inMax, outMin, outMax) {
  if (inMin === inMax) return (outMin + outMax) / 2;
  const t = (value - inMin) / (inMax - inMin);
  return outMin + t * (outMax - outMin);
}

function persist() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function hydrate() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed.profiles)) state.profiles = parsed.profiles;
    if (typeof parsed.currentId === "string") state.currentId = parsed.currentId;
    if (typeof parsed.radiusKm === "number") state.radiusKm = parsed.radiusKm;
  } catch (error) {
    console.error("hydrate failed", error);
  }
}

function setHint(message, isError) {
  nodes.hint.textContent = message;
  nodes.hint.style.color = isError ? "#c92d50" : "#4d6179";
}

function escapeHtml(input) {
  return String(input)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
