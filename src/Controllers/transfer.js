import { database, ExistBeneficaire } from "../Models/database.js";

const user = JSON.parse(sessionStorage.getItem("user"));

// Entry point: orchestrates the nested callback chain
function transfer(
  checkamountCallback,
  amount,
  cardfrom,
  cardto,
  checksoldeCallback,
  checkbeneficaireCallback,
  executeTransferCallback
) {
  setTimeout(() => {
    checkamountCallback(amount, cardfrom, cardto, checksoldeCallback, checkbeneficaireCallback, executeTransferCallback);
  }, 1000);
}

// Step 1 — Check that amount is positive
function checkamount(amount, cardfrom, cardto, checksoldeCallback, checkbeneficaireCallback, executeTransferCallback) {
  setTimeout(() => {
    if (amount > 0) {
      checksoldeCallback(amount, cardfrom, cardto, checkbeneficaireCallback, executeTransferCallback);
    } else {
      console.error("Le montant doit être positif");
    }
  }, 1000);
}

// Step 2 — Check that the source card has enough balance
function checksolde(amount, cardfrom, cardto, checkbeneficaireCallback, executeTransferCallback) {
  setTimeout(() => {
    if (cardfrom.balance >= amount) {
      checkbeneficaireCallback(amount, cardfrom, cardto, executeTransferCallback);
    } else {
      console.error("Solde insuffisant");
    }
  }, 1000);
}

// Step 3 — Check that the beneficiary card exists in the database
function checkbeneficaire(amount, cardfrom, cardto, executeTransferCallback) {
  setTimeout(() => {
    if (ExistBeneficaire(cardto.numcards)) {
      executeTransferCallback(amount, cardfrom, cardto);
    } else {
      console.error("Bénéficiaire introuvable");
    }
  }, 1000);
}

// Step 4 — Execute the transfer
const executeTransfer = (amount, cardfrom, cardto) => {
  setTimeout(() => {
    console.log(
      "Transfert de",
      amount,
      "depuis la carte",
      cardfrom.numcards,
      "vers la carte",
      cardto.numcards
    );

    // Update balances
    cardfrom.balance -= amount;
    cardto.balance += amount;

    // Create transaction object for the sender (debit)
    const transaction = {
      id: Date.now().toString(),
      type: "debit",
      amount: amount,
      date: new Date().toISOString().split("T")[0],
      from: cardfrom.numcards,
      to: cardto.numcards,
    };

    // Receiver's version of the same transaction (credit)
    const beneficiaryTransaction = { ...transaction, type: "credit" };

    // FIX: find beneficiary user from the database (not from user object)
    const beneficiaryInDatabase = database.users.find((u) =>
      u.wallet.cards.some((c) => c.numcards === cardto.numcards)
    );

    // Sync card balances in the database
    const userInDatabase = database.users.find((u) => u.email === user.email);

    userInDatabase.wallet.cards.find(
      (c) => c.numcards === cardfrom.numcards
    ).balance = cardfrom.balance;

    beneficiaryInDatabase.wallet.cards.find(
      (c) => c.numcards === cardto.numcards
    ).balance = cardto.balance;

    // FIX: push transactions only once per wallet (avoid double push)
    userInDatabase.wallet.transactions.push(transaction);
    beneficiaryInDatabase.wallet.transactions.push(beneficiaryTransaction);

    // Update sessionStorage so the UI reflects new balance
    sessionStorage.setItem("user", JSON.stringify(userInDatabase));

    console.log("Nouveau solde carte", cardfrom.numcards, ":", cardfrom.balance);
    console.log("Nouveau solde carte", cardto.numcards, ":", cardto.balance);
    console.log("Transfert réussi ✓");
  }, 1000);
};

// FIX: resolve card objects from card numbers before starting the chain
const transferMoney = (amount, cardfromNum, cardtoNum) => {
  // Find the actual card objects from their numbers
  const cardfrom = user.wallet.cards.find((c) => c.numcards === cardfromNum);
  const cardto = database.users
    .flatMap((u) => u.wallet.cards)
    .find((c) => c.numcards === cardtoNum);

  if (!cardfrom) {
    console.error("Carte source introuvable :", cardfromNum);
    return;
  }
  if (!cardto) {
    console.error("Carte bénéficiaire introuvable :", cardtoNum);
    return;
  }

  transfer(
    checkamount,
    amount,
    cardfrom,
    cardto,
    checksolde,
    checkbeneficaire,
    executeTransfer
  );
};

export { transferMoney };