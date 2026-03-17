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