const supabaseUrl = "https://xwupwqjpykqfsdhexayx.supabase.co";
const supabaseKey = "sb_publishable_622CcX82uuwjmpHunLfNEA_hMjrTPcq";

const supabaseClient = supabase.createClient(supabaseUrl, supabaseKey);

async function initApp() {
  const app = document.getElementById("app");

  app.innerHTML = `
    <header>
      <h1>📊 NS LinkSnapper</h1>
      <p>Links Vault</p>
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
        <div class="link-item" data-id="${link.id}">
          <h4 class="link-title">${link.title}</h4>
          <a href="${link.url}" target="_blank">${link.url}</a>
          <small>${new Date(link.created_at).toLocaleString()}</small>
          <div class="actions">
            <button class="menu-btn" onclick="toggleMenu('${link.id}', event)">⋮</button>
            <div id="menu-${link.id}" class="menu" onclick="event.stopPropagation()">
              <button class="menu-item" onclick="editLink('${link.id}')">Edit</button>
              <button class="menu-item danger" onclick="deleteLink('${link.id}')">Delete</button>
            </div>
          </div>
        </div>
      `;
    });

    html += `
      <div class="category-card">
        <div class="category-header" onclick="toggleCategory(this)">
          <div class="header-left"><span>${category}</span></div>
          <div class="header-right">
            <span class="count">${links.length}</span>
            <button class="menu-btn header-menu" onclick="event.stopPropagation(); toggleCategoryMenu('${encodeURIComponent(category)}', event)">⋮</button>
            <div id="catmenu-${encodeURIComponent(category)}" class="menu" onclick="event.stopPropagation()">
              <button class="menu-item" onclick="editCategory('${encodeURIComponent(category)}')">Edit Category</button>
            </div>
          </div>
        </div>
        <div class="category-body">
          ${linksHTML}
        </div>
      </div>
    `;
  });

  cardsDiv.innerHTML = html;
}

async function editCategory(encodedCategory) {
  const oldCategory = decodeURIComponent(encodedCategory);
  const newCategory = prompt('Rename category', oldCategory);
  if (newCategory == null) return; // cancelled
  if (newCategory === oldCategory) return;

  const { data, error } = await supabaseClient
    .from('links')
    .update({ category: newCategory })
    .eq('category', oldCategory);

  if (error) {
    console.error('Error renaming category:', error);
    return;
  }

  loadLinks();
}

async function editLink(id) {
  const item = document.querySelector(`[data-id="${id}"]`);
  if (!item) return;

  // fetch latest record
  const { data, error } = await supabaseClient
    .from('links')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching link for edit:', error);
    return;
  }

  const link = data;

  item.innerHTML = `
    <div class="edit-row">
      <input class="edit-title" value="${escapeHtml(link.title || '')}" placeholder="Title">
      <input class="edit-category" value="${escapeHtml(link.category || '')}" placeholder="Category">
      <div class="edit-actions">
        <button onclick="saveLink('${id}')">Save</button>
        <button onclick="cancelEdit('${id}')">Cancel</button>
      </div>
    </div>
  `;
}

async function saveLink(id) {
  const item = document.querySelector(`[data-id="${id}"]`);
  if (!item) return;

  const titleInput = item.querySelector('.edit-title');
  const categoryInput = item.querySelector('.edit-category');

  const updated = {};
  if (titleInput) updated.title = titleInput.value;
  if (categoryInput) updated.category = categoryInput.value;

  const { data, error } = await supabaseClient
    .from('links')
    .update(updated)
    .eq('id', id);

  if (error) {
    console.error('Error updating link:', error);
    return;
  }

  loadLinks();
}

function cancelEdit(id) {
  loadLinks();
}

async function deleteLink(id) {
  if (!confirm('Delete this link?')) return;

  const { data, error } = await supabaseClient
    .from('links')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting link:', error);
    return;
  }

  loadLinks();
}

function toggleMenu(id, evt) {
  if (evt && evt.stopPropagation) evt.stopPropagation();
  closeAllMenus();
  const menu = document.getElementById(`menu-${id}`);
  if (menu) menu.classList.toggle('open');
}

function closeAllMenus() {
  document.querySelectorAll('.menu.open').forEach(m => m.classList.remove('open'));
}

// close menus on outside click
document.addEventListener('click', function () {
  closeAllMenus();
});

// simple escape for values injected into templates
function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function toggleCategory(header) {
  const body = header.nextElementSibling;
  body.classList.toggle("open");
}

initApp();
