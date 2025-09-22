const loginOrRegister = async function () {
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;

    if(!username || !password) {
        console.error('Username and password are required');
        return;
    }

    const userAttempt = {
        username: username,
        password: password,
    }

    try {
        const res = await fetch('/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(userAttempt)
        });

        if(res.ok) {
            const data = await res.json();
            if(data.redirect) window.location.href = data.redirect;
            else console.log(data.message);
        } else if(res.status === 400) {
            const errorData = await res.json();
            console.error(errorData.error);
        } else console.error('An error occurred');
    } catch(error) { console.error(error) }
}

window.onload = function () {
    const loginButton = document.getElementById('login');
    loginButton.onclick = loginOrRegister;
}