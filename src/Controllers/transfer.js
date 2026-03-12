import { ExistBeneficaire } from "../Models/database.js";

const user = JSON.parse(sessionStorage.getItem("user"));

const amount = 20000000;
const numcardfrom = "124849";
const numcardto = "124847"; // verfiier le beneficaire

function transfer(callback, amount, callback2, callback3, callback4) {
  callback(amount, callback2, callback3, callback4);
}

function checkamount(amount, callback, callback2, callback3) {
  if (amount > 0) {
    callback(amount, callback2, callback3);
  } else {
    console.error("amount must be positive");
  }
}

function checksolde(amount, callback, callback2) {
  const cardfrom = user.wallet.cards.find((c) => c.numcards === numcardfrom);
  if (cardfrom.balance >= amount) {
    callback(numcardto, callback2);
  } else {
    console.error("solde insuffisant");
  }
}

function checkbeneficaire(numcardto, callback) {
  if (ExistBeneficaire(numcardto) && numcardto !== numcardfrom) {
    callback(numcardto);
  } else {
    console.error("beneficaire not found");
  }
}

function executeTransfer(numcardto) { // besoin de modifier l'objet qui existe dans le database pour que les changements soient persistants + objet dans sessionStorage
  const cardfrom = user.wallet.cards.find((c) => c.numcards === numcardfrom);
  const cardto = ExistBeneficaire(numcardto).wallet.cards.find(
    (c) => c.numcards === numcardto
  );
  console.log("transferring", amount, "from", cardfrom.numcards, "to", cardto.numcards);
  cardfrom.balance -= amount;
  cardto.balance += amount;
  console.log("new balance of card", cardfrom.numcards, "is", cardfrom.balance);
  console.log("new balance of card", cardto.numcards, "is", cardto.balance);
  console.log("transfer successful");
}


transfer(checkamount, amount, checksolde, checkbeneficaire, executeTransfer);
