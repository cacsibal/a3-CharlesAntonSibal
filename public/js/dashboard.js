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

const editTask = function(task, taskElement, slugName) {
    const taskName = taskElement.querySelector('.task-name');
    const taskCategory = taskElement.querySelector('.task-category');
    const taskDescription = taskElement.querySelector('.task-description');
    const taskDueDate = taskElement.querySelector('.task-due-date');
    const taskActions = taskElement.querySelector('.task-actions');

    const originalName = task.name;
    const originalDescription = task.description;
    const originalDueDate = task.dueDate;
    const originalCategory = task.category;

    const editButton = taskElement.querySelector(`#edit-task-button-${slugName}`);
    editButton.style.display = 'none';

    const nameInput = document.createElement('input');
    nameInput.type = 'text';
    nameInput.value = originalName;
    nameInput.className = 'edit-task-name';
    taskName.replaceWith(nameInput);

    const descriptionTextarea = document.createElement('textarea');
    descriptionTextarea.value = originalDescription;
    descriptionTextarea.className = 'edit-task-description';
    descriptionTextarea.rows = 3;
    taskDescription.replaceWith(descriptionTextarea);

    const dueDateInput = document.createElement('input');
    dueDateInput.type = 'date';
    dueDateInput.value = originalDueDate;
    dueDateInput.className = 'edit-task-due-date';
    taskDueDate.replaceWith(dueDateInput);

    const categorySelect = document.createElement('select');
    categorySelect.className = 'edit-task-category badge';

    for (const category of categories) {
        const option = document.createElement('option');
        option.value = category;
        option.text = category;
        if (category === originalCategory) {
            option.selected = true;
        }
        categorySelect.appendChild(option);
    }
    taskCategory.replaceWith(categorySelect);

    const cancelButton = document.createElement('button');
    cancelButton.textContent = 'Cancel';
    cancelButton.className = 'cancel-edit-button';

    const doneButton = document.createElement('button');
    doneButton.textContent = 'Done';
    doneButton.className = 'done-edit-button';

    const deleteButton = taskElement.querySelector(`#delete-task-button-${slugName}`);
    taskActions.insertBefore(cancelButton, deleteButton);
    taskActions.insertBefore(doneButton, deleteButton);

    cancelButton.addEventListener('click', () => {
        const newTaskName = document.createElement('h3');
        newTaskName.className = 'task-name';
        newTaskName.textContent = originalName;
        nameInput.replaceWith(newTaskName);

        const newTaskDescription = document.createElement('p');
        newTaskDescription.className = 'task-description';
        newTaskDescription.textContent = originalDescription;
        descriptionTextarea.replaceWith(newTaskDescription);

        const newTaskDueDate = document.createElement('time');
        newTaskDueDate.className = 'task-due-date';
        newTaskDueDate.datetime = originalDueDate;
        newTaskDueDate.textContent = `Due: ${originalDueDate}`;
        dueDateInput.replaceWith(newTaskDueDate);

        const newTaskCategory = document.createElement('span');
        newTaskCategory.className = 'task-category badge';
        newTaskCategory.textContent = originalCategory;
        categorySelect.replaceWith(newTaskCategory);

        cancelButton.remove();
        doneButton.remove();
        editButton.style.display = 'inline-block';
    });

    doneButton.addEventListener('click', async () => {
        const newName = nameInput.value.trim();
        const newDescription = descriptionTextarea.value.trim();
        const newDueDate = dueDateInput.value;
        const newCategory = categorySelect.value;

        if (!newName) {
            alert('Task name is required');
            return;
        }

        try {
            const res = await fetch(`/api/tasks/${task._id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    name: newName,
                    description: newDescription,
                    dueDate: newDueDate,
                    category: newCategory
                })
            });

            if (res.ok) {
                const result = await res.json();
                console.log('Task updated successfully');

                task.name = newName;
                task.description = newDescription;
                task.dueDate = newDueDate;
                task.category = newCategory;

                const taskIndex = tasks.findIndex(t => t._id === task._id);
                if (taskIndex !== -1) {
                    tasks[taskIndex] = { ...tasks[taskIndex], ...task };
                }

                const newTaskName = document.createElement('h3');
                newTaskName.className = 'task-name';
                newTaskName.textContent = newName;
                nameInput.replaceWith(newTaskName);

                const newTaskDescription = document.createElement('p');
                newTaskDescription.className = 'task-description';
                newTaskDescription.textContent = newDescription;
                descriptionTextarea.replaceWith(newTaskDescription);

                const newTaskDueDate = document.createElement('time');
                newTaskDueDate.className = 'task-due-date';
                newTaskDueDate.datetime = newDueDate;
                newTaskDueDate.textContent = `Due: ${newDueDate}`;
                dueDateInput.replaceWith(newTaskDueDate);

                const newTaskCategory = document.createElement('span');
                newTaskCategory.className = 'task-category badge';
                newTaskCategory.textContent = newCategory;
                categorySelect.replaceWith(newTaskCategory);

                cancelButton.remove();
                doneButton.remove();
                editButton.style.display = 'inline-block';

            } else {
                const error = await res.json();
                console.error('Error updating task:', error);
                alert('Error updating task: ' + (error.error || 'Unknown error'));
            }
        } catch (err) {
            console.error('Error updating task:', err);
            alert('Error updating task. Please try again.');
        }
    });
};

const renderTask = function (task) {
    const taskDisplay = document.getElementById('task-display');
    const taskElement = document.createElement('div');
    taskElement.classList.add('task');
    taskElement.id = task.name;

    if(tasks.length !== 0) {
        document.getElementById('task-display').innerHTML = '';
    }

    if(task.completed) taskElement.classList.add('completed');

    const slugName = slugify(task.name);

    taskElement.innerHTML = `
            <article class="task-item" id="${task._id}">
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
        editTask(task, taskElement, slugName);
    });

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

                if(tasks.length === 0) {
                    document.getElementById('task-display').innerHTML = '<p class="empty-message">Your tasks will appear here</p>';
                }

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
    if(tasks.length === 0) {
        const taskDisplay = document.getElementById('task-display');
        taskDisplay.innerHTML = '<p class="empty-message">Your tasks will appear here</p>';
        return;
    }

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