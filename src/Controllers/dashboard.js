import {
  getbeneficiaries,
  finduserbyaccount,
  findbeneficiarieByid,
  hasPaymentMethodDB,
  checkPaymentMethodDB,
} from "../Models/database.js";
const user = JSON.parse(sessionStorage.getItem("currentUser"));
// DOM elements
const greetingName = document.getElementById("greetingName");
const currentDate = document.getElementById("currentDate");
const solde = document.getElementById("availableBalance");
const incomeElement = document.getElementById("monthlyIncome");
const expensesElement = document.getElementById("monthlyExpenses");
const activecards = document.getElementById("activeCards");
const transactionsList = document.getElementById("recentTransactionsList");
//transfer
const transferBtn = document.getElementById("quickTransfer");
const transferSection = document.getElementById("transferPopup");
const closeTransferBtn = document.getElementById("closeTransferBtn");
const cancelTransferBtn = document.getElementById("cancelTransferBtn");
const beneficiarySelect = document.getElementById("beneficiary");
const sourceCard = document.getElementById("sourceCard");
const submitTransferBtn = document.getElementById("submitTransferBtn");
// recharger
const rechargerBtn = document.getElementById("quickToRecharger");
const submitRechargerBtn = document.getElementById("submitRechargerBtn");
const rechargerSection = document.getElementById("rechargerPopup");
const closeRechargerBtn = document.getElementById("closeRechargerBtn");
const cancelRechargerBtn = document.getElementById("cancelRechargerBtn");
const sourceCardRecharger = document.getElementById("sourceCardRecharger");
// Demander
// const DemanderBtn = document.getElementById("quickRequest");
// const submitDemanderBtn = document.getElementById("submitDemanderBtn");
// const DemanderSection = document.getElementById("DemanderPopup");
// const closeDemanderBtn = document.getElementById("closeDemanderBtn");
// const cancelDemanderBtn = document.getElementById("cancelDemanderBtn");
// const descriptionDemander = document.getElementById("descriptionDemander");
// const accountDemander = document.getElementById("accountDemander");
// Guard
if (!user) {
  alert("User not authenticated");
  window.location.href = "/index.html";
}

// Events
// ! transfer
transferBtn.addEventListener("click", handleTransfersection);
closeTransferBtn.addEventListener("click", closeTransfer);
cancelTransferBtn.addEventListener("click", closeTransfer);
submitTransferBtn.addEventListener("click", handleTransfer);
//! recharger
rechargerBtn.addEventListener("click", handleRechargersection);
closeRechargerBtn.addEventListener("click", closeRecharger);
cancelRechargerBtn.addEventListener("click", closeRecharger);
submitRechargerBtn.addEventListener("click", handleRecharger);
//! Demander
// DemanderBtn.addEventListener("click", handleDemandersection);
// closeDemanderBtn.addEventListener("click", closeDemander);
// cancelDemanderBtn.addEventListener("click", closeDemander);
// submitDemanderBtn.addEventListener("click", handleDemander);

// Retrieve dashboard data
const getDashboardData = () => {
  const monthlyIncome = user.wallet.transactions
    .filter((t) => t.type === "credit")
    .reduce((total, t) => total + t.amount, 0);

  const monthlyExpenses = user.wallet.transactions
    .filter((t) => t.type === "debit")
    .reduce((total, t) => total + t.amount, 0);

  return {
    userName: user.name,
    currentDate: new Date().toLocaleDateString("fr-FR"),
    availableBalance: `${user.wallet.balance} ${user.wallet.currency}`,
    activeCards: user.wallet.cards.length,
    monthlyIncome: `${monthlyIncome} MAD`,
    monthlyExpenses: `${monthlyExpenses} MAD`,
  };
};

function renderDashboard() {
  const dashboardData = getDashboardData();
  if (dashboardData) {
    greetingName.textContent = dashboardData.userName;
    currentDate.textContent = dashboardData.currentDate;
    solde.textContent = dashboardData.availableBalance;
    incomeElement.textContent = dashboardData.monthlyIncome;
    expensesElement.textContent = dashboardData.monthlyExpenses;
    activecards.textContent = dashboardData.activeCards;
  }
  // Display transactions
  transactionsList.innerHTML = "";
  user.wallet.transactions.forEach((transaction) => {
    const transactionItem = document.createElement("div");
    transactionItem.className = "transaction-item";
    transactionItem.innerHTML = `
    <div>${transaction.date}</div>
    <div>${transaction.amount} MAD</div>
    <div>${transaction.type}</div>
  `;
    transactionsList.appendChild(transactionItem);
  });
}
renderDashboard();

// Transfer popup
function closeTransfer() {
  transferSection.classList.remove("active");
  document.body.classList.remove("popup-open");
}

function handleTransfersection() {
  transferSection.classList.add("active");
  document.body.classList.add("popup-open");
}

// Beneficiaries
const beneficiaries = getbeneficiaries(user.id);

function renderBeneficiaries() {
  beneficiaries.forEach((beneficiary) => {
    const option = document.createElement("option");
    option.value = beneficiary.id;
    option.textContent = beneficiary.name;
    beneficiarySelect.appendChild(option);
  });
}
renderBeneficiaries();
function renderCards(selectElement) {
  user.wallet.cards.forEach((card) => {
    const option = document.createElement("option");
    option.value = card.numcards;
    option.textContent = card.type + "****" + card.numcards;
    selectElement.appendChild(option);
  });
}

