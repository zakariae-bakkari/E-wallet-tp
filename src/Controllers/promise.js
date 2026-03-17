console.log("start");
setTimeout(() => {
  console.log("settimeout");
}, 0);

Promise.resolve().then(() => {
  console.log("promise");
});

console.log("end");

