// ─── Mock data ────────────────────────────────────────────────────────────────
// GET /api/groups_members/:userId already gives us: name, description,
// contributionAmount, cycleType, status, startDate, members, totalMembers
//
// Still mocked because Dev 5 has not built these yet:
//   - cycle number, total, progress, daysRemaining
//   - nextPayout (recipient, date, daysRemaining)
//   - rules: dueDayOfMonth, penaltyRules, payoutOrder
//
// TODO: remove MOCK_CYCLE and MOCK_NEXT_PAYOUT when Dev 5 adds cycle/payout data
// TODO: remove MOCK_RULES when GET /api/groups/:id/rules is ready
const MOCK_CYCLE = {
  number: 4,
  total: 10,
  endDate: "2026-05-31",
  progressPercent: 45,
  daysRemaining: 17
};

const MOCK_NEXT_PAYOUT = {
  recipientName: "Nompumelelo Mokoena",
  payoutDate: "2026-05-31",
  daysRemaining: 17
};

const MOCK_RULES = {
  dueDayOfMonth: 1,
  penaltyRules: "Any member who misses a contribution will be given a 7-day grace period. After that, a penalty of R50 is added for every additional week the contribution remains unpaid.",
  payoutOrder: [
    { memberId: 1,  name: "Thabo Nkosi",         payoutDate: "2026-02-28" },
    { memberId: 2,  name: "Nompumelelo Mokoena",  payoutDate: "2026-03-31" },
    { memberId: 3,  name: "Sipho Dlamini",        payoutDate: "2026-04-30" },
    { memberId: 4,  name: "Zanele Khumalo",       payoutDate: "2026-05-31" },
    { memberId: 5,  name: "Lerato Molefe",        payoutDate: "2026-06-30" },
    { memberId: 6,  name: "Bongani Sithole",      payoutDate: "2026-07-31" },
    { memberId: 7,  name: "Nomsa Zulu",           payoutDate: "2026-08-31" },
    { memberId: 8,  name: "Mpho Radebe",          payoutDate: "2026-09-30" },
    { memberId: 9,  name: "Thandeka Ndlovu",      payoutDate: "2026-10-31" },
    { memberId: 10, name: "Lungelo Mthembu",      payoutDate: "2026-11-30" }
  ]
};

// The logged-in member's userId — used to highlight their row in the payout list
// TODO: replace with the real userId from Dev 2's auth system e.g. auth.user.userId
const CURRENT_USER_ID = 1;

// Four avatar colour pairs — rotated by member index
const AVATAR_COLOURS = ["av-teal", "av-blue", "av-purple", "av-coral"];


// ─── Helper functions ─────────────────────────────────────────────────────────

// Takes a full name like "Nompumelelo Mokoena" and returns "NM"
// .split(" ")     -> ["Nompumelelo", "Mokoena"]
// .slice(0, 2)    -> take only the first two words (handles middle names)
// .map(w => w[0]) -> take the first letter of each word
// .join("")       -> stick them together -> "NM"
// .toUpperCase()  -> make sure they are capital letters
function getInitials(name) {
  return name.trim().split(" ").slice(0, 2).map(w => w[0]).join("").toUpperCase();
}

// Converts a number to a ZAR currency string e.g. 500 -> "R 500,00"
// Dev 5 stores contributionAmount as a full number (not cents)
// so we do NOT divide by 100 here
// Intl.NumberFormat is the browser built-in currency formatter
function formatCurrency(amount) {
  return new Intl.NumberFormat("en-ZA", {
    style: "currency",
    currency: "ZAR",
    minimumFractionDigits: 2
  }).format(amount);
}

// Converts an ISO date string like "2026-05-31" into "31 May 2026"
// new Date(iso) parses the string into a Date object
// .toLocaleDateString formats it for South African English
function formatDate(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-ZA", {
    day: "numeric",
    month: "long",
    year: "numeric"
  });
}

// Builds plain-language due date e.g. "Due every month on the 1st"
function buildCycleSummary(cycleType, dueDayOfMonth) {
  const suffixes = ["th", "st", "nd", "rd"];
  const remainder = dueDayOfMonth % 100;
  // 11, 12, 13 are exceptions — they always use "th"
  const suffix = (remainder >= 11 && remainder <= 13)
    ? "th"
    : suffixes[dueDayOfMonth % 10] || "th";
  return "Due every " + cycleType.toLowerCase() + " on the " + dueDayOfMonth + suffix;
}


