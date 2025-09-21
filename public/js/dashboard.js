const categories = []

const renderCategoryList = function () {
    const categorySelect = document.getElementById('select-category');
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
            console.log(categories)
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


window.onload = function () {
    populateCategorySelect()
        .then(() => console.log('categories populated'))
        .catch(err => console.error(err));

    const addCategoryButton = document.getElementById('add-category-button');
    addCategoryButton.onclick = addCategory;
}