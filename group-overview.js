// ─── Mock data ────────────────────────────────────────────────────────────────
// This stands in for the real API response from GET /groups/:id/dashboard
// When Dev 5 has the endpoint ready, delete this object and update fetchGroup()
const MOCK_GROUPS = {
  "group-1": {
    id: "group-1",
    name: "Soweto Savers",
    description: "A 10-member rotating savings group focused on building household emergency funds and year-end bonuses.",
    status: "active",                  // "active" | "closed" — paused is not a valid status
    cycle: {
      number: 4,
      total: 10,
      startDate: "2026-05-01",         // ISO 8601 date string
      endDate: "2026-05-31",
      progressPercent: 45,             // how far through the cycle we are
      daysRemaining: 17
    },
    stats: {
      totalMembers: 10,
      contributionAmountCents: 50000,  // stored in cents to avoid float errors (R500.00)
      cycleType: "Monthly"
    },
    nextPayout: {
      recipientName: "Nompumelelo Mokoena",
      payoutDate: "2026-05-31",
      daysRemaining: 17
    },
    members: [
      { id: "m1",  name: "Thabo Nkosi"          },
      { id: "m2",  name: "Nompumelelo Mokoena"   },
      { id: "m3",  name: "Sipho Dlamini"         },
      { id: "m4",  name: "Zanele Khumalo"        },
      { id: "m5",  name: "Lerato Molefe"         },
      { id: "m6",  name: "Bongani Sithole"       },
      { id: "m7",  name: "Nomsa Zulu"            },
      { id: "m8",  name: "Mpho Radebe"           },
      { id: "m9",  name: "Thandeka Ndlovu"       },
      { id: "m10", name: "Lungelo Mthembu"       }
    ]
  },
  "group-2": {
    id: "group-2",
    name: "Mzansi Builders",
    description: "A closed group that completed its full rotation cycle in March 2026.",
    status: "closed",                  // all cycles done — group is no longer active
    cycle: {
      number: 8,
      total: 8,
      startDate: "2026-03-01",
      endDate: "2026-03-31",
      progressPercent: 100,
      daysRemaining: 0
    },
    stats: {
      totalMembers: 8,
      contributionAmountCents: 75000,
      cycleType: "Monthly"
    },
    nextPayout: {
      recipientName: "—",
      payoutDate: null,                // null because all cycles are complete
      daysRemaining: null
    },
    members: [
      { id: "m1", name: "Vusi Shabalala"  },
      { id: "m2", name: "Ntombi Msweli"   },
      { id: "m3", name: "Lebo Mokwena"    },
      { id: "m4", name: "Oupa Motsepe"    },
      { id: "m5", name: "Zanele Dube"     },
      { id: "m6", name: "Sipho Nkosi"     },
      { id: "m7", name: "Refilwe Mokoena" },
      { id: "m8", name: "Bonga Sithole"   }
    ]
  }
};  // closes MOCK_GROUPS


// Four avatar background/text colour pairs — we rotate through these by member index
const AVATAR_COLOURS = ["av-teal", "av-blue", "av-purple", "av-coral"];


// ─── Helper functions ──────────────────────────────────────────────────────────

// Takes a full name like "Nompumelelo Mokoena" and returns "NM"
// .split(" ")  → ["Nompumelelo", "Mokoena"]
// .slice(0, 2) → take only the first two words (handles middle names)
// .map(w => w[0]) → take the first letter of each word
// .join("")    → stick them together → "NM"
// .toUpperCase() → make sure they're capital letters
function getInitials(name) {
  return name.trim().split(" ").slice(0, 2).map(w => w[0]).join("").toUpperCase();
}

