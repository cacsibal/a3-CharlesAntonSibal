const categories = []

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

    const categorySelect = document.getElementById('select-category');
    for (const category of categories) {
        const option = document.createElement('option');
        option.value = category;
        option.text = category;
        categorySelect.appendChild(option);
    }
}

window.onload = function () {
    populateCategorySelect();
}