const supabaseUrl = "https://xwupwqjpykqfsdhexayx.supabase.co";
const supabaseKey = "sb_publishable_622CcX82uuwjmpHunLfNEA_hMjrTPcq";

const supabaseClient = supabase.createClient(supabaseUrl, supabaseKey);

// Global state
let isEditing = false;

// Utility functions
function truncateUrl(url, maxLength = 60) {
  if (url.length <= maxLength) return url;
  return url.substring(0, maxLength) + '...';
}

function formatDate(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now - date);
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) {
    return 'Today at ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } else if (diffDays === 1) {
    return 'Yesterday';
  } else if (diffDays < 7) {
    return diffDays + ' days ago';
  } else {
    return date.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
  }
}

function showLoading(show) {
  let loader = document.getElementById('global-loader');
  
  if (show) {
    if (!loader) {
      loader = document.createElement('div');
      loader.id = 'global-loader';
      loader.className = 'loader-overlay';
      loader.innerHTML = '<div class="loader-spinner"></div>';
      document.body.appendChild(loader);
    }
    loader.style.display = 'flex';
  } else {
    if (loader) {
      loader.style.display = 'none';
    }
  }
}

function showNotification(message, type = 'info') {
  const notification = document.createElement('div');
  notification.className = `notification notification-${type}`;
  
  const icon = type === 'success' ? '✓' : type === 'error' ? '✕' : type === 'warning' ? '⚠' : 'ℹ';
  
  notification.innerHTML = `
    <span class="notification-icon">${icon}</span>
    <span class="notification-message">${message}</span>
  `;
  
  document.body.appendChild(notification);
  
  setTimeout(() => notification.classList.add('show'), 10);
  
  setTimeout(() => {
    notification.classList.remove('show');
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

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
  showLoading(true);
  
  const { data, error } = await supabaseClient
    .from("links")
    .select("*")
    .order("created_at", { ascending: false });

  showLoading(false);
  
  if (error) {
    console.error("Error loading links:", error);
    showNotification("Error loading links", "error");
    return;
  }

  console.log('Loaded links from database:', data?.length || 0, 'records');
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
          <div class="link-content">
            <h4 class="link-title">${escapeHtml(link.title)}</h4>
            <a href="${link.url}" target="_blank" class="link-url">${truncateUrl(link.url)}</a>
            <small class="link-date">📅 ${formatDate(link.created_at)}</small>
          </div>
          <div class="link-actions">
            <button class="action-btn edit-btn" onclick="editLink('${link.id}')" title="Edit">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
              </svg>
            </button>
            <button class="action-btn delete-btn" onclick="deleteLink('${link.id}')" title="Delete">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="3 6 5 6 21 6"></polyline>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
              </svg>
            </button>
          </div>
        </div>
      `;
    });

    html += `
      <div class="category-card">
        <div class="category-header" onclick="toggleCategory(this)">
          <div class="header-left">
            <span class="category-icon">📁</span>
            <span class="category-name">${escapeHtml(category)}</span>
          </div>
          <div class="header-right">
            <span class="count">${links.length} ${links.length === 1 ? 'link' : 'links'}</span>
            <button class="action-btn category-edit-btn" onclick="event.stopPropagation(); editCategory('${encodeURIComponent(category)}')" title="Rename Category">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
              </svg>
            </button>
            <span class="expand-icon">▼</span>
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
  const newCategory = prompt('✏️ Rename category', oldCategory);
  
  if (newCategory == null) return; // cancelled
  if (newCategory.trim() === '') {
    showNotification('Category name cannot be empty', 'error');
    return;
  }
  if (newCategory === oldCategory) return;

  showLoading(true);
  
  const { data, error } = await supabaseClient
    .from('links')
    .update({ category: newCategory.trim() })
    .eq('category', oldCategory);

  showLoading(false);
  
  if (error) {
    console.error('Error renaming category:', error);
    showNotification('Failed to rename category', 'error');
    return;
  }

  showNotification(`Category renamed to "${newCategory}"`, 'success');
  loadLinks();
}

async function editLink(id) {
  if (isEditing) {
    showNotification('Please finish current edit first', 'warning');
    return;
  }
  
  const item = document.querySelector(`[data-id="${id}"]`);
  if (!item) return;

  isEditing = true;
  showLoading(true);
  
  // Fetch latest record from database
  const { data, error } = await supabaseClient
    .from('links')
    .select('*')
    .eq('id', id)
    .single();

  showLoading(false);
  
  if (error) {
    console.error('Error fetching link for edit:', error);
    showNotification('Failed to load link data', 'error');
    isEditing = false;
    return;
  }

  const link = data;
  const originalHTML = item.innerHTML;

  item.classList.add('editing');
  item.innerHTML = `
    <div class="edit-form">
      <div class="edit-field">
        <label>📝 Title</label>
        <input type="text" class="edit-input edit-title" value="${escapeHtml(link.title || '')}" placeholder="Enter link title">
      </div>
      <div class="edit-field">
        <label>📁 Category</label>
        <input type="text" class="edit-input edit-category" value="${escapeHtml(link.category || '')}" placeholder="Enter category">
      </div>
      <div class="edit-field">
        <label>🔗 URL</label>
        <input type="url" class="edit-input edit-url" value="${escapeHtml(link.url || '')}" placeholder="Enter URL">
      </div>
      <div class="edit-actions">
        <button class="btn-save" onclick="saveLink('${id}')">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
          Save
        </button>
        <button class="btn-cancel" onclick="cancelEdit('${id}')">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
          Cancel
        </button>
      </div>
    </div>
  `;
  
  // Store original HTML for cancel
  item.dataset.originalHtml = originalHTML;
  
  // Focus first input
  setTimeout(() => {
    const firstInput = item.querySelector('.edit-title');
    if (firstInput) firstInput.focus();
  }, 50);
}


async function saveLink(id) {
  const item = document.querySelector(`[data-id="${id}"]`);
  if (!item) return;

  const titleInput = item.querySelector('.edit-title');
  const categoryInput = item.querySelector('.edit-category');
  const urlInput = item.querySelector('.edit-url');

  // Validation
  if (!titleInput?.value.trim()) {
    showNotification('Title cannot be empty', 'error');
    titleInput?.focus();
    return;
  }
  
  if (!urlInput?.value.trim()) {
    showNotification('URL cannot be empty', 'error');
    urlInput?.focus();
    return;
  }

  // Validate URL format
  try {
    new URL(urlInput.value.trim());
  } catch (e) {
    showNotification('Please enter a valid URL', 'error');
    urlInput?.focus();
    return;
  }

  const updated = {
    title: titleInput.value.trim(),
    category: categoryInput?.value.trim() || 'General',
    url: urlInput.value.trim()
  };

  showLoading(true);
  
  const { data, error } = await supabaseClient
    .from('links')
    .update(updated)
    .eq('id', id);

  showLoading(false);
  
  if (error) {
    console.error('Error updating link:', error);
    showNotification('Failed to update link', 'error');
    return;
  }

  isEditing = false;
  showNotification('Link updated successfully', 'success');
  loadLinks();
}

function cancelEdit(id) {
  isEditing = false;
  const item = document.querySelector(`[data-id="${id}"]`);
  
  if (item && item.dataset.originalHtml) {
    item.innerHTML = item.dataset.originalHtml;
    item.classList.remove('editing');
    delete item.dataset.originalHtml;
  } else {
    loadLinks();
  }
}

async function deleteLink(id) {
  console.log('Attempting to delete link with ID:', id);
  
  // Get link details for confirmation message
  const item = document.querySelector(`[data-id="${id}"]`);
  const title = item?.querySelector('.link-title')?.textContent || 'this link';
  
  const confirmDelete = confirm(`🗑️ Are you sure you want to delete "${title}"?\n\nThis action cannot be undone.`);
  
  if (!confirmDelete) return;

  showLoading(true);
  
  try {
    const { data, error } = await supabaseClient
      .from('links')
      .delete()
      .eq('id', id)
      .select();

    console.log('Delete response:', { data, error });

    showLoading(false);
    
    if (error) {
      console.error('Error deleting link:', error);
      showNotification('Failed to delete link: ' + error.message, 'error');
      return;
    }

    // Check if any rows were actually deleted
    if (!data || data.length === 0) {
      console.error('No rows deleted - likely RLS policy issue');
      showNotification('Delete blocked by database permissions. Please check Supabase RLS policies.', 'error');
      return;
    }

    showNotification('Link deleted successfully', 'success');
    
    // Force immediate reload without animation to ensure UI updates
    loadLinks();
    
  } catch (err) {
    showLoading(false);
    console.error('Exception while deleting:', err);
    showNotification('Error deleting link', 'error');
  }
}

function toggleCategory(header) {
  const body = header.nextElementSibling;
  const icon = header.querySelector('.expand-icon');
  
  body.classList.toggle("open");
  
  if (icon) {
    icon.style.transform = body.classList.contains('open') ? 'rotate(180deg)' : 'rotate(0deg)';
  }
}

// Initialize app on load
initApp();
