// recuperer l'user connecté à partir du sessionStorage
const user = JSON.parse(sessionStorage.getItem("user"));
if (user) {
  // afficher les informations de l'utilisateur sur la page
  document.querySelector("#greetingName").textContent = user.name;

  // balance
  document.querySelector("#availableBalance").textContent =
    user.wallet.balance + " " + user.wallet.currency;

    // nombre de cartes actives
  document.querySelector("#activeCards").textContent = user.wallet.cards.length;

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
} else {
  // rediriger vers login
  document.location = "Login.html";
}
