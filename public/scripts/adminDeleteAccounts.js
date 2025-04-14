$(".remove").addClass("current");

let pendingDelete = { id: null, type: null };

function showModal(type, id) {
  pendingDelete = { type, id };
  $('#deleteModal').removeClass('hidden');
}

document.getElementById('cancelBtn').addEventListener('click', () => {
  pendingDelete = { id: null, type: null };
  $('#deleteModal').addClass('hidden');
});

document.getElementById('confirmDeleteBtn').addEventListener('click', async () => {
  const { id } = pendingDelete;

  const res = await fetch(`/accounts/${id}`, {
    method: 'DELETE'
  });

  const result = await res.json();

  $('#deleteModal').addClass('hidden');
  showMessageModal("Account successfully deleted!")
  loadAccounts();
});

async function loadAccounts() {
  const res = await fetch('/api/loadAdminAccounts');
  const accounts = await res.json();
  const tbody = document.querySelector('#accountsTable tbody');
  tbody.innerHTML = "";

  accounts.forEach(account => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${account.id}</td>
      <td>${account.name}</td>
      <td>${account.username}</td>
      <td>${account.role}</td>
      <td><button onclick="showModal('${account.role}', ${account.id})">Delete</button></td>
    `;
    tbody.appendChild(row);
  });
}

function showMessageModal(message) {
  const $modal = $('#messageModalSuccess');
  $('#messageBody').text(message);

  $modal.removeClass('hidden');
}

function showMessageModalFail(message) {
  const $modal = $('#messageModalFail');
  $('#messageBodyFail').text(message);

  $modal.removeClass('hidden');
}

$('#closeMessageBtn').on('click', function () {
  $('#messageModalSuccess').addClass('hidden');
});

$('#closeMessageBtnFail').on('click', function () {
  $('#messageModalFail').addClass('hidden');
});

loadAccounts();