let auth0Client=null;

const config={
    domain:"your-tenant.auth0.com",
    clientId:"http://localhost:5173", 
    audience :"https://api.stokvel.app",
};

const configureClient = async()=>{
    auth0Client = await auth0.createAuth0Client({
        domain: config.domain,
        clientId: config.clientId,
        authorizationParams: {
            audience: config.audience,
            redirect_uri: window.location.origin
        },
        //Stay logged in after refreshing.
        useRefreshTokens: true,  
        cacheLocation: 'localstorage'
    });
};

const processLoginState = async()=>{
    const query = window.location.search;
    if(query.includes("code=")&&query.includes("state=")){
        await auth0Client.handleRedirectCallback();
        window.history.replaceState({}, document.title, "/");
    }
    const isAuthenticated = await auth0Client.isAuthenticated();
    if(isAuthenticated){
        console.log("user is logged in");
        const taken = await auth0Client.getTokenSilently();
        console.log("Your Access Token:", taken);
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

