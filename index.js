// TASK: import helper functions from utils
import { getTasks, createNewTask, deleteTask, putTask, patchTask } from './utils/taskFunctions.js';
// TASK: import initialData
import { initialData } from './initialData.js';

/*************************************************************************************************************************************************
 * FIX BUGS!!!
 * **********************************************************************************************************************************************/


// Function checks if local storage already has data, if not it loads initialData to localStorage
function initializeData() {
  if (!localStorage.getItem('tasks')) {
    localStorage.setItem('tasks', JSON.stringify(initialData));
    localStorage.setItem('showSideBar', 'true');
  } else {
    console.log('Data already exists in localStorage');
  }
}

// TASK: Get elements from the DOM
const elements = {
  headerBoardName: document.getElementById('header-board-name'),
  hideSideBarBtn: document.getElementById('hide-side-bar-btn'),
  showSideBarBtn: document.getElementById('show-side-bar-btn'),
  themeSwitch: document.getElementById('switch'),
  createNewTaskBtn: document.getElementById('add-new-task-btn'),
  modalWindow: document.getElementById('new-task-modal-window'),
  filterDiv: document.getElementById('filterDiv'),
  columnDivs: document.querySelectorAll('.column-div'),
  boardsNavLinksDiv: document.getElementById('boards-nav-links-div'),
  logoMobile: document.querySelector('.logo-mobile'),
  todoTaskContainer: document.querySelector('[data-status="todo"].task-container'),
  doingTaskContainer: document.querySelector('[data-status="doing"].task-container'),
  doneTaskContainer: document.querySelector('[data-status="done"].task-container'),
  newTaskTitleInput: document.getElementById('title-input'),
  newTaskDescInput: document.getElementById('desc-input'),
  newTaskStatusSelect: document.getElementById("select-status"),
  cancelAddTaskBtn: document.getElementById('cancel-add-task-btn'),
  editTaskModal: document.querySelector('.edit-task-modal-window'),
  editTaskForm: document.getElementById('edit-task-form'),
  editTaskTitleInput: document.getElementById('edit-task-title-input'),
  editTaskDescInput: document.getElementById('edit-task-desc-input'),
  editTaskStatusSelect: document.getElementById('edit-select-status'),
  saveTaskChangesBtn: document.getElementById('save-task-changes-btn'),
  cancelEditTaskBtn: document.getElementById('cancel-edit-btn'),
  deleteTaskBtn: document.getElementById('delete-task-btn'),
  addTaskForm: document.getElementById('new-task-modal-window'),
};

let activeBoard = "";

// Extracts unique board names from tasks
// TASK: FIX BUGS
function fetchAndDisplayBoardsAndTasks() {
  const tasks = getTasks();
  const boards = [...new Set(tasks.map(task => task.board).filter(Boolean))];
  displayBoards(boards);
  if (boards.length > 0) {
    const localStorageBoard = JSON.parse(localStorage.getItem("activeBoard"));
    activeBoard = localStorageBoard ? localStorageBoard : boards[0];
    elements.headerBoardName.textContent = activeBoard;
    styleActiveBoard(activeBoard);
    refreshTasksUI();
  }
}


// Creates different boards in the DOM
// TASK: Fix Bugs
function displayBoards(boards) {
  const boardsContainer = document.getElementById("boards-nav-links-div");
  boardsContainer.innerHTML = ''; // Clears the container
  boards.forEach(board => {
    const boardElement = document.createElement("button");
    boardElement.textContent = board;
    boardElement.classList.add("board-btn");
    boardElement.addEventListener('click', () => {
      elements.headerBoardName.textContent = board;
      filterAndDisplayTasksByBoard(board);
      activeBoard = board; //assigns active board
      localStorage.setItem("activeBoard", JSON.stringify(activeBoard));
      styleActiveBoard(activeBoard);
    });
    boardsContainer.appendChild(boardElement);
  });

}

// Filters tasks corresponding to the board name and displays them on the DOM.
// TASK: Fix Bugs
function filterAndDisplayTasksByBoard(boardName) {
  const tasks = getTasks(); // Fetch tasks from localStorage
  const filteredTasks = tasks.filter(task => task.board === boardName);



  elements.columnDivs.forEach(column => {
    const status = column.getAttribute("data-status");

    column.innerHTML = `<div class="column-head-div">
                          <span class="dot" id="${status}-dot"></span>
                          <h4 class="columnHeader">${status.toUpperCase()}</h4>
                        </div>`;
    let tasksContainer = column.querySelector(".tasks-container");
    if (!tasksContainer) {
      tasksContainer = document.createElement("div");
      tasksContainer.classList.add("tasks-container");
      column.appendChild(tasksContainer);
    }

    filteredTasks.filter(task => task.status === status).forEach(task => {
      const taskElement = document.createElement("div");
      taskElement.classList.add("task-div");
      taskElement.textContent = task.title;
      taskElement.setAttribute('data-task-id', task.id);


      taskElement.addEventListener('click', () => {
        openEditTaskModal(task);
      });

      tasksContainer.appendChild(taskElement);
    });
  });
}


