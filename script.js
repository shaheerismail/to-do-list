const boardList = document.getElementById("board-list");
const addBar = document.getElementById("add-bar");
const addInput = document.getElementById("add-input");

const STORAGE_KEY = "todo-boards";
const OPEN_KEY = "todo-open-board";

let boards = [];
let openIndex = 0;

function defaultBoards() {
  return [
    { name: "Inspiration", cls: "pink", tasks: [] },
    { name: "Travel Plans", cls: "purple", tasks: [] },
    { name: "Work", cls: "yellow", tasks: [] },
    { name: "Groceries", cls: "green", tasks: [] }
  ];
}

function loadBoards() {
  boards = defaultBoards();
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    try {
      const data = JSON.parse(saved);
      if (Array.isArray(data)) {
        const cleaned = [];
        for (let i = 0; i < data.length; i++) {
          const board = data[i];
          if (board && typeof board.name === "string" && Array.isArray(board.tasks)) {
            const tasks = [];
            for (let j = 0; j < board.tasks.length; j++) {
              const task = board.tasks[j];
              if (task && typeof task.text === "string") {
                tasks.push({ text: task.text, done: task.done === true });
              }
            }
            cleaned.push({
              name: board.name,
              cls: typeof board.cls === "string" ? board.cls : "green",
              tasks: tasks
            });
          }
        }
        if (cleaned.length > 0) {
          boards = cleaned;
        }
      }
    } catch (error) {
      boards = defaultBoards();
    }
  }
  localStorage.removeItem("todo-tasks");
}

function saveBoards() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(boards));
  } catch (error) {}
}

function loadOpenIndex() {
  const saved = parseInt(localStorage.getItem(OPEN_KEY), 10);
  const valid = Number.isInteger(saved) && saved >= 0 && saved < boards.length;
  openIndex = valid ? saved : boards.length - 1;
}

function saveOpenIndex() {
  try {
    localStorage.setItem(OPEN_KEY, String(openIndex));
  } catch (error) {}
}

function openBoard(index) {
  openIndex = index;
  saveOpenIndex();
  renderBoards();
}

function toggleTask(boardIndex, taskIndex) {
  const task = boards[boardIndex].tasks[taskIndex];
  task.done = !task.done;
  saveBoards();
  renderBoards();
}

function deleteTask(boardIndex, taskIndex) {
  boards[boardIndex].tasks.splice(taskIndex, 1);
  saveBoards();
  renderBoards();
}

function buildTaskRow(boardIndex, taskIndex) {
  const task = boards[boardIndex].tasks[taskIndex];

  const row = document.createElement("div");
  row.className = "task-row" + (task.done ? " done" : "");

  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.className = "task-check";
  checkbox.checked = task.done;
  checkbox.addEventListener("change", function () {
    toggleTask(boardIndex, taskIndex);
  });

  const text = document.createElement("span");
  text.className = "task-text";
  text.textContent = task.text;

  const deleteButton = document.createElement("button");
  deleteButton.type = "button";
  deleteButton.className = "task-delete";
  deleteButton.textContent = "\u00D7";
  deleteButton.addEventListener("click", function () {
    deleteTask(boardIndex, taskIndex);
  });

  row.appendChild(checkbox);
  row.appendChild(text);
  row.appendChild(deleteButton);
  return row;
}

function buildCard(board, boardIndex) {
  const card = document.createElement("div");
  card.className = "card c-" + board.cls;

  const title = document.createElement("h2");
  title.textContent = board.name;
  card.appendChild(title);

  if (boardIndex === openIndex) {
    card.classList.add("open");

    const total = board.tasks.length;
    const done = board.tasks.filter(function (task) {
      return task.done;
    }).length;

    const counter = document.createElement("p");
    counter.className = "board-sub";
    counter.textContent = done + " of " + total + " Tasks";
    card.appendChild(counter);

    for (let i = 0; i < board.tasks.length; i++) {
      card.appendChild(buildTaskRow(boardIndex, i));
    }

    if (total === 0) {
      const empty = document.createElement("p");
      empty.className = "empty-text";
      empty.textContent = "No tasks yet. Type one above!";
      card.appendChild(empty);
    }
  } else {
    card.addEventListener("click", function () {
      openBoard(boardIndex);
    });
  }

  return card;
}

function renderBoards() {
  boardList.innerHTML = "";
  for (let i = 0; i < boards.length; i++) {
    boardList.appendChild(buildCard(boards[i], i));
  }
}

addBar.addEventListener("submit", function (event) {
  event.preventDefault();

  const text = addInput.value.trim();
  if (text === "") return;

  boards[openIndex].tasks.push({ text: text, done: false });
  saveBoards();
  addInput.value = "";
  renderBoards();
});

loadBoards();
loadOpenIndex();
renderBoards();
