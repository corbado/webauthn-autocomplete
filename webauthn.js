let abortController = null;
async function register(username) {

    if (abortController) {
        abortController.abort();
        abortController = null; // Reset the controller after aborting
    }

    if (!username) {
        updateStatus('Username is required');
        return;
    }
    console.log("Username is "+ username)


    // Simulate getting challenge and other data from server
    const publicKeyCredentialCreationOptions = {
        rp: { name: "Corbado" },
        user: {
            id: new TextEncoder().encode(username),
            name: username,
            displayName: username
        },
        challenge: Uint8Array.from("randomChallengeString", c=>c.charCodeAt(0)),
        pubKeyCredParams: [
            { type: "public-key", alg: -7 }, // ES256 algorithm
            { type: "public-key", alg: -257 },
        ],
        authenticatorSelection: {
            authenticatorAttachment: "platform",
            requireResidentKey: false,
            userVerification: "preferred"
        },
        timeout: 60000,
        attestation: "direct"
    };

    try {
        const credential = await navigator.credentials.create({publicKey: publicKeyCredentialCreationOptions});
        console.log("Credential Created", credential);
        updateStatus(`Registration successful for ${username}`);
        // Here, send the `credential` object to the server for verification and storage
    } catch (err) {
        console.error("Registration error", err);
        updateStatus(`Registration failed: ${err.message}`);
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    // Attempt automated login check after page loads
    try {
        conditionalMediationLogin();

    } catch (err) {
        console.error("Auto login check failed", err);
        updateStatus('Failed to check for automatic login');
    }
});

async function regularLogin(username) {
    if (abortController) {
        abortController.abort();
        abortController = null; // Reset the controller after aborting
    }

    // Create a new AbortController for this operation
    abortController = new AbortController();

    if (!username) {
        updateStatus('Username is required');
        return;
    }

    // Adjusted publicKeyCredentialRequestOptions for conditional UI
    const publicKeyCredentialRequestOptions = {
        challenge: Uint8Array.from("randomChallengeString", c => c.charCodeAt(0)),
        timeout: 60000,
        userVerification: "preferred",
    };

    try {
        const assertion = await navigator.credentials.get({ publicKey: publicKeyCredentialRequestOptions });
        console.log("Assertion obtained", assertion);
        updateStatus(`Login successful for ${username}`);
        // Here, send the `assertion` object to the server for verification
    } catch (err) {
        console.error("Login error", err);
        updateStatus(`Login failed: ${err.message}`);
    }
}

async function conditionalMediationLogin() {

    abortController = new AbortController();
    const signal = abortController.signal;


    // Adjusted publicKeyCredentialRequestOptions for conditional UI
    const publicKeyCredentialRequestOptions = {
        challenge: Uint8Array.from("randomChallengeString", c => c.charCodeAt(0)),
        timeout: 60000,
        userVerification: "preferred",
    };

    try {
        const assertion = await navigator.credentials.get({ publicKey: publicKeyCredentialRequestOptions, mediation: "conditional", signal: signal});
        console.log("Assertion obtained", assertion);
        updateStatus(`Login successful`);
        // Here, send the `assertion` object to the server for verification
    } catch (err) {
        console.error("Login error", err);
        updateStatus(`Login failed: ${err.message}`);
    }
}

function updateStatus(message) {
    document.getElementById('status').innerText = message;
}

document.getElementById('register').addEventListener('click', register);
document.getElementById('login').addEventListener('click', regularLogin);