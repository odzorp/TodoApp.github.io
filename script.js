/******************************/
/***   GLOBAL VARIABLES     ***/
/******************************/

let todoArray = [];
let todoId = 0;
let currentFilter = 'all';
const LOCAL_TODOS = "local_todos";

const todoInput = document.getElementById("todo-input");
const todoList = document.getElementById("todo-list");
const itemsLeft = document.getElementById("items-left");
const todoFilters = document.querySelectorAll("input[name='filter']");
const btnClear = document.getElementById('clear-completed');

const themeSwitch = document.getElementById('theme-toggle');
const themeLogos = document.querySelectorAll('.btn-theme img');

/******************************/
/***  EVENT LISTENERS       ***/
/******************************/

btnClear.addEventListener('click', () => {
   const toRemove = todoArray.filter((obj) => obj.active === false);

   if (toRemove.length > 0 &&  confirm(`You are about to remove ${toRemove.length} completed task(s). Are you sure?`)) {
      toRemove.forEach((elem) => {
         removeElem(elem.DOMelem);
      });
   }
});

themeSwitch.addEventListener('click', themeSwitcher);

todoInput.addEventListener("keyup", (e) => {
   if (e.key === "Enter") {
      if (e.target.value !== "") {
         addTodoElem(e.target.value);
         todoInput.value = "";
         refreshFilters();
      } else {
         alert("You must write something before adding an item.");
      }
   }
});

todoFilters.forEach((filter) => {
   filter.addEventListener('change', filterCallback);
});

/************************************/
/***  Event Listeners and Callbacks ***/
/************************************/

function themeSwitcher(e) {
   themeLogos.forEach(logo => logo.classList.toggle("todo-elem-hide"));

   if (!document.body.dataset.theme) {
      document.body.dataset.theme = "darkTheme";
   } else {
      document.body.dataset.theme = "";
   }
}

function filterCallback(e) {
   currentFilter = e.target.value;
   refreshFilters();
}

function refreshFilters() {
   if (currentFilter === 'completed') {
      completedCB();
   } else if (currentFilter === 'all') {
      allCB();
   } else { // if active
      activeCB();
   }
}

function completedCB() {
   todoArray.forEach(function (arrayObj)  {
      if (!arrayObj.active && arrayObj.DOMelem.classList.contains("todo-elem-hide")) {
         arrayObj.DOMelem.classList.remove("todo-elem-hide");
      } else if (arrayObj.active && !arrayObj.DOMelem.classList.contains("todo-elem-hide")) {
         arrayObj.DOMelem.classList.add("todo-elem-hide");      
      }
   });
}

function allCB() {
   todoArray.forEach(function (arrayObj)  {
      if (arrayObj.DOMelem.classList.contains("todo-elem-hide")) {
         arrayObj.DOMelem.classList.remove("todo-elem-hide");
      }
   });
}

function activeCB() {
   todoArray.forEach(function (arrayObj)  {
      if (arrayObj.active && arrayObj.DOMelem.classList.contains("todo-elem-hide")) {
         arrayObj.DOMelem.classList.remove("todo-elem-hide");
      } else if (arrayObj.active === false && !arrayObj.DOMelem.classList.contains("todo-elem-hide")) {
         arrayObj.DOMelem.classList.add("todo-elem-hide");
      }
   });
}

/******************************/
/***  FUNCTIONS             ***/
/******************************/

/**  MISCELLANEOUS  FUNCTIONS**/
/******************************/

function updateActiveCount() {
   let count = todoArray.reduce((count, todoObj) => {
      if (todoObj.active) count++;
      return count;
   }, 0);
   itemsLeft.innerText = count;
}

function updateCurrentId() {
   if (!todoArray.length) {
      todoId = 0;
   } else {
      todoId = todoArray[todoArray.length - 1].id + 1;
   }
}

/**  localStorage FUNCTIONS **/
/******************************/