// Converts cents (integer) to a ZAR currency string e.g. 50000 → "R 500,00"
// We store money in cents to avoid floating point bugs (e.g. 0.1 + 0.2 !== 0.3)
// Intl.NumberFormat is the browser's built-in currency formatter
function formatCurrency(cents) {
  return new Intl.NumberFormat("en-ZA", {
    style: "currency",
    currency: "ZAR",
    minimumFractionDigits: 2
  }).format(cents / 100);
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


// ─── API fetch ────────────────────────────────────────────────────────────────

// Loads a group's dashboard data.
// Currently returns mock data after a short delay to simulate a network call.
//
// TODO: when Dev 5's API is ready, replace the body with:
//   const response = await fetch(`/api/groups/${groupId}/dashboard`);
//   if (!response.ok) throw new Error("Failed to load group");
//   return await response.json();
function fetchGroup(groupId) {
  // Promise lets us write async-style code (loading states, error handling)
  // setTimeout simulates the delay of a real network request
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const data = MOCK_GROUPS[groupId];
      if (data) resolve(data);
      else reject(new Error("Group not found"));
    }, 500);
  });
}


// ─── DOM references ───────────────────────────────────────────────────────────
// We grab all the elements we'll be updating once at the top,
// rather than searching for them every time we render.

const groupSelect    = document.getElementById("group-select");
const refreshBtn     = document.getElementById("refresh-btn");
const statusBanner   = document.getElementById("status-banner");
const groupNameEl    = document.getElementById("group-name");
const statusBadgeEl  = document.getElementById("status-badge");
const groupDescEl    = document.getElementById("group-desc");
const cycleLabelEl   = document.getElementById("cycle-label");
const cycleDaysEl    = document.getElementById("cycle-days");
const cycleProgress  = document.getElementById("cycle-progress");
const statMembersEl  = document.getElementById("stat-members");
const statAmountEl   = document.getElementById("stat-amount");
const statCycleEl    = document.getElementById("stat-cycle");
const payoutAvatarEl = document.getElementById("payout-avatar");
const payoutNameEl   = document.getElementById("payout-name");
const payoutDateEl   = document.getElementById("payout-date");
const countdownEl    = document.getElementById("payout-countdown");
const countdownNumEl = document.getElementById("countdown-num");
const membersGrid    = document.getElementById("members-grid");
const viewRulesBtn   = document.getElementById("view-rules-btn");


// ─── Render functions ─────────────────────────────────────────────────────────

// Shows or hides the banner at the top — only for closed groups
// A stokvel cannot be paused, only active or closed
function renderBanner(status) {
  if (status === "active") {
    // `hidden` is a built-in HTML attribute that hides the element
    statusBanner.hidden = true;
    return;
  }

  // status === "closed"
  statusBanner.textContent = "This group is closed. All cycles have been completed.";
  statusBanner.className = "status-banner closed";
  statusBanner.hidden = false;
}

// Fills in the group header card (name, badge, description, cycle, progress bar)
function renderGroupHeader(group) {
  groupNameEl.textContent = group.name;

  statusBadgeEl.textContent = group.status.charAt(0).toUpperCase() + group.status.slice(1);
  statusBadgeEl.className = "badge " + group.status; // e.g. "badge active"

  groupDescEl.textContent = group.description;

  const c = group.cycle;
  cycleLabelEl.textContent = `Cycle ${c.number} of ${c.total} · ${formatDate(c.startDate)} – ${formatDate(c.endDate)}`;
  cycleDaysEl.textContent  = c.daysRemaining > 0 ? `${c.daysRemaining} days remaining` : "Cycle ended";

  // <progress> is a native HTML element — just set its value attribute
  cycleProgress.value = c.progressPercent;
}

// Fills in the three quick-stat cards
function renderStats(stats) {
  statMembersEl.textContent = stats.totalMembers;
  statAmountEl.textContent  = formatCurrency(stats.contributionAmountCents);
  statCycleEl.textContent   = stats.cycleType;
}

// Fills in the next payout card
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
// Members only see names and avatars — contribution statuses are hidden
// because Sprint 1 story 4 is about understanding your own obligations,
// not seeing what other members have or haven't paid
function renderMembers(members) {
  // Clear whatever was in the list before (previous group's members)
  membersGrid.innerHTML = "";

  members.forEach((member, index) => {
    const li = document.createElement("li");
    li.className = "member-card";

    // Avatar circle showing the member's initials
    // We use % to wrap the colour index: member 0→teal, 1→blue, 2→purple, 3→coral, 4→teal again...
    const avatar = document.createElement("span");
    avatar.className = "member-avatar " + AVATAR_COLOURS[index % AVATAR_COLOURS.length];
    avatar.textContent = getInitials(member.name);
    li.appendChild(avatar);

    // Member's full name
    const name = document.createElement("p");
    name.className = "member-name";
    name.textContent = member.name;
    li.appendChild(name);

    membersGrid.appendChild(li);
  });
}


