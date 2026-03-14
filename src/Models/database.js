const defaultDatabase = {
  users: [
    {
      id: "1",
      name: "ali",
      email: "ali@gmail.com",
      password: "2004",
      wallet: {
        currency: "MAD",
        cards: [
          {
            numcards: "124847",
            type: "visa",
            balance: 0,
            expiry: "14-08-2027",
            vcc: "147",
          },
          {
            numcards: "124478",
            type: "mastercard",
            balance: 1470,
            expiry: "14-08-2028",
            vcc: "257",
          },
        ],
        transactions: [
          {
            id: "1",
            type: "credit",
            amount: 140,
            date: "14-08-2025",
            from: "Ahmed",
            to: "124847",
          },
          {
            id: "2",
            type: "debit",
            amount: 200,
            date: "13-08-2025",
            from: "124847",
            to: "Amazon",
          },
          {
            id: "3",
            type: "credit",
            amount: 250,
            date: "12-08-2025",
            from: "Ahmed",
            to: "124478",
          },
        ],
      },
    },
    {
      id: "2",
      name: "zakariae",
      email: "zakariae@gmail.com",
      password: "1234",
      wallet: {
        currency: "MAD",
        cards: [
          {
            numcards: "124849",
            type: "visa",
            balance: 2000,
            expiry: "14-08-2027",
            vcc: "147",
          },
          {
            numcards: "124950",
            type: "mastercard",
            balance: 1470,
            expiry: "14-08-2028",
            vcc: "257",
          },
        ],
        transactions: [
          {
            id: "1",
            type: "credit",
            amount: 1400,
            date: "14-08-2025",
            from: "ali",
            to: "124849",
          },
          {
            id: "2",
            type: "debit",
            amount: 200,
            date: "13-08-2025",
            from: "124849",
            to: "Youssef Market Place",
          },
        ],
      },
    },
  ],
};

function loadDatabase() {
  const saved = localStorage.getItem("database");
  return saved ? JSON.parse(saved) : structuredClone(defaultDatabase);
}

function saveDatabase(db) {
  localStorage.setItem("database", JSON.stringify(db));
}

const database = loadDatabase();

const findUserByMail = (mail, password) => {
  return database.users.find(
    (u) => u.email === mail && u.password === password
  );
};

const ExistBeneficaire = (numbercard) => {
  return database.users.find((u) =>
    u.wallet.cards.find((c) => c.numcards === numbercard)
  );
};

export { findUserByMail, ExistBeneficaire, database, saveDatabase, loadDatabase };