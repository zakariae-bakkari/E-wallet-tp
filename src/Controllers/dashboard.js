import { database } from "../Models/database.js";
import logout from "./logout.js";
import { transferMoney } from "./transfer.js";
// recuperer l'user connecté à partir du sessionStorage
const user = JSON.parse(sessionStorage.getItem("user"));
if (user) {
  // afficher les informations de l'utilisateur sur la page
  document.querySelector("#greetingName").textContent = user.name;

  // balance
  document.querySelector("#availableBalance").textContent =
    user.wallet.cards.reduce((total, ba) => total + ba.balance, 0) +
    " " +
    user.wallet.currency;

  // nombre de cartes actives
  document.querySelector("#activeCards").textContent = user.wallet.cards.filter(
    (c) => {
      const [day, month, year] = c.expiry.split("-");
      const expiryDate = new Date(`${year}-${month}-${day}`);
      return expiryDate > new Date();
    }
  ).length;

  // dépenses
  document.querySelector("#monthlyExpenses").textContent =
    user.wallet.transactions
      .filter((t) => t.type === "debit")
      .reduce((total, t) => total + t.amount, 0) +
    " " +
    user.wallet.currency;

  // revenus
  document.querySelector("#monthlyIncome").textContent =
    user.wallet.transactions
      .filter((t) => t.type === "credit")
      .reduce((total, t) => total + t.amount, 0) +
    " " +
    user.wallet.currency;

  //  logout
  document.querySelector("#logout").addEventListener("click", logout);

  // transfer
  const transfersection = document.querySelector("#transfer-section");
  console.log(transfersection);
  document
    .querySelector("#transfers")
    .addEventListener("click", handletransferView);

  // quick transfer
  document
    .querySelector("#quickTransfer")
    .addEventListener("click", handletransferView);

  function handletransferView() {
    transfersection.classList.toggle("hidden");
  }

  // close transfer button
  document.querySelector("#closeTransferBtn").addEventListener("click", () => {
    transfersection.classList.add("hidden");
  });

  // lister les bénéficiaires
  const beneficiarySelect = document.querySelector("#beneficiary");
  database.users.forEach((u) => {
    if (u.name !== user.name) {
      u.wallet.cards.forEach((c) => {
        const option = document.createElement("option");
        option.value = c.numcards;
        option.textContent = `${u.name} - ${c.type} - ${c.numcards}`;
        beneficiarySelect.appendChild(option);
      });
    }
  });

  // lister les cards
  const sourceCard = document.querySelector("#sourceCard");
  user.wallet.cards.forEach((c) => {
    const option = document.createElement("option");
    option.value = c.numcards;
    option.textContent = `${c.type} - ${c.numcards} - ${c.balance} ${user.wallet.currency}`;
    sourceCard.appendChild(option);
  });

  // submit transfer form
  document
    .querySelector("#submitTransferBtn")
    .addEventListener("click", handleSubmitTransfer);

  function handleSubmitTransfer() {
    const amount = parseFloat(document.querySelector("#amount").value);
    const sourceCardNum = document.querySelector("#sourceCard").value;
    const beneficiaryCardNum = document.querySelector("#beneficiary").value;
    transferMoney(amount, sourceCardNum, beneficiaryCardNum);
    transfersection.classList.add("hidden");
    console.log("Transfer submitted");
    console.log(database);
  }
} else {
  // rediriger vers login
  document.location = "Login.html";
}
