const taskname = document.querySelector('.TaskNameInput');
const importance = document.querySelector('.ImportanceInput');
const date = document.querySelector('.DateInput');
const time = document.querySelector('.TimeInput');
const place = document.querySelector('.PlaceInput');
const description = document.querySelector('.DescriptionInput');
const addbutton = document.querySelector('.AddButton')

const search = document.querySelector('.SearchInput');
const filterrow = document.querySelector('.FilterRow');
const container = document.querySelector('.CardContainer')

let todos = []

let currentsearch = ""

let currentfilter = "All"

function savetodos(){
  try{
    localStorage.setItem("todos", JSON.stringify(todos));
  }
  catch (e) {
    console.log("Failed to save todo", e);
  }
}

function loadtodos(){
  try{
    const data = localStorage.getItem("todos");
    return data ? JSON.parse(data) : [];
    }
  catch (e) {
    console.log("Failed to load data", e)
    return [];
  }
}

function generateid(){
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

function createcard(todo){
  const card = document.createElement("div");
  card.className = "TodoCard";
  card.dataset.id = todo.id;

  const importanceClass = `Importance${todo.importance}`;
  const badgeClass = todo.status === "completed" ? "CompletedBadge" : "PendingBadge";
  const badgeText = todo.status === "completed" ? "Completed" : "Pending";
  const completeBtnText = todo.status === "completed" ? "Undo" : "Complete";

  card.innerHTML = `
    <div class="TodoInfo">
      <div class="TodoTop">
        <h3 class="TodoName">${todo.name}</h3>
        <span class="${importanceClass}">${todo.importance}</span>
      </div>
      <p class="TodoDescription">${todo.description || ""}</p>
      <div class="TodoDetails">
        <div class="TodoMeta"><h4>Date</h4><p class="TodoValue">${todo.date || "—"}</p></div>
        <div class="TodoMeta"><h4>Time</h4><p class="TodoValue">${todo.time || "—"}</p></div>
        <div class="TodoMeta"><h4>Place</h4><p class="TodoValue">${todo.place || "—"}</p></div>
        <div class="TodoMeta"><h4>Status</h4><span class="${badgeClass}">${badgeText}</span></div>
      </div>
      <div class="Buttons TodoButtons">
        <button class="Button CompleteButton">${completeBtnText}</button>
        <button class="Button DeleteButton">Delete</button>
      </div>
    </div>
  `;
  return card;
}

function rendertodos(todolist){
  container.innerHTML = "";
  todolist.forEach(todo => {
    const card = createcard(todo);
    container.append(card);
  });
}

function cleaform(){
  taskname.value = "";
  importance.value = "";
  date.value = "";
  time.value = "";
  place.value = "";
  description.value = "";
}

function handeladdtodo(){
  const name = taskname.value.trim();
  const importantval = importance.value;
  const dateval = date.value;
  const timeval = time.value;
  const placeval = place.value.trim();
  const descval = description.value.trim();

  if(!name || !importantval || !dateval || !timeval){
    alert("Fill required fields: name, importance, date and time");
    return;
  }

  const newtodo = {
    id: generateid(),
    name,
    importance: importantval,
    date: dateval,
    time: timeval,
    place: placeval,
    description: descval,
    status: "pending"
  };

  todos.push(newtodo);
  savetodos();
  rendertodos(getfilteredtodos());
  cleaform();
}

function getfilteredtodos(){
  return todos.filter(todo => {
    const matchesFilter = currentfilter === "All" || todo.importance === currentfilter;
    const matchesSearch = todo.name.toLowerCase().includes(currentsearch) ||todo.description.toLowerCase().includes(currentsearch) || todo.place.toLowerCase().includes(currentsearch);
    return matchesFilter && matchesSearch;
  });
}

function setfilter(filter){
  currentfilter = filter;
  document.querySelectorAll(".FilterButton").forEach(btn => {
    btn.classList.toggle("Active", btn.textContent === filter);
  });
  rendertodos(getfilteredtodos());
}

function togglecomplete(id){
  const todo = todos.find(t => t.id === id);
  if(todo){
    todo.status = todo.status === "completed" ? "pending" : "completed";
    savetodos();
    rendertodos(getfilteredtodos());
  }
}

function deletetodo(id){
  if(!confirm("Delete this task?")) return;
  const index = todos.findIndex(t => t.id === id);
  if(index !== -1){
    todos.splice(index, 1);
    savetodos();
    rendertodos(getfilteredtodos());
  }
}

function blindevents(){
  addbutton.addEventListener("click", handeladdtodo);

  search.addEventListener("input", (e)=>{
    currentsearch = e.target.value.toLowerCase();
    rendertodos(getfilteredtodos());
  });

  filterrow.addEventListener("click", (e)=>{
    if(e.target.classList.contains("FilterButton")){
      setfilter(e.target.textContent);
    }
  });

  container.addEventListener("click", (e)=>{
    const card = e.target.closest(".TodoCard");
    if(!card) return;
    const id = card.dataset.id;

    if(e.target.classList.contains("CompleteButton")){
      togglecomplete(id);
    }
    else if(e.target.classList.contains("DeleteButton")){
      deletetodo(id);
    }
  });
}

function init(){
  todos = loadtodos();
  rendertodos(getfilteredtodos());
  blindevents();
}

init();
