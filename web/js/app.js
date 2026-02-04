const supabaseUrl = "https://xwupwqjpykqfsdhexayx.supabase.co";
const supabaseKey = "sb_publishable_622CcX82uuwjmpHunLfNEA_hMjrTPcq";

const supabaseClient = supabase.createClient(supabaseUrl, supabaseKey);

async function initApp() {
  const app = document.getElementById("app");

  app.innerHTML = `
    <header>
      <h1>📊 NS LinkSnapper</h1>
      <p>Category Based Knowledge Dashboard</p>
    </header>

    <div class="dashboard">
      <div id="cards" class="accordion"></div>
    </div>
  `;

  loadLinks();
}

async function loadLinks() {
  const { data, error } = await supabaseClient
    .from("links")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error loading links:", error);
    return;
  }

  renderAccordion(data);
}

function renderAccordion(data) {
  const cardsDiv = document.getElementById("cards");

  // Group by category
  const grouped = {};
  data.forEach(link => {
    const category = link.category || "General";
    if (!grouped[category]) grouped[category] = [];
    grouped[category].push(link);
  });

  let html = "";

  Object.keys(grouped).forEach(category => {
    const links = grouped[category];

    let linksHTML = "";
    links.forEach(link => {
      linksHTML += `
        <div class="link-item">
          <h4>${link.title}</h4>
          <a href="${link.url}" target="_blank">${link.url}</a>
          <small>${new Date(link.created_at).toLocaleString()}</small>
        </div>
      `;
    });

    html += `
      <div class="category-card">
        <div class="category-header" onclick="toggleCategory(this)">
          <span>${category}</span>
          <span class="count">${links.length}</span>
        </div>
        <div class="category-body">
          ${linksHTML}
        </div>
      </div>
    `;
  });

  cardsDiv.innerHTML = html;
}

function toggleCategory(header) {
  const body = header.nextElementSibling;
  body.classList.toggle("open");
}

initApp();
