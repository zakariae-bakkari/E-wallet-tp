import { database, ExistBeneficaire } from "../Models/database.js";

const user = JSON.parse(sessionStorage.getItem("user"));

function transfer(
  callback,
  amount,
  cardfrom,
  cardto,
  callback2,
  callback3,
  callback4
) {
  setTimeout(() => {
    callback(amount, cardfrom, cardto, callback2, callback3, callback4);
  }, 1000); // Simulate asynchronous operation with a delay of 1 second
}

function checkamount(amount, cardfrom, cardto, callback, callback2, callback3) {
  setTimeout(() => {
    if (amount > 0) {
      callback(amount, cardfrom, cardto, callback2, callback3);
    } else {
      console.error("amount must be positive");
    }
  }, 1000);
}

function checksolde(amount, cardfrom, cardto, callback, callback2) {
  setTimeout(() => {
    if (cardfrom.balance >= amount) {
      callback(cardto, callback2);
    } else {
      console.error("solde insuffisant");
    }
  }, 1000);
}

function checkbeneficaire(cardto, callback) {
  setTimeout(() => {
    if (ExistBeneficaire(cardto.numcards)) {
      callback(cardto);
    } else {
      console.error("beneficaire not found");
    }
  }, 1000);
}

const executeTransfer = (cardfrom, cardto, amount) => {
  setTimeout(() => {
    console.log(
      "Transferring",
      amount,
      "from card",
      cardfrom.numcards,
      "to card",
      cardto.numcards
    );

    // Update balances
    cardfrom.balance -= amount;
    cardto.balance += amount;

    // Create a new transaction object
    const transaction = {
      id: Date.now().toString(), // Unique ID for the transaction
      type: "debit",
      amount: amount,
      date: new Date().toISOString().split("T")[0], // Current date in YYYY-MM-DD format
      from: cardfrom.numcards,
      to: cardto.numcards,
    };

    // Add the transaction to the sender's wallet
    user.wallet.transactions.push(transaction);

    // Add the transaction to the receiver's wallet
    const beneficiary = ExistBeneficaire(cardto.numcards);
    const beneficiaryTransaction = { ...transaction, type: "credit" };
    beneficiary.wallet.transactions.push(beneficiaryTransaction);

    // Update the database
    const userInDatabase = database.users.find((u) => u.email === user.email);
    const beneficiaryInDatabase = database.users.find((u) =>
      u.wallet.cards.some((c) => c.numcards === cardto.numcards)
    );

    userInDatabase.wallet.cards.find(
      (c) => c.numcards === cardfrom.numcards
    ).balance = cardfrom.balance;
    beneficiaryInDatabase.wallet.cards.find(
      (c) => c.numcards === cardto.numcards
    ).balance = cardto.balance;

    // Add transactions to the database
    userInDatabase.wallet.transactions.push(transaction);
    beneficiaryInDatabase.wallet.transactions.push(beneficiaryTransaction);

    // Update sessionStorage
    sessionStorage.setItem("user", JSON.stringify(user));

    console.log(
      "New balance of card",
      cardfrom.numcards,
      "is",
      cardfrom.balance
    );
    console.log("New balance of card", cardto.numcards, "is", cardto.balance);
    console.log("Transfer successful");
  }, 1000);
};

const transferMoney = (amount, cardfrom, cardto) => {
  transfer(
    checkamount,
    amount,
    cardfrom,
    cardto,
    checksolde,
    checkbeneficaire,
    (cardto) => {
      executeTransfer(cardfrom, cardto, amount);
    }
  );
};

export { transferMoney };
