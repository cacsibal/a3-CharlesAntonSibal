const categories = []
const tasks = []

const renderCategoryList = function () {
    const categorySelect = document.getElementById('category-select');
    categorySelect.innerHTML = '';

    for (const category of categories) {
        const option = document.createElement('option');
        option.value = category;
        option.text = category;
        categorySelect.appendChild(option);
    }
}

const populateCategorySelect = async function () {
    await fetch('/api/categories')
        .then(res => res.json())
        .then(resCategories => {
            for (const category of resCategories) {
                categories.push(category.category)
            }
        })
        .catch(err => console.error(err));

    renderCategoryList();
}

const addCategory = async function () {
    const newCategoryValue = document.getElementById('add-category-input').value.trim();

    if(!newCategoryValue) {
        console.error('Category input is empty');
        return;
    }

    await fetch('/api/categories', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            input: newCategoryValue
        })
    }).then(res => {
        if(res.ok) {
            if (!categories.includes(newCategoryValue)) {
                categories.push(newCategoryValue);
            }

            renderCategoryList();
            document.getElementById('add-category-input').value = '';
            console.log('category added and select updated');
        }
    }).catch(err => {
        console.error(err);
    });
}

const renderTask = function (task) {
    const taskDisplay = document.getElementById('task-display');
    const taskElement = document.createElement('div');
    taskElement.classList.add('task');
    taskElement.id = task.name;
    taskElement.innerHTML = `
            <div class="task-name">${task.name}</div>
            <div class="task-description">${task.description}</div>
            <div class="task-due-date">${task.dueDate}</div>
            <div class="task-category">${task.category}</div>
            <div class="task-completed">
                <input type="checkbox" id="checkbox-${task.name}" ${task.completed ? 'checked' : ''}>
                <label for="checkbox-${task.name}">Completed</label>
            </div>
        `;

    taskDisplay.appendChild(taskElement);
}

const renderTaskList = function () {
    for (const task of tasks) {
        renderTask(task);
    }
}

const populateTasks = async function () {
    await fetch('/api/tasks', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    })
        .then(res => res.json())
        .then(resTasks => {
            for (const task of resTasks) {
                tasks.push(task);
            }
        })
        .catch(err => console.error(err));

    renderTaskList();
}

const addTask = async function () {
    const newTaskName = document.getElementById('task-name-input').value.trim();
    const newTaskDescription = document.getElementById('task-description-input').value.trim();
    const newTaskDueDate = document.getElementById('due-date-input').value.trim();
    const newTaskCategory = document.getElementById('category-select').value.trim();

    const newTask = {
        name: newTaskName,
        description: newTaskDescription,
        dueDate: newTaskDueDate,
        category: newTaskCategory,
        completed: false
    };

    await fetch('/api/tasks', {

        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(newTask)
    })
        .then(res => {
            if(res.ok) {
                tasks.push(newTask);
                renderTask(newTask);
            }
        });
}

window.onload = function () {
    populateCategorySelect()
        .then(() => console.log('categories populated'))
        .catch(err => console.error(err));

    populateTasks()
        .then(() => console.log('tasks populated'))
        .catch(err => console.error(err))

    const addCategoryButton = document.getElementById('add-category-button');
    addCategoryButton.onclick = addCategory;

    const addTaskButton = document.getElementById('add-task-button');
    addTaskButton.onclick = addTask;
}