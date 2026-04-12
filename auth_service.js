let auth0Client=null;

const config={
    domain:"dev-hwccoku5xvsxv2op.eu.auth0.com",
    clientId:"4ylzMiMqrtbYYZRhYZHZHs56ZZxfgQsO", 
    audience :"https://api.stokvel.app",
};

const configureClient = async()=>{
    auth0Client = await auth0.createAuth0Client({
        domain: config.domain,
        clientId: config.clientId,
        authorizationParams: {
            audience: config.audience,
            redirect_uri: window.location.origin,
            //Requesting profile and email fro auth0
            scope: "openid profile email"
        },

        //Stay logged in after refreshing.
        useRefreshTokens: true,  
        cacheLocation: 'localstorage'
    });
};

const processLoginState = async()=>{
    //auth0 redirec
    const query = window.location.search;
    if(query.includes("code=")&&query.includes("state=")){
        await auth0Client.handleRedirectCallback();
        window.history.replaceState({}, document.title, "/");
    }
    const isAuthenticated = await auth0Client.isAuthenticated();
    if(isAuthenticated){
        //get token and user profile and pass it to the header
        const token = await auth0Client.getTokenSilently();
        const userProfile = await auth0Client.getUser();

        const response = await fetch('http://localhost:3000/api/auth/me', {
            headers: {
                'Authorization': `Bearer ${token}`,
                'x-user-name': userProfile.name,
                'x-user-email': userProfile.email
            }
        });

        const dbUser = await response.json();
        
        //Store userId in the localStorage
        localStorage.setItem('userId', dbUser.userId);
        localStorage.setItem('userName', dbUser.name); 
        localStorage.setItem('Email', dbUser.email); 

        if (!window.location.pathname.includes("dashboard.html")) {
            window.location.href = "dashboard.html";
        }
    }
};

window.onload =async() =>{
    await configureClient();
    await processLoginState();

    document.getElementById("btnGoogle").onclick = async() =>{
        await auth0Client.loginWithRedirect({
            authorizationParams: { connection: 'google-oauth2' }
        });
    };

    document.getElementById("btnApple").onclick = async() =>{
        await auth0Client.loginWithRedirect({
            authorizationParams: { connection: 'apple' }
        });
    };
};

