import { database } from "../Models/database.js";
import logout from "./logout.js";
import { transferMoney } from "./transfer.js";

function getCurrentUser() {
  return JSON.parse(sessionStorage.getItem("user"));
}

function formatMoney(value, currency) {
  return `${value} ${currency}`;
}

function isCardActive(expiry) {
  const [day, month, year] = expiry.split("-");
  return new Date(`${year}-${month}-${day}`) > new Date();
}

function renderSummary(user) {
  document.querySelector("#greetingName").textContent = user.name;

  document.querySelector("#availableBalance").textContent = formatMoney(
    user.wallet.cards.reduce((total, c) => total + c.balance, 0),
    user.wallet.currency
  );

  document.querySelector("#activeCards").textContent = user.wallet.cards.filter((c) =>
    isCardActive(c.expiry)
  ).length;

  document.querySelector("#monthlyExpenses").textContent = formatMoney(
    user.wallet.transactions
      .filter((t) => t.type === "debit")
      .reduce((total, t) => total + t.amount, 0),
    user.wallet.currency
  );

  document.querySelector("#monthlyIncome").textContent = formatMoney(
    user.wallet.transactions
      .filter((t) => t.type === "credit")
      .reduce((total, t) => total + t.amount, 0),
    user.wallet.currency
  );
}

function renderSourceCards(user) {
  const sourceCard = document.querySelector("#sourceCard");
  sourceCard.innerHTML = `<option value="" disabled selected>Sélectionner une carte</option>`;

  user.wallet.cards.forEach((c) => {
    const option = document.createElement("option");
    option.value = c.numcards;
    option.textContent = `${c.type} - ${c.numcards} - ${c.balance} ${user.wallet.currency}`;
    sourceCard.appendChild(option);
  });
}

function renderBeneficiaries(user) {
  const beneficiarySelect = document.querySelector("#beneficiary");
  beneficiarySelect.innerHTML = `<option value="" disabled selected>Choisir un bénéficiaire</option>`;

  database.users.forEach((u) => {
    if (u.email !== user.email) {
      u.wallet.cards.forEach((c) => {
        const option = document.createElement("option");
        option.value = c.numcards;
        option.textContent = `${u.name} - ${c.type} - ${c.numcards}`;
        beneficiarySelect.appendChild(option);
      });
    }
  });
}

function renderRecentTransactions(user) {
  const container = document.querySelector("#recentTransactionsList");
  container.innerHTML = "";

  const recentTransactions = [...user.wallet.transactions]
    .slice()
    .reverse()
    .slice(0, 5);

  if (recentTransactions.length === 0) {
    container.innerHTML = `<p>Aucune transaction trouvée.</p>`;
    return;
  }

  recentTransactions.forEach((t) => {
    const item = document.createElement("div");
    item.className = "transaction-item";
    item.innerHTML = `
      <div>
        <strong>${t.type === "debit" ? "Transfert envoyé" : "Transfert reçu"}</strong>
        <p>${t.date}</p>
      </div>
      <div>
        <strong>${t.type === "debit" ? "-" : "+"}${t.amount} MAD</strong>
        <p>De: ${t.from} | Vers: ${t.to}</p>
      </div>
    `;
    container.appendChild(item);
  });
}

function refreshDashboard() {
  const updatedUser = getCurrentUser();
  if (!updatedUser) {
    document.location = "login.html";
    return;
  }

  renderSummary(updatedUser);
  renderSourceCards(updatedUser);
  renderBeneficiaries(updatedUser);
  renderRecentTransactions(updatedUser);
}

const user = getCurrentUser();

if (user) {
  refreshDashboard();

  document.querySelector("#logout").addEventListener("click", logout);

  const transferSection = document.querySelector("#transfer-section");

  function handleTransferView() {
    transferSection.classList.toggle("hidden");
  }

  document.querySelector("#transfers").addEventListener("click", handleTransferView);
  document.querySelector("#quickTransfer").addEventListener("click", handleTransferView);

  document.querySelector("#closeTransferBtn").addEventListener("click", () => {
    transferSection.classList.add("hidden");
  });

  document.querySelector("#submitTransferBtn").addEventListener("click", function (e) {
    e.preventDefault();

    const amount = parseFloat(document.querySelector("#amount").value);
    const sourceCardNum = document.querySelector("#sourceCard").value;
    const beneficiaryCardNum = document.querySelector("#beneficiary").value;

    transferMoney(
      amount,
      sourceCardNum,
      beneficiaryCardNum,
      function () {
        refreshDashboard();
        transferSection.classList.add("hidden");
        document.querySelector("#transferForm").reset();
        alert("Transfert effectué avec succès.");
      },
      function (message) {
        alert(message);
      }
    );
  });
} else {
  document.location = "login.html";
}