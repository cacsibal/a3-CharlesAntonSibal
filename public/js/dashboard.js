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
                <input type="checkbox" id="checkbox-${slugify(task.name)}" ${task.completed ? 'checked' : ''}>
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
    const newTaskDueDate = taskDueDateField.trim();

    const taskCategoryField = document.getElementById('task-category-input');
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
                tasks.push(newTask);
                renderTask(newTask);

                taskNameField.value.clear();
                taskDescriptionField.value.clear();
                taskDueDateField.value.clear();
                taskCategoryField.value.clear();
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