function refreshTasksUI() {
  filterAndDisplayTasksByBoard(activeBoard);
}

// Styles the active board by adding an active class
// TASK: Fix Bugs
function styleActiveBoard(boardName) {
  document.querySelectorAll('.board-btn').forEach(btn => {
    if (btn.textContent === boardName) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });
}


function addTaskToUI(task) {
  const column = document.querySelector(`.column-div[data-status="${task.status}"]`);
  if (!column) {
    console.error(`Column not found for status: ${task.status}`);
    return;
  }

  let tasksContainer = column.querySelector('.tasks-container');
  if (!tasksContainer) {
    console.warn(`Tasks container not found for status: ${task.status}, creating one.`);
    tasksContainer = document.createElement('div');
    tasksContainer.className = 'tasks-container';
    column.appendChild(tasksContainer);
  }


  const taskElement = document.createElement('div');
  taskElement.className = 'task-div';
  taskElement.textContent = task.title; // Modify as needed
  taskElement.setAttribute('data-task-id', task.id);
  tasksContainer.appendChild(taskElement);
}



function setupEventListeners() {

  const cancelEditBtn = document.getElementById('cancel-edit-btn');
  cancelEditBtn.addEventListener('click', () => {
    toggleModal(false, elements.editTaskModal);
  });



  const cancelAddTaskBtn = document.getElementById('cancel-add-task-btn');
  cancelAddTaskBtn.addEventListener('click', () => {
    toggleModal(false);
    elements.filterDiv.style.display = 'none';
  });


  elements.filterDiv.addEventListener('click', () => {
    toggleModal(false);
    elements.filterDiv.style.display = 'none';
  });


  elements.hideSideBarBtn.addEventListener('click', () => {
    toggleSidebar(false);
  });

  elements.showSideBarBtn.addEventListener('click', () => {
    toggleSidebar(true);
  });


  elements.themeSwitch.addEventListener('change', toggleTheme);



  elements.createNewTaskBtn.addEventListener('click', () => {
    toggleModal(true);
    elements.filterDiv.style.display = 'block';
  });

  elements.modalWindow.addEventListener('submit', (event) => {
    addTask(event);
  });
}



function toggleModal(show, modal = elements.modalWindow) {
  modal.style.display = show ? 'block' : 'none';
  elements.filterDiv.style.display = show ? 'block' : 'none';
}





function addTask(event) {
  event.preventDefault();


  const task = {
    id: Date.now(),
    title: document.getElementById("title-input").value,
    description: document.getElementById("desc-input").value,
    board: activeBoard,
    status: document.getElementById("select-status").value
  };

  const newTask = createNewTask(task);
  if (newTask) {
    addTaskToUI(newTask);
    toggleModal(false);
    elements.filterDiv.style.display = 'none';
    event.target.reset();
    refreshTasksUI();
  }
}


function toggleSidebar(show) {
  const sidebar = document.getElementById('sidebar');
  const showSideBarBtn = document.getElementById ('show-side-bar-btn');
  localStorage.setItem("showSideBar", show ? "true" : "false");
  sidebar.style.display = show  ? 'block' : 'none';
  showSideBarBtn.style.display  = show ? 'none' : 'block';
}

function toggleTheme() {
  document.body.classList.toggle("light-theme");
  const isLightTheme = document.body.classList.contains("light-theme")
  localStorage.setItem("light-theme",  isLightTheme ? "true" : "false");
}



function openEditTaskModal(task) {
  elements.editTaskTitleInput.value = task.title;
  elements.editTaskDescInput.value = task.description;
  elements.editTaskStatusSelect.value = task.status;

  elements.saveTaskChangesBtn.addEventListener('click', () => {
    saveTaskChanges(task.id);
  });

  elements.deleteTaskBtn.addEventListener('click', () => {
    deleteTask(task.id);
    toggleModal(false, elements.editTaskModal);
    refreshTasksUI();
  });

  toggleModal(true, elements.editTaskModal);
}

function saveTaskChanges(taskId) {
  const updatedTask = {
    id: taskId,
    title: elements.editTaskTitleInput.value,
    description: elements.editTaskDescInput.value,
    status: elements.editTaskStatusSelect.value,
    board: activeBoard
  };

  putTask(updatedTask);
  toggleModal(false, elements.editTaskModal);
  refreshTasksUI();
}

function initialize() {
  initializeData();
  setupEventListeners();
  fetchAndDisplayBoardsAndTasks();
}

initialize();