// ─── API calls ────────────────────────────────────────────────────────────────

// REAL — fetches all groups the logged-in user belongs to
// GET /api/groups_members/:userId
// Dev 5's API returns a flat array — each item has:
// { groupId, name, description, contributionAmount, cycleType, status,
//   startDate, payoutOrder, totalMembers, members: [{ userId, name, email, role }],
//   createdBy: { userId, name, email }, userRole }
// TODO: replace hardcoded userId with Dev 2's auth e.g. auth.user.userId
async function fetchUserGroups(userId) {
  const response = await fetch("/api/groups_members/" + userId);
  if (!response.ok) throw new Error("Failed to load groups");
  return await response.json();
}

// MOCK — cycle and payout data not yet in Dev 5's API
// TODO: remove this and use real data once Dev 5 adds cycle/payout fields
function getMockCycleAndPayout() {
  return {
    cycle: MOCK_CYCLE,
    nextPayout: MOCK_NEXT_PAYOUT
  };
}

// MOCK — rules not yet in Dev 5's API
// TODO: replace with real fetch when GET /api/groups/:id/rules is ready:
//   const response = await fetch("/api/groups/" + groupId + "/rules");
//   if (!response.ok) throw new Error("Failed to load rules");
//   return await response.json();
function fetchRules(groupId) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      // For now all groups use the same mock rules
      // When the real endpoint exists it will return rules specific to each group
      resolve(MOCK_RULES);
    }, 400);
  });
}


// ─── DOM references ───────────────────────────────────────────────────────────
// We grab all the elements we will be updating once at the top,
// rather than searching for them every time we render.

const groupSelect         = document.getElementById("group-select");
const refreshBtn          = document.getElementById("refresh-btn");
const statusBanner        = document.getElementById("status-banner");
const groupNameEl         = document.getElementById("group-name");
const statusBadgeEl       = document.getElementById("status-badge");
const groupDescEl         = document.getElementById("group-desc");
const cycleLabelEl        = document.getElementById("cycle-label");
const cycleDaysEl         = document.getElementById("cycle-days");
const cycleProgress       = document.getElementById("cycle-progress");
const statMembersEl       = document.getElementById("stat-members");
const statAmountEl        = document.getElementById("stat-amount");
const statCycleEl         = document.getElementById("stat-cycle");
const payoutAvatarEl      = document.getElementById("payout-avatar");
const payoutNameEl        = document.getElementById("payout-name");
const payoutDateEl        = document.getElementById("payout-date");
const countdownEl         = document.getElementById("payout-countdown");
const countdownNumEl      = document.getElementById("countdown-num");
const membersGrid         = document.getElementById("members-grid");
const viewRulesBtn        = document.getElementById("view-rules-btn");
const rulesModal          = document.getElementById("rules-modal");
const closeModalBtn       = document.getElementById("close-modal-btn");
const modalAmount         = document.getElementById("modal-amount");
const modalCycleSummary   = document.getElementById("modal-cycle-summary");
const modalPayoutOrder    = document.getElementById("modal-payout-order");
const modalPenaltySection = document.getElementById("modal-penalty-section");
const modalPenaltyRules   = document.getElementById("modal-penalty-rules");


// ─── Render functions ─────────────────────────────────────────────────────────

// Shows or hides the banner at the top — only for closed groups
// A stokvel cannot be paused, only active or closed
function renderBanner(status) {
  if (status === "active") {
    statusBanner.hidden = true;
    return;
  }
  // status === "closed"
  statusBanner.textContent = "This group is closed. All cycles have been completed.";
  statusBanner.className   = "status-banner closed";
  statusBanner.hidden      = false;
}

