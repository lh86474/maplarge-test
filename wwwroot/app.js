const input = document.createElement("input");
input.placeholder ="enter a query";

const displayData = document.createElement("div");
displayData.textContent ="Hello from app.js";

const status = document.createElement("div");
status.textContent = "Ready";

document.body.append(input, displayData, status);