renderCards(sourceCard);
renderCards(sourceCardRecharger);

//###################################  Transfer  #####################################################//

// check function

function checkUser(numcompte) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const destinataire = finduserbyaccount(numcompte);
      if (destinataire) {
        resolve(destinataire);
      } else {
        reject("Destinataire non trouvé");
      }
    }, 500);
  });
}

function checkSolde(exp, amount) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const solde = exp.wallet.balance;
      if (solde >= amount) {
        resolve("Solde suffisant");
      } else {
        reject("Solde insuffisant");
      }
    }, 400);
  });
}

function updateSolde(exp, destinataire, amount) {
  return new Promise((resolve) => {
    setTimeout(() => {
      exp.wallet.balance -= amount;
      destinataire.wallet.balance += amount;
      resolve("Solde mis à jour");
    }, 300);
  });
}

function addtransactions(exp, destinataire, amount) {
  return new Promise((resolve) => {
    setTimeout(() => {
      // Transaction pour l'expéditeur (débit)
      const transactionDebit = {
        id: Date.now(),
        type: "debit",
        amount: amount,
        from: exp.name,
        to: destinataire.name,
        date: new Date().toLocaleDateString(),
      };

      // Transaction pour le destinataire (crédit)
      const transactionCredit = {
        id: Date.now() + 1,
        type: "credit",
        amount: amount,
        from: exp.name,
        to: destinataire.name,
        date: new Date().toLocaleDateString(),
      };

      user.wallet.transactions.push(transactionDebit);
      destinataire.wallet.transactions.push(transactionCredit);
      renderDashboard();
      resolve("Transaction enregistrée");
    }, 200);
  });
}

export async function transferer(exp, numcompte, amount) {
  try {
    console.log("\n DÉBUT DU TRANSFERT ");
    const destinataire = await checkUser(numcompte);
    console.log(destinataire);
    const checksolde = await checkSolde(exp, amount);
    console.log(checksolde);
    const updatesoldemessage = await updateSolde(exp, destinataire, amount);
    console.log(updatesoldemessage);
    const addtransaction = addtransactions(exp, destinataire, amount);
    console.log(addtransaction);
  } catch (error) {
    console.log(error);
  }
}

function handleTransfer(e) {
  e.preventDefault();
  const beneficiaryId = document.getElementById("beneficiary").value;
  const beneficiaryAccount = findbeneficiarieByid(
    user.id,
    beneficiaryId
  ).account;
  const sourceCard = document.getElementById("sourceCard").value;

  const amount = Number(document.getElementById("amount").value);

  transferer(user, beneficiaryAccount, amount);
}

// recharger popup
function closeRecharger() {
  rechargerSection.classList.remove("active");
  document.body.classList.remove("popup-open");
}

function handleRechargersection() {
  rechargerSection.classList.add("active");
  document.body.classList.add("popup-open");
}

function handleRecharger(e) {
  e.preventDefault();
  const sourceCard = sourceCardRecharger.value;

  const amount = Number(document.getElementById("amountrecharger").value);

  recharger(user, amount, sourceCard);
}

async function recharger(user, amount, sourceCard) {
  try {
    const hasPM = await hasPaymentMethod(user.id);
    console.log(hasPM);
    const checkPM = await checkPaymentMethod(sourceCard, user.id);
    console.log(checkPM);
    const trans = await addTransaction(user, amount, sourceCard);
    console.log(trans);
  } catch (e) {
    console.log(e);
  }
}

function hasPaymentMethod(userID) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const payment = hasPaymentMethodDB(userID);
      if (payment) {
        resolve("Un moyen de paiement est disponible");
      } else {
        reject("Aucun moyen de paiement trouve");
      }
    }, 1000);
  });
}

function checkPaymentMethod(numCard, userID) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const check = checkPaymentMethodDB(numCard, userID);
      if (check) {
        resolve(`${numCard} est une card valide`);
      } else {
        reject(`${numCard} n'est pas une card valide`);
      }
    }, 1000);
  });
}

//type : echoue ou recharge
function simulerServeurresponse() {
  const random = Math.random();
  return random < 0.7 ? "recharge" : "echec";
}
function addTransaction(user, amount, numCard) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      let type = simulerServeurresponse();
      if (type === "recharge") {
        user.wallet.balance += amount;
        user.wallet.cards.find((u) => u.numcards === numCard).balance -= amount;
        user.wallet.transactions.push({
          id: user.wallet.transactions.length + 1,
          type: type,
          amount: amount,
          date: new Date().toLocaleDateString(),
          from: numCard,
          to: "mywallet",
        });
        renderDashboard();
        resolve("la transaction a ete ajouter avec succes");
      }
      // echec
      else {
        user.wallet.transactions.push({
          id: user.wallet.transactions.length + 1,
          type: type,
          amount: amount,
          date: new Date().toLocaleDateString(),
          from: numCard,
          to: "mywallet",
        });
        renderDashboard();

        reject("la transaction a echoue");
      }
    }, 1000);
  });
}

// Demander popup
// function closeDemander() {
//   DemanderSection.classList.remove("active");
//   document.body.classList.remove("popup-open");
// }

// function handleDemandersection() {
//   DemanderSection.classList.add("active");
//   document.body.classList.add("popup-open");
// }

// function handleDemander(e) {
//   e.preventDefault();
//   const description = descriptionDemander.value;
//   demander(user, description);
// }