// Fills in the group header card
// Uses real API fields: group.name, group.description, group.status, group.startDate
// Uses mock fields: cycle.number, cycle.total, cycle.endDate, cycle.daysRemaining, cycle.progressPercent
function renderGroupHeader(group, cycle) {
  groupNameEl.textContent = group.name;

  statusBadgeEl.textContent = group.status.charAt(0).toUpperCase() + group.status.slice(1);
  statusBadgeEl.className   = "badge " + group.status;

  groupDescEl.textContent = group.description;

  // group.startDate comes from the real API
  // cycle.number, cycle.total, cycle.endDate, cycle.daysRemaining come from mock
  cycleLabelEl.textContent = "Cycle " + cycle.number + " of " + cycle.total + " · " + formatDate(group.startDate) + " – " + formatDate(cycle.endDate);
  cycleDaysEl.textContent  = cycle.daysRemaining > 0 ? cycle.daysRemaining + " days remaining" : "Cycle ended";

  // <progress> is a native HTML element — just set its value attribute
  cycleProgress.value = cycle.progressPercent;
}

// Fills in the three quick-stat cards
// Uses real API fields: group.totalMembers, group.contributionAmount, group.cycleType
function renderStats(group) {
  statMembersEl.textContent = group.totalMembers;
  statAmountEl.textContent  = formatCurrency(group.contributionAmount); // real API field
  statCycleEl.textContent   = group.cycleType;
}

// Fills in the next payout card
// Uses mock nextPayout data until Dev 5 adds this to the API
function renderNextPayout(nextPayout) {
  payoutAvatarEl.textContent = getInitials(nextPayout.recipientName);
  payoutNameEl.textContent   = nextPayout.recipientName;
  payoutDateEl.textContent   = nextPayout.payoutDate
    ? "Scheduled " + formatDate(nextPayout.payoutDate)
    : "Cycle complete";

  // Only show the countdown if we have a real number of days
  if (nextPayout.daysRemaining != null) {
    countdownNumEl.textContent = nextPayout.daysRemaining;
    countdownEl.hidden = false;
  } else {
    countdownEl.hidden = true;
  }
}

// Builds the members grid — one <li> per member
// Uses real API field: group.members — each member has { userId, name, email, role }
// Members only see names and avatars — no contribution statuses shown
function renderMembers(members) {
  // Clear whatever was in the list before (previous group's members)
  membersGrid.innerHTML = "";

  members.forEach((member, index) => {
    const li = document.createElement("li");
    li.className = "member-card";

    // Avatar circle — colour rotates by index using %
    const avatar = document.createElement("span");
    avatar.className   = "member-avatar " + AVATAR_COLOURS[index % AVATAR_COLOURS.length];
    avatar.textContent = getInitials(member.name); // member.name from real API
    li.appendChild(avatar);

    // Member full name
    const name = document.createElement("p");
    name.className   = "member-name";
    name.textContent = member.name;
    li.appendChild(name);

    membersGrid.appendChild(li);
  });
}

// Populates and opens the contribution rules modal
// contributionAmount and cycleType come from the real API (passed in as group)
// dueDayOfMonth, penaltyRules, payoutOrder come from mock rules
function openRulesModal(group, rules) {
  // Use real API contributionAmount and cycleType
  // Use mock dueDayOfMonth until Dev 5 adds it
  modalAmount.textContent       = formatCurrency(group.contributionAmount);
  modalCycleSummary.textContent = buildCycleSummary(group.cycleType, rules.dueDayOfMonth);

  // Payout order list — from mock until Dev 5 builds the rules endpoint
  modalPayoutOrder.innerHTML = "";
  rules.payoutOrder.forEach((entry, index) => {
    const li = document.createElement("li");

    // Highlight the current user's row in green
    // entry.memberId is a number, CURRENT_USER_ID is a number — compare directly
    const isCurrentUser = entry.memberId === CURRENT_USER_ID;
    if (isCurrentUser) li.className = "current-user";

    // Position circle (1, 2, 3...)
    const position = document.createElement("span");
    position.className   = "payout-position";
    position.textContent = index + 1;
    li.appendChild(position);

    // Member name
    const memberName = document.createElement("span");
    memberName.className   = "payout-member-name";
    memberName.textContent = entry.name;
    li.appendChild(memberName);

    // "You" tag — only on the current user's row
    if (isCurrentUser) {
      const youTag = document.createElement("span");
      youTag.className   = "you-tag";
      youTag.textContent = "You";
      li.appendChild(youTag);
    }

    // Payout date
    const date = document.createElement("span");
    date.className   = "payout-date";
    date.textContent = formatDate(entry.payoutDate);
    li.appendChild(date);

    modalPayoutOrder.appendChild(li);
  });

  // Hide penalty section if admin did not configure any rules
  if (rules.penaltyRules) {
    modalPenaltyRules.textContent = rules.penaltyRules;
    modalPenaltySection.hidden    = false;
  } else {
    modalPenaltySection.hidden = true;
  }

  rulesModal.hidden = false;
}

