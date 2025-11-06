// Admin & Benutzerverwaltung
const ADMIN_USERNAME = "admin";
const ADMIN_PASSWORD = "admin123"; // wird automatisch gehashed

// Hash-Funktion (SHA-256)
async function hash(text){
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return Array.from(new Uint8Array(buf)).map(b=>b.toString(16).padStart(2,'0')).join('');
}

// Admin initial erstellen
async function initAdmin(){
  let users = JSON.parse(localStorage.getItem("users") || "{}");
  if(!users[ADMIN_USERNAME]){
    users[ADMIN_USERNAME] = await hash(ADMIN_PASSWORD);
    localStorage.setItem("users", JSON.stringify(users));
  }
}
initAdmin();

// ==================== LOGIN ====================
async function login(){
  const user = document.getElementById("username").value.trim();
  const pass = document.getElementById("password").value.trim();
  const error = document.getElementById("error");

  let users = JSON.parse(localStorage.getItem("users") || "{}");
  if(!users[user]){
    error.textContent = "❌ Benutzername existiert nicht!";
    return;
  }

  const hashedPass = await hash(pass);
  if(users[user] !== hashedPass){
    error.textContent = "❌ Falsches Passwort!";
    return;
  }

  // Login erfolgreich
  document.getElementById("login-box").style.display = "none";
  document.getElementById("register-box").style.display = "none";
  document.getElementById("content-box").style.display = "block";

  if(user === ADMIN_USERNAME){
    document.getElementById("welcome-text").textContent = `👑 Admin ${user} angemeldet`;
    showAdminDashboard();
  } else {
    document.getElementById("welcome-text").textContent = `Hallo ${user} 👋`;
    showTopic('dashboard');
  }
}

// ==================== REGISTRIERUNG ====================
async function register(){
  const user = document.getElementById("reg-username").value.trim();
  const pass = document.getElementById("reg-password").value.trim();
  const error = document.getElementById("reg-error");

  if(!user || !pass){
    error.textContent = "❌ Bitte Benutzername und Passwort eingeben!";
    return;
  }

  let users = JSON.parse(localStorage.getItem("users") || "{}");
  if(users[user]){
    error.textContent = "❌ Benutzername existiert bereits!";
    return;
  }

  users[user] = await hash(pass);
  localStorage.setItem("users", JSON.stringify(users));
  error.style.color = "green";
  error.textContent = "✅ Registrierung erfolgreich! Du kannst dich nun einloggen.";
}

// ==================== TOGGLE LOGIN / REG ====================
function toggleRegister(){
  const loginBox = document.getElementById("login-box");
  const regBox = document.getElementById("register-box");
  loginBox.style.display = loginBox.style.display === "none" ? "block" : "none";
  regBox.style.display = regBox.style.display === "none" ? "block" : "none";
  document.getElementById("error").textContent = "";
  document.getElementById("reg-error").textContent = "";
}

// ==================== LOGOUT ====================
function logout(){
  document.getElementById("content-box").style.display = "none";
  document.getElementById("login-box").style.display = "block";
  document.getElementById("username").value = "";
  document.getElementById("password").value = "";
  document.getElementById("error").textContent = "";
}

// ==================== DARK/LIGHT MODE ====================
function toggleMode(){
  document.body.classList.toggle('dark');
  document.getElementById("mode-btn").textContent = document.body.classList.contains('dark') ? "☀️" : "🌙";
}