// ─── Main load function ───────────────────────────────────────────────────────

// Called on page load, when the user switches groups, and when they click Refresh.
// It fetches the group data then calls each render function with the relevant piece.
async function loadGroup(groupId) {
  refreshBtn.textContent = "Loading…";
  refreshBtn.disabled = true;

  try {
    const group = await fetchGroup(groupId);

    // Each render function is responsible for one section of the page
    renderBanner(group.status);
    renderGroupHeader(group);
    renderStats(group.stats);
    renderNextPayout(group.nextPayout);
    renderMembers(group.members);

  } catch (error) {
    // If the fetch fails, show the error in the banner
    statusBanner.textContent = "Error: " + error.message;
    statusBanner.className = "status-banner closed";
    statusBanner.hidden = false;

  } finally {
    // `finally` runs whether the fetch succeeded or failed
    refreshBtn.textContent = "↻ Refresh";
    refreshBtn.disabled = false;
  }
}


// ─── Populate group switcher dropdown ─────────────────────────────────────────

// Build one <option> per group and add it to the <select>
Object.values(MOCK_GROUPS).forEach(group => {
  const option = document.createElement("option");
  option.value = group.id;
  option.textContent = group.name;
  groupSelect.appendChild(option);
});


// ─── Event listeners ──────────────────────────────────────────────────────────

// When the user picks a different group from the dropdown, load it
groupSelect.addEventListener("change", () => {
  loadGroup(groupSelect.value);
});

// Refresh button reloads the currently selected group
refreshBtn.addEventListener("click", () => {
  loadGroup(groupSelect.value);
});



// ─── Initial page load ────────────────────────────────────────────────────────
// Load the first group when the page opens
loadGroup("group-1");


// ─── Contribution rules mock data ─────────────────────────────────────────────
// Rules are set by the group Admin — members can only read them, never edit them
// TODO: replace with real fetch to GET /groups/:id/rules when Dev 5 is ready
const MOCK_RULES = {
  "group-1": {
    contributionAmountCents: 50000,
    cycleType: "Monthly",
    dueDayOfMonth: 1,
    penaltyRules: "Any member who misses a contribution will be given a 7-day grace period. After that, a penalty of R50 is added for every additional week the contribution remains unpaid.",
    payoutOrder: [
      { memberId: "m1",  name: "Thabo Nkosi",         payoutDate: "2026-02-28" },
      { memberId: "m2",  name: "Nompumelelo Mokoena",  payoutDate: "2026-03-31" },
      { memberId: "m3",  name: "Sipho Dlamini",        payoutDate: "2026-04-30" },
      { memberId: "m4",  name: "Zanele Khumalo",       payoutDate: "2026-05-31" },
      { memberId: "m5",  name: "Lerato Molefe",        payoutDate: "2026-06-30" },
      { memberId: "m6",  name: "Bongani Sithole",      payoutDate: "2026-07-31" },
      { memberId: "m7",  name: "Nomsa Zulu",           payoutDate: "2026-08-31" },
      { memberId: "m8",  name: "Mpho Radebe",          payoutDate: "2026-09-30" },
      { memberId: "m9",  name: "Thandeka Ndlovu",      payoutDate: "2026-10-31" },
      { memberId: "m10", name: "Lungelo Mthembu",      payoutDate: "2026-11-30" }
    ]
  },
  "group-2": {
    contributionAmountCents: 75000,
    cycleType: "Monthly",
    dueDayOfMonth: 5,
    penaltyRules: null,
    payoutOrder: [
      { memberId: "m1", name: "Vusi Shabalala",  payoutDate: "2026-01-31" },
      { memberId: "m2", name: "Ntombi Msweli",   payoutDate: "2026-02-28" },
      { memberId: "m3", name: "Lebo Mokwena",    payoutDate: "2026-03-31" },
      { memberId: "m4", name: "Oupa Motsepe",    payoutDate: "2026-04-30" },
      { memberId: "m5", name: "Zanele Dube",     payoutDate: "2026-05-31" },
      { memberId: "m6", name: "Sipho Nkosi",     payoutDate: "2026-06-30" },
      { memberId: "m7", name: "Refilwe Mokoena", payoutDate: "2026-07-31" },
      { memberId: "m8", name: "Bonga Sithole",   payoutDate: "2026-08-31" }
    ]
  }
};

