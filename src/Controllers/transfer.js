import { database, ExistBeneficaire, saveDatabase } from "../Models/database.js";

function getCurrentUser() {
  return JSON.parse(sessionStorage.getItem("user"));
}

// Entry point
function transfer(
  checkamountCallback,
  amount,
  cardfrom,
  cardto,
  checksoldeCallback,
  checkbeneficaireCallback,
  executeTransferCallback,
  onSuccessCallback,
  onErrorCallback
) {
  setTimeout(() => {
    checkamountCallback(
      amount,
      cardfrom,
      cardto,
      checksoldeCallback,
      checkbeneficaireCallback,
      executeTransferCallback,
      onSuccessCallback,
      onErrorCallback
    );
  }, 1000);
}

function checkamount(
  amount,
  cardfrom,
  cardto,
  checksoldeCallback,
  checkbeneficaireCallback,
  executeTransferCallback,
  onSuccessCallback,
  onErrorCallback
) {
  setTimeout(() => {
    if (amount > 0) {
      checksoldeCallback(
        amount,
        cardfrom,
        cardto,
        checkbeneficaireCallback,
        executeTransferCallback,
        onSuccessCallback,
        onErrorCallback
      );
    } else {
      if (onErrorCallback) onErrorCallback("Le montant doit être positif.");
    }
  }, 1000);
}

function checksolde(
  amount,
  cardfrom,
  cardto,
  checkbeneficaireCallback,
  executeTransferCallback,
  onSuccessCallback,
  onErrorCallback
) {
  setTimeout(() => {
    if (cardfrom.balance >= amount) {
      checkbeneficaireCallback(
        amount,
        cardfrom,
        cardto,
        executeTransferCallback,
        onSuccessCallback,
        onErrorCallback
      );
    } else {
      if (onErrorCallback) onErrorCallback("Solde insuffisant.");
    }
  }, 1000);
}

function checkbeneficaire(
  amount,
  cardfrom,
  cardto,
  executeTransferCallback,
  onSuccessCallback,
  onErrorCallback
) {
  setTimeout(() => {
    if (ExistBeneficaire(cardto.numcards)) {
      executeTransferCallback(amount, cardfrom, cardto, onSuccessCallback, onErrorCallback);
    } else {
      if (onErrorCallback) onErrorCallback("Bénéficiaire introuvable.");
    }
  }, 1000);
}

function executeTransfer(amount, cardfrom, cardto, onSuccessCallback, onErrorCallback) {
  setTimeout(() => {
    const currentUser = getCurrentUser();
    if (!currentUser) {
      if (onErrorCallback) onErrorCallback("Utilisateur non connecté.");
      return;
    }

    const userInDatabase = database.users.find((u) => u.email === currentUser.email);
    const beneficiaryInDatabase = database.users.find((u) =>
      u.wallet.cards.some((c) => c.numcards === cardto.numcards)
    );

    if (!userInDatabase || !beneficiaryInDatabase) {
      if (onErrorCallback) onErrorCallback("Erreur de base de données.");
      return;
    }

    const senderCard = userInDatabase.wallet.cards.find((c) => c.numcards === cardfrom.numcards);
    const beneficiaryCard = beneficiaryInDatabase.wallet.cards.find((c) => c.numcards === cardto.numcards);

    if (!senderCard || !beneficiaryCard) {
      if (onErrorCallback) onErrorCallback("Carte introuvable.");
      return;
    }

    senderCard.balance -= amount;
    beneficiaryCard.balance += amount;

    const transaction = {
      id: Date.now().toString(),
      type: "debit",
      amount,
      date: new Date().toISOString().split("T")[0],
      from: senderCard.numcards,
      to: beneficiaryCard.numcards,
    };

    const beneficiaryTransaction = {
      ...transaction,
      type: "credit",
    };

    userInDatabase.wallet.transactions.push(transaction);
    beneficiaryInDatabase.wallet.transactions.push(beneficiaryTransaction);

    saveDatabase(database);
    sessionStorage.setItem("user", JSON.stringify(userInDatabase));

    if (onSuccessCallback) onSuccessCallback(transaction);
  }, 1000);
}

function transferMoney(amount, cardfromNum, cardtoNum, onSuccessCallback, onErrorCallback) {
  const currentUser = getCurrentUser();

  if (!currentUser) {
    if (onErrorCallback) onErrorCallback("Utilisateur non connecté.");
    return;
  }

  const userInDatabase = database.users.find((u) => u.email === currentUser.email);

  if (!userInDatabase) {
    if (onErrorCallback) onErrorCallback("Utilisateur introuvable.");
    return;
  }

  const cardfrom = userInDatabase.wallet.cards.find((c) => c.numcards === cardfromNum);
  const cardto = database.users
    .flatMap((u) => u.wallet.cards)
    .find((c) => c.numcards === cardtoNum);

  if (!cardfrom) {
    if (onErrorCallback) onErrorCallback("Carte source introuvable.");
    return;
  }

  if (!cardto) {
    if (onErrorCallback) onErrorCallback("Carte bénéficiaire introuvable.");
    return;
  }

  transfer(
    checkamount,
    amount,
    cardfrom,
    cardto,
    checksolde,
    checkbeneficaire,
    executeTransfer,
    onSuccessCallback,
    onErrorCallback
  );
}

export { transferMoney };