function getLocalStorage() {
   if (localStorage.getItem(LOCAL_TODOS) === null) {
      localStorage.setItem(LOCAL_TODOS, JSON.stringify([]));
   } else if (JSON.parse(localStorage.getItem(LOCAL_TODOS)).length) {
      todoArray = JSON.parse(localStorage.getItem(LOCAL_TODOS));
      todoArray.forEach((todoElem) => {
         if (todoId < +todoElem.id) todoId = +todoElem.id;
         addTodoElem(todoElem.content, false);
      });
      todoId++;
   }
   updateActiveCount();
}

function updateLocalStorage() {
   localStorage.setItem(LOCAL_TODOS, JSON.stringify(todoArray));
}

function removeFromStorage(id) {
   todoArray = todoArray.filter((todoObj) => {
      return todoObj.id !== +id;
   });

   updateLocalStorage();
}

/**  DOM EFFECT FUNCTIONS    **/
/******************************/

function changeActiveStatus(elem) {
   elem.classList.toggle("todo-elem-checked");
   let isActive = true;

   if (elem.classList.contains("todo-elem-checked")) {
      isActive = false;
   }

   todoArray.forEach((arrayObj) => {
      if (arrayObj.id === +elem.id) arrayObj.active = isActive;
   });

   updateLocalStorage();
   updateActiveCount();
}

function removeElem(element) {
   removeElemFromDom(element);
   removeFromStorage(+element.id);
   updateCurrentId();
   updateActiveCount();
   refreshFilters();
}

function removeElemFromDom(elem) {
   elem.remove();
}

function addTodoElem(todoText, isNew = true) {
   const todoEl = document.createElement("li");
   todoEl.classList.add("todo-elem");
   todoEl.id = "" + todoId;

   const todoCheck = document.createElement("button");
   todoCheck.classList.add("btn", "todo-check");
   const checkIcon = document.createElement("img");
   checkIcon.src = "images/icon-check.svg";
   checkIcon.alt = "Check";
   todoCheck.appendChild(checkIcon);
   todoEl.appendChild(todoCheck);

   const todoTextEl = document.createElement("p");
   todoTextEl.textContent = todoText;
   todoEl.appendChild(todoTextEl);

   const todoDelete = document.createElement("button");
   todoDelete.classList.add("btn", "todo-delete");
   const deleteIcon = document.createElement("img");
   deleteIcon.src = "images/icon-cross.svg";
   deleteIcon.alt = "Delete";
   todoDelete.appendChild(deleteIcon);
   todoEl.appendChild(todoDelete);

   if (isNew) {
      todoArray.unshift({
         active: true,
         content: todoText,
         DOMelem: todoEl,
         id: todoId++,
      });
      updateLocalStorage();
   } else {
      todoArray.forEach((arrayObj) => {
         if (arrayObj.id === todoId) {
            arrayObj.DOMelem = todoEl;
            if (!arrayObj.active) {
               todoEl.classList.add("todo-elem-checked");
            }
         }
      });
   }

   todoList.insertBefore(todoEl, todoList.firstChild);

   todoCheck.addEventListener("click", function() {
      changeActiveStatus(todoEl);
      refreshFilters();
   });

   todoDelete.addEventListener("click", function() {
      removeElem(todoEl);
   });

   updateActiveCount();
}

/***  START OF INSTRUCTIONS     ***/
/**********************************/

function init() {
   const starterList = [
      "Complete online JavaScript course",
      "Jog around the park 3x",
      "10 minutes meditation",
      "Read for 1 hour",
      "Pick up groceries",
   ];

   if (localStorage.getItem("isFirstVisit") === null || localStorage.getItem("isFirstVisit") === false) {
      localStorage.setItem("isFirstVisit", true);
      starterList.forEach((item, index) => {
         addTodoElem(item);
         if (index === 0) {
            const firstItem = todoList.firstChild;
            changeActiveStatus(firstItem);
         }
      });
   } else {
      getLocalStorage();
   }
}


init();