// The logged-in member's ID — used to highlight their row in the payout list
// TODO: replace with the real user ID from Dev 2's auth system
const CURRENT_USER_ID = "m4";


// ─── Modal DOM references ─────────────────────────────────────────────────────
const rulesModal       = document.getElementById("rules-modal");
const closeModalBtn    = document.getElementById("close-modal-btn");
const modalAmount      = document.getElementById("modal-amount");
const modalCycleSummary = document.getElementById("modal-cycle-summary");
const modalPayoutOrder = document.getElementById("modal-payout-order");
const modalPenaltySection = document.getElementById("modal-penalty-section");
const modalPenaltyRules = document.getElementById("modal-penalty-rules");


// ─── Modal helper functions ───────────────────────────────────────────────────

// Builds plain-language due date e.g. "Due every month on the 1st"
function buildCycleSummary(cycleType, dueDayOfMonth) {
  const suffixes = ["th", "st", "nd", "rd"];
  const remainder = dueDayOfMonth % 100;
  // 11, 12, 13 are exceptions — they always use "th"
  const suffix = (remainder >= 11 && remainder <= 13)
    ? "th"
    : suffixes[dueDayOfMonth % 10] || "th";
  return `Due every ${cycleType.toLowerCase()} on the ${dueDayOfMonth}${suffix}`;
}

// Opens the modal and populates it with the current group's rules
function openRulesModal(groupId) {
  const rules = MOCK_RULES[groupId];
  if (!rules) return;

  // Contribution amount
  modalAmount.textContent       = formatCurrency(rules.contributionAmountCents);
  modalCycleSummary.textContent = buildCycleSummary(rules.cycleType, rules.dueDayOfMonth);

  // Payout order list
  modalPayoutOrder.innerHTML = "";
  rules.payoutOrder.forEach((entry, index) => {
    const li = document.createElement("li");
    const isCurrentUser = entry.memberId === CURRENT_USER_ID;
    if (isCurrentUser) li.className = "current-user";

    // Position circle
    const position = document.createElement("span");
    position.className   = "payout-position";
    position.textContent = index + 1;
    li.appendChild(position);

    // Member name
    const name = document.createElement("span");
    name.className   = "payout-member-name";
    name.textContent = entry.name;
    li.appendChild(name);

    // "You" tag for the current user
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

  // Penalty rules — hide the section if none were configured by the admin
  if (rules.penaltyRules) {
    modalPenaltyRules.textContent  = rules.penaltyRules;
    modalPenaltySection.hidden = false;
  } else {
    modalPenaltySection.hidden = true;
  }

  // Show the modal
  rulesModal.hidden = false;
}

// Closes the modal
function closeRulesModal() {
  rulesModal.hidden = true;
}


// ─── Modal event listeners ────────────────────────────────────────────────────

// X button closes the modal
closeModalBtn.addEventListener("click", closeRulesModal);

// Clicking the dark overlay behind the modal also closes it
rulesModal.addEventListener("click", (event) => {
  // event.target is what was actually clicked
  // we only close if the click was on the overlay itself, not inside the modal box
  if (event.target === rulesModal) closeRulesModal();
});

// Pressing Escape closes the modal — keyboard accessibility
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !rulesModal.hidden) closeRulesModal();
});

// "View rules" button opens the modal for the currently selected group
viewRulesBtn.addEventListener("click", () => {
  openRulesModal(groupSelect.value);
});
