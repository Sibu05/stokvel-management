// =============================================
// invites.js — Invite management logic
// =============================================

// Populate the group name subtitle from appState
(function populateInvites() {
  var subtitle = document.getElementById('invites-group-name');
  subtitle.textContent = appState.groupName || '';
})();


function sendInvite() {
  var email = document.getElementById('invite-email').value.trim();

  // Validate email
  if (!email || !email.includes('@')) {
    document.getElementById('err-email').classList.add('show');
    document.getElementById('invite-email').classList.add('error-border');
    return;
  }

  document.getElementById('err-email').classList.remove('show');
  document.getElementById('invite-email').classList.remove('error-border');

  // Add the invite row to the table
  addInviteRow(email);

  // Clear the input
  document.getElementById('invite-email').value = '';

  // Hide empty state, show table
  document.getElementById('invite-empty').hidden = true;
  document.getElementById('invite-table').hidden = false;

  // TODO: replace with real POST /groups/:id/invites call
}


function addInviteRow(email) {
  var tbody = document.getElementById('invite-body');
  var rowId = 'inv-' + Date.now();

  var row       = document.createElement('tr');
  row.id        = rowId;
  row.innerHTML =
    '<td>' + email + '</td>' +
    '<td><span class="badge pending">Pending</span></td>' +
    '<td>Today</td>' +
    '<td><button type="button" class="btn danger sm" onclick="revokeInvite(\'' + rowId + '\')">Revoke</button></td>';

  tbody.insertBefore(row, tbody.firstChild);
}


function revokeInvite(rowId) {
  var row = document.getElementById(rowId);

  row.querySelector('.badge').className   = 'badge revoked';
  row.querySelector('.badge').textContent = 'Revoked';

  var btn      = row.querySelector('button');
  btn.disabled = true;
  btn.style.opacity = '0.4';
  btn.style.cursor  = 'default';

  // TODO: replace with real DELETE /groups/:id/invites/:id call
}


function copyLink() {
  var msg    = document.getElementById('copied-msg');
  msg.hidden = false;
  setTimeout(function() { msg.hidden = true; }, 2000);
}