// =============================================
// wizard.js — Group creation wizard
// All logic for the 4-step form lives here
// =============================================

// Which step the user is currently on
var currentStep = 1;

// Store what the user typed so Back button works
var savedName        = '';
var savedDescription = '';
var savedAmount      = '';
var savedDate        = '';
var savedCycle       = 'monthly';


// ── Move to a specific step ──────────────────
// This hides the old step and shows the new one
function goToStep(newStep) {

  // Hide the current step using the HTML hidden attribute
  document.getElementById('step-' + currentStep).hidden = true;

  // Update the progress pill for the step we left
  var oldPill = document.getElementById('pill-' + currentStep);
  if (newStep > currentStep) {
    oldPill.className = 'step-pill done';  // going forward = mark done
  } else {
    oldPill.className = 'step-pill';       // going back = clear it
  }

  // Update current step number
  currentStep = newStep;

  // Show the new step by removing the hidden attribute
  document.getElementById('step-' + currentStep).hidden = false;

  // Mark new step as active in progress bar
  document.getElementById('pill-' + currentStep).className = 'step-pill active';
}


// ── Next button clicked ──────────────────────
// Validate the current step first, then move forward
function nextStep() {

  // --- Step 1 validation ---
  if (currentStep === 1) {
    var name = document.getElementById('group-name').value.trim();

    if (name.length < 3 || name.length > 60) {
      // Show the error message
      document.getElementById('err-name').classList.add('show');
      document.getElementById('group-name').classList.add('error-border');
      return; // stop here, don't move forward
    }

    // Valid — save the values and clear errors
    savedName        = name;
    savedDescription = document.getElementById('group-desc').value.trim();
    document.getElementById('err-name').classList.remove('show');
    document.getElementById('group-name').classList.remove('error-border');
  }

  // --- Step 2 validation ---
  if (currentStep === 2) {
    var amount = parseFloat(document.getElementById('contribution-amount').value);
    var date   = document.getElementById('start-date').value;
    var valid  = true;

    // Check amount
    if (isNaN(amount) || amount <= 0) {
      document.getElementById('err-amount').classList.add('show');
      document.getElementById('contribution-amount').classList.add('error-border');
      valid = false;
    } else {
      document.getElementById('err-amount').classList.remove('show');
      document.getElementById('contribution-amount').classList.remove('error-border');
    }

    // Check date is in the future
    var today = new Date();
    today.setHours(0, 0, 0, 0);
    if (!date || new Date(date) <= today) {
      document.getElementById('err-date').classList.add('show');
      document.getElementById('start-date').classList.add('error-border');
      valid = false;
    } else {
      document.getElementById('err-date').classList.remove('show');
      document.getElementById('start-date').classList.remove('error-border');
    }

    if (!valid) return; // stop if anything failed

    // Valid — save values
    savedAmount = amount;
    savedDate   = date;
    // savedCycle is already updated when the pill is clicked
  }

  // --- Step 3 has no validation ---
  // savedPayout is already updated when the pill is clicked

  // If we're about to go to Step 4, fill in the review summary
  if (currentStep === 3) {
    fillReview();
  }

  goToStep(currentStep + 1);
}


// ── Back button clicked ──────────────────────
// Go back one step and restore whatever the user typed before
function prevStep() {
  goToStep(currentStep - 1);

  // Put back the saved values for the step we returned to
  if (currentStep === 1) {
    document.getElementById('group-name').value  = savedName;
    document.getElementById('group-desc').value  = savedDescription;
    updateCharCount(); // refresh the counter
  }

  if (currentStep === 2) {
    document.getElementById('contribution-amount').value = savedAmount;
    document.getElementById('start-date').value          = savedDate;
    selectCycle(savedCycle); // re-highlight the right pill
  }

  if (currentStep === 3) {
    // re-highlight the right pill
  }
}


// ── Cycle pill clicked ───────────────────────
// Highlights the chosen pill and saves the value
function selectCycle(value) {
  savedCycle = value;
  document.getElementById('pill-monthly').className = 'radio-pill' + (value === 'monthly' ? ' selected' : '');
  document.getElementById('pill-weekly').className  = 'radio-pill' + (value === 'weekly'  ? ' selected' : '');
}


// ── Character counter ────────────────────────
// Called every time the user types in the description box
function updateCharCount() {
  var textarea = document.getElementById('group-desc');
  // Hard limit at 300
  if (textarea.value.length > 300) {
    textarea.value = textarea.value.substring(0, 300);
  }
  document.getElementById('desc-count').textContent = textarea.value.length + ' / 300';
}


// ── Fill the Step 4 review ───────────────────
// Puts the saved values into the summary rows
function fillReview() {
  document.getElementById('rev-name').textContent   = savedName;
  document.getElementById('rev-desc').textContent   = savedDescription || '(none)';
  document.getElementById('rev-amount').textContent = 'R ' + parseFloat(savedAmount).toLocaleString('en-ZA');
  document.getElementById('rev-cycle').textContent  = savedCycle === 'monthly' ? 'Monthly' : 'Weekly';
  document.getElementById('rev-date').textContent   = savedDate;
  document.getElementById('rev-payout').textContent = savedPayout === 'rotation' ? 'Rotation (ordered)' : 'Lottery (random)';
}


// ── Submit the group ─────────────────────────
// For now this just shows a success message.
// TODO: replace the alert with a real POST /groups fetch call
//       once Dev 3 delivers the API endpoint.
function submitGroup() {
  alert('Group created! In the real app this redirects to /groups/:id');
  // Real version will be:
  // fetch('/groups', { method: 'POST', body: ... })
  //   .then(res => res.json())
  //   .then(data => window.location.href = '/groups/' + data.id)
}