// Closes the modal
function closeRulesModal() {
  rulesModal.hidden = true;
}


// ─── Main load functions ──────────────────────────────────────────────────────

// We store the full list of groups returned by the API
// so we can look up the current group when loading its dashboard
let userGroups = [];

// Finds the group object for a given groupId from the already-fetched list
// This avoids making a second API call just to get the group details
function getGroupById(groupId) {
  return userGroups.find(g => String(g.groupId) === String(groupId));
}

// Renders the full dashboard for the selected group
// Uses real API data where available, mock data for what is still missing
async function loadGroup(groupId) {
  refreshBtn.textContent = "Loading...";
  refreshBtn.disabled    = true;

  try {
    // Get the group from the already-fetched list — no extra API call needed
    const group = getGroupById(groupId);
    if (!group) throw new Error("Group not found");

    // Mock cycle and payout — TODO: remove when Dev 5 adds these to the API
    const { cycle, nextPayout } = getMockCycleAndPayout();

    renderBanner(group.status);
    renderGroupHeader(group, cycle);   // group from API, cycle from mock
    renderStats(group);                // all from API
    renderNextPayout(nextPayout);      // from mock
    renderMembers(group.members);      // members array from API

  } catch (error) {
    statusBanner.textContent = "Error: " + error.message;
    statusBanner.className   = "status-banner closed";
    statusBanner.hidden      = false;

  } finally {
    // finally runs whether the fetch succeeded or failed
    refreshBtn.textContent = "Refresh";
    refreshBtn.disabled    = false;
  }
}

// Fetches rules then opens the modal
// Passes the current group object so the modal can use real contributionAmount and cycleType
async function loadAndOpenRules(groupId) {
  try {
    const group = getGroupById(groupId);
    if (!group) throw new Error("Group not found");

    const rules = await fetchRules(groupId);
    openRulesModal(group, rules); // pass both group (real) and rules (mock)
  } catch (error) {
    alert("Could not load rules: " + error.message);
  }
}

// Fetches the groups the logged-in user belongs to and populates the dropdown
// TODO: replace hardcoded userId with real value from Dev 2's auth system
async function loadUserGroups() {
  const userId = CURRENT_USER_ID; // using same ID as current user for now

  try {
    userGroups = await fetchUserGroups(userId);

    // Each item in the array is a flat group object from the API
    userGroups.forEach(group => {
      const option       = document.createElement("option");
      option.value       = group.groupId;  // real API field
      option.textContent = group.name;     // real API field
      groupSelect.appendChild(option);
    });

    // Load the first group by default
    if (userGroups.length > 0) {
      loadGroup(String(userGroups[0].groupId));
    }

  } catch (error) {
    statusBanner.textContent = "Error loading groups: " + error.message;
    statusBanner.className   = "status-banner closed";
    statusBanner.hidden      = false;
  }
}


// ─── Event listeners ──────────────────────────────────────────────────────────

// When the user picks a different group from the dropdown, load it
groupSelect.addEventListener("change", () => {
  loadGroup(groupSelect.value);
});

// Refresh button re-fetches the group list and reloads the current group
refreshBtn.addEventListener("click", () => {
  groupSelect.innerHTML = ""; // clear old options
  userGroups = [];
  loadUserGroups();
});

// "View rules" fetches rules and opens the modal
viewRulesBtn.addEventListener("click", () => {
  loadAndOpenRules(groupSelect.value);
});

// X button closes the modal
closeModalBtn.addEventListener("click", closeRulesModal);

// Clicking the dark overlay behind the modal also closes it
// event.target is what was clicked — only close if it was the overlay, not the modal box
rulesModal.addEventListener("click", (event) => {
  if (event.target === rulesModal) closeRulesModal();
});

// Pressing Escape closes the modal — keyboard accessibility
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !rulesModal.hidden) closeRulesModal();
});


// ─── Initial page load ────────────────────────────────────────────────────────
// Fetches the real group list from the API then loads the first one
loadUserGroups();