// ==================== TOPIC NAV ====================
function showTopic(topic){
  const section = document.getElementById("topic-content");
  let html = "";

  switch(topic){
    case "dashboard":
      html = `
        <h3>Willkommen bei Malerwissen 🎨</h3>
        <p>Hier findest du Anleitungen, Tipps und Werkzeuge rund ums Streichen.</p>
      `;
      break;
    case "fassade":
      html = `
        <h3>Beschreibung🏡</h3>
        <ol>
          <li>Das Krankenhaus steht im Sauerland am Diemelsee, Heringstraße 13, 34541 Dohnheim.
IST-Zustand: Die Außenwände aus Ziegelmauerwerk sind verputzt mit Kalk-Zementputz der Mörtelgruppe PII.</li>
        </ol>
      `;
      break;
    case "wand":
      html = `
        <h3> Krankenhaus streichen🖌️</h3>
        <ul>
          <li>Es sollen Malerarbeiten durchgeführt werden. Hierfür sind die Untergründe zu prüfen und für die jeweilige Beschichtung vorzubereiten.
Pos. 1: Die Außenwände sind zu prüfen und für eine Beschichtung mit Fassadenfarbe nach Bauherrenwunsch vorzubereiten.
Pos. 2: ....
Wähle die Leistung aus, für die Deine Firma beauftrag ist und die Vorarbeiten, die hierfür notwendig sind. Es ist nur ein kleiner Auszug aus den vielen Arbeiten, die erledigt werden müssen.</l>
        </ul>
      `;
      break;
    case "werkzeug":
      html = `
        <h3>Wichtige Werkzeuge 🧰</h3>
        <ul>
          <li>Pinsel & Farbrollen</li>
          <li>Abdeckfolie & Klebeband</li>
          <li>Spachtel, Leiter, Eimer</li>
          <li>Schutzbrille & Handschuhe</li>
        </ul>
      `;
      break;
    case "notizen":
      html = `
        <h3>Meine Notizen 📝</h3>
        <div class="note">
          <input id="note-input" type="text" placeholder="Schreibe eine Notiz...">
          <button onclick="addNote()">➕</button>
        </div>
        <ul id="note-list" class="note-list"></ul>
      `;
      break;
  }

  section.innerHTML = html;
  if(topic === "notizen") renderNotes();
}

// ==================== NOTIZEN ====================
function addNote(){
  const input = document.getElementById("note-input");
  if(input.value.trim() === "") return;
  const notes = JSON.parse(localStorage.getItem("notes") || "[]");
  notes.push(input.value.trim());
  localStorage.setItem("notes", JSON.stringify(notes));
  input.value = "";
  renderNotes();
}

function renderNotes(){
  const list = document.getElementById("note-list");
  const notes = JSON.parse(localStorage.getItem("notes") || "[]");
  list.innerHTML = notes.map(n => `<li>${n}</li>`).join("");
}

// ==================== ADMIN DASHBOARD ====================
function showAdminDashboard(){
  const section = document.getElementById("topic-content");
  const users = JSON.parse(localStorage.getItem("users") || "{}");
  const notes = JSON.parse(localStorage.getItem("notes") || "[]");

  section.innerHTML = `
    <h3>Admin Dashboard 👑</h3>
    <p>Alle Benutzer:</p>
    <ul>
      ${Object.keys(users).map(u=>`<li>${u}</li>`).join('')}
    </ul>
    <p>Alle Notizen:</p>
    <ul>
      ${notes.map(n=>`<li>${n}</li>`).join('')}
    </ul>
    <button onclick="deleteAllUsers()">🚫 Alle Benutzer löschen</button>
    <button onclick="deleteAllNotes()">🗑️ Alle Notizen löschen</button>
  `;
}

function deleteAllUsers(){
  if(!confirm("Bist du sicher, dass du alle Benutzer außer Admin löschen willst?")) return;
  let users = JSON.parse(localStorage.getItem("users") || "{}");
  for(let u in users){
    if(u !== ADMIN_USERNAME) delete users[u];
  }
  localStorage.setItem("users", JSON.stringify(users));
  showAdminDashboard();
}

function deleteAllNotes(){
  if(!confirm("Bist du sicher, dass du alle Notizen löschen willst?")) return;
  localStorage.setItem("notes", JSON.stringify([]));
  showAdminDashboard();
}

