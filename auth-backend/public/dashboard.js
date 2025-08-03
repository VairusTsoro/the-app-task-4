import { API_URL } from "./index.js";
let selected_user_ids = new Set();
async function render_table() {
    try {
        const res = await fetch(`${API_URL}/dashboard`, {
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('token')
            }
        });
        const users = await res.json();
        const sorted_users = users.sort((a, b) => new Date(b.last_seen) - new Date(a.last_seen));
        const tableBody = document.querySelector('#users-table tbody');
        selected_user_ids.clear();

        if (sorted_users.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="4">No users found</td></tr>';
            return;
        } else {
            tableBody.innerHTML = '';
            sorted_users.forEach(user => {
                const row = document.createElement('tr');
                row.innerHTML = `
                <td><input type="checkbox" class="checkbox-selector" data-user-id="${user.id}"></td>
                <td>${user.is_blocked ? '<i class="fa-solid fa-lock"></i>' : '<i class="fa-solid fa-lock-open"></i>'} ${user.name}</td>
                <td>${user.email}</td>
                <td>${new Date(user.last_seen).toLocaleString()}</td>
            `;
                tableBody.appendChild(row);
            });

            const checkboxes = document.querySelectorAll('input.checkbox-selector[data-user-id]');
            checkboxes.forEach(checkbox => {
                checkbox.addEventListener('change', (e) => {
                    const id = e.target.getAttribute('data-user-id');
                    if (e.target.checked) selected_user_ids.add(id);
                    else selected_user_ids.delete(id);
                });
            });

            document.getElementById('select_all').addEventListener('change', (e) => {
                checkboxes.forEach(cb => {
                    cb.checked = e.target.checked;
                    const id = cb.getAttribute('data-user-id');
                    if (e.target.checked) selected_user_ids.add(id);
                    else selected_user_ids.delete(id);
                });
            });
        }
    } catch (err) {
        console.error('Failed to load users:', err);
    }
}

window.addEventListener('DOMContentLoaded', render_table);

document.getElementById('delete-button').addEventListener('click', async () => {
    if (selected_user_ids.size === 0) return alert('No users selected');
    const confirmDelete = confirm('Are you sure you want to delete selected users?');
    if (!confirmDelete) return;
    const res = await fetch(`${API_URL}/delete-users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: Array.from(selected_user_ids) })
    });
    if (res.ok) render_table();
    else alert('Error deleting users');
});

document.getElementById('block-button').addEventListener('click', async () => {
    if (selected_user_ids.size === 0) return alert('No users selected');
    const confirmBlock = confirm('Are you sure you want to block selected users?');
    if (!confirmBlock) return;
    const res = await fetch(`${API_URL}/block-users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: Array.from(selected_user_ids) })
    });
    if (res.ok) {
        alert('Users blocked');
        render_table();
    } else {
        alert('Error blocking users');
    }
});

document.getElementById('unblock-button').addEventListener('click', async () => {
    if (selected_user_ids.size === 0) return alert('No users selected');
    const confirmUnblock = confirm('Are you sure you want to unblock selected users?');
    if (!confirmUnblock) return;
    const res = await fetch(`${API_URL}/unblock-users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: Array.from(selected_user_ids) })
    });
    if (res.ok) {
        alert('Users unblocked');
        render_table();
    } else {
        alert('Error unblocking users');
    }
});

document.getElementById('logout-button').addEventListener('click', () => {
    localStorage.removeItem('token');
    window.location.href = './login.html';
});

if (!localStorage.getItem('token')) {
    window.location.href = './login.html';
}