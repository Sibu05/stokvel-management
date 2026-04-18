const loggedInUser = "You";

const payouts = [
  { member: "You", date: "2026-05-01", amount: 5000, status: "Upcoming" },
  { member: "Alice", date: "2026-06-01", amount: 5000, status: "Pending" },
  { member: "You", date: "2026-07-01", amount: 5000, status: "Pending" },
  { member: "Bob", date: "2026-08-01", amount: 5000, status: "Pending" }
];

// Filter + sort
const userPayouts = payouts
  .filter(p => p.member === loggedInUser)
  .sort((a, b) => new Date(a.date) - new Date(b.date));

// Populate table
const table = document.getElementById("payoutTable");

userPayouts.forEach(p => {
  const row = document.createElement("tr");

  const memberCell = document.createElement("td");
  memberCell.textContent = p.member;

  const dateCell = document.createElement("td");
  dateCell.textContent = p.date;

  const amountCell = document.createElement("td");
  amountCell.textContent = "R" + p.amount;

  const statusCell = document.createElement("td");
  const statusSpan = document.createElement("span");
  statusSpan.textContent = p.status;
  statusSpan.classList.add("status");

  statusCell.appendChild(statusSpan);

  row.appendChild(memberCell);
  row.appendChild(dateCell);
  row.appendChild(amountCell);
  row.appendChild(statusCell);

  table.appendChild(row);
});

// Next payout
if (userPayouts.length > 0) {
  const next = userPayouts[0];

  const nextContainer = document.getElementById("nextPayout");
  nextContainer.textContent =
    "Date: " + next.date + " | Amount: R" + next.amount + " | " + next.status;

  // Countdown
  const today = new Date();
  const payoutDate = new Date(next.date);
  const diffTime = payoutDate - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  const countdown = document.getElementById("countdown");
  countdown.textContent = "In " + diffDays + " days";
}