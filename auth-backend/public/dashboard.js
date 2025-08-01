window.addEventListener('DOMContentLoaded', async () => {
    try {
        const res = await fetch('http://localhost:4000/api/auth/dashboard');
        const users = await res.json();

        const tableBody = document.querySelector('#users-table tbody');
        // tableBody.innerHTML = '';
        if (users.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="4">No users found</td></tr>';
            return;
        }
        else {
            console.log(users);
            users.forEach(user => {
                const row = document.createElement('tr');
                row.innerHTML = `
                <td><input type="checkbox" name="" id=""></td>
                <td>${user.name}</td>
                <td>${user.email}</td>
                <td>${new Date(user.last_seen).toLocaleString()}</td>
            `;
                tableBody.appendChild(row);
            });
        }

    } catch (err) {
        console.error('Failed to load users:', err);
    }
});
