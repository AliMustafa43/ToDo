// first we get elements from html that we actually needed

let name = document.querySelector('.TaskNameInput');
let importance = document.querySelector('.ImportanceInput');
let date = document.querySelector('.DateInput');
let time = document.querySelector('.TimeInput');
let place = document.querySelector('.PlaceInput');
let description = document.querySelector('.DescriptionInput');
const addButton = document.querySelector('.AddButton');

const search = document.querySelector('.SearchInput');
const filterRow = document.querySelector('.FilterRow');

const card = document.querySelector('.TodoCard');
const container = document.querySelector('.CardContainer')

const confirmation = document.querySelector('.ModalOverlay');
const modalCancel = document.querySelector('.ModalCancelButton');
const modalDelete = document.querySelector('.ModalDeleteButton');
let pendingDeleteId = null; // id of the todo waiting for delete confirmation
let editingId = null; // id of the todo being edited, null when adding a new one


//Lets make a storage

let storage = [];//We store information (can be objects) and this information make UI

function save(){
  try{
  localStorage.setItem("storage", JSON.stringify(storage))
  }
  catch (e){
    console.log("Failed to save")
  }
}

function load(){
  try{
    const data = localStorage.getItem("storage")
    return data ? JSON.parse(data) : []
  }
  catch (e){
    console.log("Failed to load")
    return []
  }
}


//Render after every change
function render(){
  container.innerHTML = ''
  storage = load();
  storage.forEach(todo => {
  createcard(todo);
});
}

render();



function input(){// make object to use input 
    const nameval = name.value;
    const importanceval = importance.value;
    const dateval = date.value;
    const timeval = time.value;
    const placeval = place.value;
    const descriptionval = description.value;
    const badge = "Pending"

    if(!nameval||!importanceval||!dateval){
      alert("Fill these sections name, importance, date")
      return null // tell the caller validation failed
    }

    return{
    id: crypto.randomUUID(),
    nameval,
    importanceval,
    dateval,
    timeval,
    placeval,
    descriptionval,
    badge
  }
}

//Add todo and Update todo
addButton.addEventListener("click", ()=>{//creating new todos
    const data = input();//
    if(!data){return;}
    if (editingId){
      data.id = editingId; //As it got random Id, it gives same id of todo that we want to edit
      const todo = storage.find(t => t.id === editingId);
      Object.assign(todo, data); //Shortest way to edit the existing todo
      save();
      render();
      editingId = null;                   // exit edit mode
      addButton.textContent = 'Add Todo'; // restore button label
      return;
    }

    storage.push(data);
    save();
    createcard(data);
})


function createcard(data){
  const card = document.createElement('div');
  card.className = "TodoCard";
  card.dataset.id = data.id;
  card.innerHTML = `<div class="TodoInfo">
            <div class="TodoTop">
              <h3 class="TodoName">${data.nameval}</h3>
              <span class="ImportanceHigh">${data.importanceval}</span>
            </div>

            <p class="TodoDescription">${data.descriptionval}</p>

            <div class="TodoDetails">
              <div class="TodoMeta">
                <h4>Date</h4>
                <p class="TodoValue">${data.dateval}</p>
              </div>
              <div class="TodoMeta">
                <h4>Time</h4>
                <p class="TodoValue">${data.timeval}</p>
              </div>
              <div class="TodoMeta">
                <h4>Place</h4>
                <p class="TodoValue">${data.placeval}</p>
              </div>
              <div class="TodoMeta">
                <h4>Status</h4>
                <span class="PendingBadge">${data.badge}</span>
              </div>
            </div>

            <div class="Buttons TodoButtons">
              <button class="Button CompleteButton" type="button">Complete</button>
              <button class="Button DeleteButton" type="button">Delete</button>
              <button class="Button EditButton" type="button">Edit</button>
            </div>
          </div>`
  container.appendChild(card);
  
}

//Confirmation to delete
confirmation.addEventListener("click",(e)=>{
  if(e.target.closest('.ModalDeleteButton')){
    if (pendingDeleteId) {
    storage = storage.filter(t => t.id !== pendingDeleteId);
    confirmation.hidden = true;
    pendingDeleteId = null;
    save();
    render();  // re-render all
    }
  } else if(e.target.closest('.ModalCancelButton')){
    confirmation.hidden = true;
    pendingDeleteId = null;
  }
  else
    confirmation.hidden = true;
    pendingDeleteId = null;
})



//To Complete or Delete or Edit
//This active listner work to indentify which todo is selected
//closest() tells us any element with that class name from parents
container.addEventListener("click", (e)=>{
  const card = e.target.closest('.TodoCard')
  if(!card){
    console.log("No card")
    return
  }
//ans: we should also have to edit storage not only Ui(the real purpose of id is to connect Ui with storage)  
  const id = card.dataset.id;
  const todo = storage.find(t => t.id === id);
  const badge = card.querySelector('.PendingBadge, .CompletedBadge');
  const btn = e.target.closest('.CompleteButton, .UndoButton, .DeleteButton, .EditButton');
  if (btn.classList.contains('CompleteButton')) {
    todo.badge = 'Completed';
    badge.textContent = 'Completed';
    badge.className = 'CompletedBadge';
    btn.textContent = 'Undo';
    btn.className = 'Button UndoButton';
    save();
  } else if (btn.classList.contains('UndoButton')) {
    todo.badge = 'Pending';
    badge.textContent = 'Pending';
    badge.className = 'PendingBadge';
    btn.textContent = 'Complete';
    btn.className = 'Button CompleteButton';
    save();
  } else if (btn.classList.contains('DeleteButton')) {
    // show the custom modal instead of native confirm()
    pendingDeleteId = id;
    confirmation.hidden = false;//Enable overlay
    modalDelete.focus(); // focus the Delete button so Enter works
}else if (btn.classList.contains('EditButton')){
    editingId = id;                // remember which todo we're now editing
    name.value = todo.nameval;     // fill the form with that todo's data
    importance.value = todo.importanceval;
    date.value = todo.dateval;
    time.value = todo.timeval;
    place.value = todo.placeval;
    description.value = todo.descriptionval;
    addButton.textContent = 'Update Todo'; // show the user they're editing
    name.focus();                  // jump to the form
  }
});