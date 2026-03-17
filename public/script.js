const API = 'https://crud-task-tjpz.onrender.com/api/tasks';

async function loadTasks() {
  try {
    const res = await fetch(API);
    const tasks = await res.json();
    renderTable(tasks);
  } catch (err) {
    showStatus('❌ Cannot connect to server. Is it running?', 'error');
    document.getElementById('taskTableBody').innerHTML =
      '<tr><td colspan="6" class="empty-msg">Failed to load tasks.</td></tr>';
  }
}

function renderTable(tasks) {
  const tbody = document.getElementById('taskTableBody');
  if (tasks.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6" class="empty-msg">No tasks yet. Add one above!</td></tr>';
    return;
  }
  tbody.innerHTML = tasks.map((task, i) => `
    <tr>
      <td>${i + 1}</td>
      <td>${escapeHTML(task.name || '')}</td>
      <td>${escapeHTML(task.title)}</td>
      <td>${task.description ? escapeHTML(task.description) : '<span class="na">—</span>'}</td>
      <td>${task.dueDate ? formatDate(task.dueDate) : '<span class="na">—</span>'}</td>
      <td class="actions">
        <button class="edit-btn" onclick="editTask('${task._id}', \`${escapeJS(task.name || '')}\`, \`${escapeJS(task.title)}\`, \`${escapeJS(task.description || '')}\`, '${task.dueDate ? task.dueDate.split('T')[0] : ''}')">✏️ Edit</button>
        <button class="delete-btn" onclick="deleteTask('${task._id}')">🗑️ Delete</button>
      </td>
    </tr>
  `).join('');
}

async function submitTask() {
  const id = document.getElementById('editId').value;
  const name = document.getElementById('name').value.trim();
  const title = document.getElementById('title').value.trim();
  const description = document.getElementById('description').value.trim();
  const dueDate = document.getElementById('dueDate').value;

  if (!name) { showStatus('⚠️ Name is required!', 'warning'); return; }
  if (!title) { showStatus('⚠️ Title is required!', 'warning'); return; }

  const payload = { name, title, description, dueDate };

  try {
    if (id) {
      const res = await fetch(`${API}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error();
      showStatus('✅ Task updated successfully!', 'success');
    } else {
      const res = await fetch(API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error();
      showStatus('✅ Task added successfully!', 'success');
    }
    resetForm();
    loadTasks();
  } catch (err) {
    showStatus('❌ Failed to save task.', 'error');
  }
}

function editTask(id, name, title, description, dueDate) {
  document.getElementById('editId').value = id;
  document.getElementById('name').value = name;
  document.getElementById('title').value = title;
  document.getElementById('description').value = description;
  document.getElementById('dueDate').value = dueDate;
  document.getElementById('formTitle').textContent = '✏️ Edit Task';
  document.getElementById('submitBtn').textContent = '💾 Update Task';
  document.getElementById('cancelBtn').classList.remove('hidden');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function cancelEdit() { resetForm(); }

async function deleteTask(id) {
  if (!confirm('Are you sure you want to delete this task?')) return;
  try {
    const res = await fetch(`${API}/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error();
    showStatus('🗑️ Task deleted.', 'success');
    loadTasks();
  } catch (err) {
    showStatus('❌ Failed to delete task.', 'error');
  }
}

function resetForm() {
  document.getElementById('editId').value = '';
  document.getElementById('name').value = '';
  document.getElementById('title').value = '';
  document.getElementById('description').value = '';
  document.getElementById('dueDate').value = '';
  document.getElementById('formTitle').textContent = 'Add New Task';
  document.getElementById('submitBtn').textContent = '➕ Add Task';
  document.getElementById('cancelBtn').classList.add('hidden');
}

function showStatus(msg, type) {
  const banner = document.getElementById('statusBanner');
  banner.textContent = msg;
  banner.className = `status-banner ${type}`;
  setTimeout(() => { banner.className = 'status-banner hidden'; }, 3000);
}

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

function escapeHTML(str) {
  return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function escapeJS(str) {
  return str.replace(/`/g,'\\`').replace(/\$/g,'\\$');
}

loadTasks();