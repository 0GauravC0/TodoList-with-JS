let taskData = {};
const todo = document.getElementById("todo");
const progress = document.getElementById("pending");
const completed = document.getElementById("completed");
const allColumns = [todo, progress, completed];
let dragElement = null;

// Reusable function to calculate current UI state and sync with LocalStorage
function updateLocalStorage() {
    allColumns.forEach(column => {
        if (!column) return;
        const allTasks = column.querySelectorAll(".task");
        const totalCount = column.querySelector(".right");

        // Update the counter UI if the element exists
        if (totalCount) {
            totalCount.innerText = allTasks.length;
        }

        // Map current DOM elements to array objects
        taskData[column.id] = Array.from(allTasks).map(t => {
            return {
                title: t.querySelector("h2").innerText,
                desc: t.querySelector("p").innerText
            };
        });
    });
    localStorage.setItem('tasks', JSON.stringify(taskData));
}

// Reusable helper to attach drag events to ANY task element
function attachTaskDragEvents(taskDiv) {
    taskDiv.addEventListener("dragstart", (e) => {
        dragElement = taskDiv;
    });
}

// ==========================================================
// 1. GLOBAL DELETE LOGIC (Event Delegation)
// ==========================================================
const kanbanBoard = document.querySelector(".kanban-board");
if (kanbanBoard) {
    kanbanBoard.addEventListener("click", (e) => {
        // Find the closest ancestor matching our delete button class
        const deleteBtn = e.target.closest(".delete-btn");
        
        if (deleteBtn) {
            e.preventDefault(); // Stop anchor tag page reloads
            
            // Find the parent task item and remove it from DOM
            const taskCard = deleteBtn.closest(".task");
            if (taskCard) {
                taskCard.remove();
                updateLocalStorage(); // Re-sync LocalStorage arrays and column counter values
            }
        }
    });
}

// 2. INITIAL LOAD LOGIC
if (localStorage.getItem("tasks")) {
    const data = JSON.parse(localStorage.getItem('tasks'));
    
    for (const col in data) {
        const column = document.querySelector(`#${col}`);
        if (!column) continue; 

        data[col].forEach(task => {
            const div = document.createElement("div");
            div.classList.add("task");
            div.setAttribute("draggable", "true");
            div.innerHTML = `
                <h2>${task.title}</h2>
                <p>${task.desc}</p>
                <a href="#" class="delete-btn"><i class="fa-solid fa-trash-can"></i></a>
            `;
            column.appendChild(div);
            
            // Add drag capability to loaded tasks
            attachTaskDragEvents(div);
        });
    }
    // Update count displays immediately after DOM is populated
    updateLocalStorage(); 
}

// 3. KANBAN COLUMN DRAG/DROP LOGIC
function addDragEventOnCol(col) {
    col.addEventListener("dragenter", (e) => {
        e.preventDefault();
        col.classList.add("hover-over");
    });
    col.addEventListener("dragleave", (e) => {
        e.preventDefault();
        col.classList.remove("hover-over");
    });
    col.addEventListener("dragover", (e) => {
        e.preventDefault();
    });
    col.addEventListener("drop", (e) => {
        e.preventDefault();

        if (dragElement) {
            col.appendChild(dragElement);
            col.classList.remove("hover-over");
            
            // Re-sync state immediately when tasks shift columns
            updateLocalStorage();
        }
    });
}

// Assign column interactions
allColumns.forEach(column => {
    if (column) addDragEventOnCol(column);
});

// 4. MODAL LOGIC
const toggleModalButton = document.querySelector("#toggle-modal");
const modal = document.querySelector('.modal');
const modalBG = document.querySelector('.modal .bg');
const addTaskBtn = document.querySelector("#add-new-task");

if (toggleModalButton && modal) {
    toggleModalButton.addEventListener("click", () => {
        modal.classList.toggle('active');
    });
}
if (modalBG && modal) {
    modalBG.addEventListener("click", () => {
        modal.classList.remove("active");
    });
}

// 5. CREATING A NEW TASK LOGIC
if (addTaskBtn) {
    addTaskBtn.addEventListener("click", () => {
        const taskTitleInput = document.querySelector("#task-input");
        const taskDescInput = document.querySelector("#task-desc");
      
        const taskTitle = taskTitleInput.value.trim() || "Untitled Task";
        const taskDesc = taskDescInput.value.trim() || "";
    
        const div = document.createElement("div");
        div.classList.add("task");
        div.setAttribute("draggable", "true");
        div.innerHTML = `
            <h2>${taskTitle}</h2>
            <p>${taskDesc}</p>
            <a href="#" class="delete-btn"><i class="fa-solid fa-trash-can"></i></a>
        `;
        
        todo.appendChild(div);
    
        // Use correct event listener type ("dragstart")
        attachTaskDragEvents(div);
        
        // Save and update counters
        updateLocalStorage();
    
        // Reset input fields and close modal
        taskTitleInput.value = "";
        taskDescInput.value = "";
        modal.classList.remove("active");
    });
}