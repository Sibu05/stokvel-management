let auth0Client = null;

const configureClient = async () => {
    auth0Client = await auth0.createAuth0Client({
        domain: ENV.AUTH0_DOMAIN,
        clientId: ENV.AUTH0_CLIENT_ID,
        authorizationParams: {
            audience: ENV.AUTH0_AUDIENCE,
            redirect_uri: window.location.origin
        },
        useRefreshTokens: true,
        cacheLocation: 'localstorage'
    });
};

const processLoginState = async () => {
    const query = window.location.search;

    // Handle redirect back from Auth0 after login
    if (query.includes("code=") && query.includes("state=")) {
        await auth0Client.handleRedirectCallback();
        window.history.replaceState({}, document.title, "/");
    }

    const isAuthenticated = await auth0Client.isAuthenticated();

    if (isAuthenticated) {
        console.log("User is logged in");

        // Get the Auth0 token
        const token = await auth0Client.getTokenSilently();
        console.log("Access Token:", token);

        // Send token to backend — creates or fetches user in DB
        try {
            const res = await fetch(`${ENV.API_URL}/me`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            if (!res.ok) throw new Error(`Backend error: ${res.status}`);

            const data = await res.json();
            console.log('Logged in as:', data.user);

            // Update UI to show logged in state
            showLoggedIn(data.user);

        } catch (err) {
            console.error('Failed to reach backend:', err.message);
        }
    } else {
        showLoggedOut();
    }
};

// Show UI when user is logged in
const showLoggedIn = (user) => {
    document.getElementById('signUp').textContent = `Welcome, ${user.name}`;
    document.querySelector('.buttons').innerHTML = `
        <button id="btnLogout">Logout</button>
    `;
    document.getElementById('btnLogout').onclick = logout;
};

// Show UI when user is logged out
const showLoggedOut = () => {
    document.getElementById('signUp').textContent = 'Signup with';
};

const logout = () => {
    auth0Client.logout({
        logoutParams: {
            returnTo: window.location.origin
        }
    });
};

window.onload = async () => {
    await configureClient();
    await processLoginState();

    // Google login button
    document.getElementById("btnGoogle").onclick = async () => {
        await auth0Client.loginWithRedirect({
            authorizationParams: { connection: 'google-oauth2' }
        });
    };

    // Apple login button
    document.getElementById("btnApple").onclick = async () => {
        await auth0Client.loginWithRedirect({
            authorizationParams: { connection: 'apple' }
        });
    };
};