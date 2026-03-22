console.log("start");
setTimeout(() => {
  console.log("settimeout");
}, 0);

Promise.resolve().then(() => {
  console.log("promise");
});

const data = fetch("https://jsonplaceholder.typicode.com/todos/4")
  .then((response) => response.json())
  .then((json) => console.log(json));

console.log("end");

const amount = 1000;

function processPayment(amount) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (amount == 1000) {
        resolve("Payment processed successfully");
      } else {
        reject("Payment failed");
      }
    }, 2000);
  });
}

function sendNotification(message) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(`Notification sent: ${message}`);
    }, 1000);
  });
}

processPayment(amount)
  .then((paymentMessage) => {
    console.log(paymentMessage);
    return sendNotification(paymentMessage);
  })
  .then((notificationMessage) => {
    console.log(notificationMessage);
  })
  .catch((error) => {
    console.error(error);
  });


  navigator.geolocation.getCurrentPosition(
    position => console.log(position),
    error => console.error(error)
  )

  navigator.language.then(language => console.log(language))