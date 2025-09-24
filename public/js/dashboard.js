const categories = [];
const tasks = [];
let sessionUser = null;
let sessionUserId = null;

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
    try {
        const res = await fetch('/api/categories');

        const resCategories = await res.json();
        for (const category of resCategories) {
            categories.push(category.category)
        }

        renderCategoryList();
    } catch(err) {
        console.error(err)
    }
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
            user: sessionUserId,
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

const slugify = (str) => str.toLowerCase().replace(/\s+/g, '-');

const toggleTask = async function (taskId, isCompleted) {
    try {
        const res = await fetch(`/api/tasks/${taskId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                completed: isCompleted
            })
        });

        const taskIndex = tasks.findIndex(task => task._id === taskId);
        if(taskIndex !== -1) {
            tasks[taskIndex].completed = isCompleted;
        }

        console.log('task toggled');
    } catch(err) {
        console.error(err);
    }
}

const renderTask = function (task) {
    const taskDisplay = document.getElementById('task-display');
    const taskElement = document.createElement('div');
    taskElement.classList.add('task');
    taskElement.id = task.name;

    if(task.completed) taskElement.classList.add('completed');

    const slugName = slugify(task.name);

    taskElement.innerHTML = `
            <article class="task" id="${task._id}">
                <header class="task-header">
                    <h3 class="task-name">${task.name}</h3>
                    <span class="task-category badge">${task.category}</span>
                </header>
    
                <p class="task-description">${task.description}</p>
    
                <time class="task-due-date" datetime="${task.dueDate}">Due: ${task.dueDate}</time>
    
                <div class="task-status">
                    <input type="checkbox" id="checkbox-${slugName}" ${task.completed ? 'checked' : ''}>
                    <label for="checkbox-${slugName}">Completed</label>
                </div>
    
                <footer class="task-actions">
                    <button class="edit-task-button" id="edit-task-button-${slugName}">Edit</button>
                    <button class="delete-task-button" id="delete-task-button-${slugName}">Delete</button>
                </footer>
            </article>
        `;

    const checkbox = taskElement.querySelector(`#checkbox-${slugName}`);
    checkbox.addEventListener('change', () => {
        const isCompleted = checkbox.checked;
        toggleTask(task._id, isCompleted)
            .then(() => {
                if(isCompleted) taskElement.classList.add('completed');
                else taskElement.classList.remove('completed');
            });
    })

    const editButton = taskElement.querySelector(`#edit-task-button-${slugName}`);
    editButton.addEventListener('click', () => {
        console.log('edit button clicked');

    })

    const deleteButton = taskElement.querySelector(`#delete-task-button-${slugName}`);
    deleteButton.addEventListener('click', async () => {
        try {
            const res = await fetch(`/api/tasks/${task._id}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if(res.ok) {
                console.log('task deleted');

                const taskIndex = tasks.findIndex(t => t._id === task._id);
                if(taskIndex !== -1) {
                    tasks.splice(taskIndex, 1);
                }

                const taskElement = document.getElementById(task.name);
                taskElement.remove();
            } else {
                console.error(await res.json());
            }
        } catch(err) {
            console.error(err);
        }
    });

    taskDisplay.appendChild(taskElement);
}

const renderTaskList = function () {
    for (const task of tasks) {
        renderTask(task);
    }
}

const populateTasks = async function () {
    try {
        const res = await fetch('/api/tasks');
        const resTasks = await res.json();

        for (const task of resTasks) {
            tasks.push(task);
        }

        renderTaskList();
    } catch(err) {
        console.error(err);
    }
}

const addTask = async function () {
    const taskNameField = document.getElementById('task-name-input');
    const newTaskName = taskNameField.value.trim();

    const taskDescriptionField = document.getElementById('task-description-input');
    const newTaskDescription = taskDescriptionField.value.trim();

    const taskDueDateField = document.getElementById('task-due-date-input');
    const newTaskDueDate = taskDueDateField.value.trim();

    const taskCategoryField = document.getElementById('category-select');
    const newTaskCategory = taskCategoryField.value.trim();

    const newTask = {
        user: sessionUserId,
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
                console.log("task added");

                tasks.push(newTask);
                renderTask(newTask);

                taskNameField.value = '';
                taskDescriptionField.value = '';
                taskDueDateField.value = '';
                taskCategoryField.value = '';
            }
        });
}

const populateWelcomeUser = async function () {
    try {
        const res = await fetch('/api/user');
        const user = await res.json();

        sessionUser = user.username;
        sessionUserId = user.id;

        const welcomeUser = document.getElementById('welcome-user');
        welcomeUser.textContent = `Welcome, ${sessionUser}!`;
    } catch(err) {
        console.error(err);
    }
}

const logout = async function () {
    try {
        const res = await fetch('/logout', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if(res.ok) {
            categories.length = 0;
            tasks.length = 0;
            window.location.href = res.redirect || '/login';
        }
    } catch(err) {
        console.error(err);
        window.location.href = '/login';
    }
}

window.onload = function () {
    const addCategoryButton = document.getElementById('add-category-button');
    addCategoryButton.onclick = addCategory;

    const addTaskButton = document.getElementById('add-task-button');
    addTaskButton.onclick = addTask;

    const logoutButton = document.getElementById('logout-button');
    logoutButton.onclick = logout;

    populateWelcomeUser()
        .then(() => console.log('user populated'))
        .catch(err => console.error(err));

    populateCategorySelect()
        .then(() => console.log('categories populated'))
        .catch(err => console.error(err));

    populateTasks()
        .then(() => console.log('tasks populated'))
        .catch(err => console.error(err))
}