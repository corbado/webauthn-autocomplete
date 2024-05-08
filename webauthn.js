document.addEventListener('DOMContentLoaded', async () => {
    try {
        conditionalMediationLogin();

    } catch (err) {
        console.error("Auto login check failed", err);
        updateStatus('Failed to check for automatic login');
    }
});

let abortController = null;

async function register(username) {

    handleAbort();

    if (!username) {
        updateStatus('Username is required');
        return;
    }

    abortController = new AbortController();

    const publicKeyCredentialCreationOptions = {
        rp: {name: "Corbado"},
        user: {
            id: new TextEncoder().encode(username),
            name: username,
            displayName: username
        },
        challenge: generateChallenge("randomChallengeString"),
        pubKeyCredParams: [
            {type: "public-key", alg: -7},
            {type: "public-key", alg: -257},
        ],
        authenticatorSelection: {
            authenticatorAttachment: "platform",
            requireResidentKey: false,
            userVerification: "preferred"
        },
        timeout: 60000,
        attestation: "direct",
        signal: abortController.signal
    };

    try {
        const credential = await navigator.credentials.create({publicKey: publicKeyCredentialCreationOptions});
        console.log("Credential Created", credential);
        updateStatus(`Registration successful for ${username}`);
    } catch (err) {
        console.error("Registration error", err);
        updateStatus(`Registration failed: ${err.message}`);
    }
}


async function regularLogin(username) {

    handleAbort();
    abortController = new AbortController();

    if (!username) {
        updateStatus('Username is required');
        return;
    }

    // Adjusted publicKeyCredentialRequestOptions for conditional UI
    const publicKeyCredentialRequestOptions = {
        challenge: generateChallenge("randomChallengeString"),
        timeout: 60000,
        userVerification: "preferred",
    };

    try {
        const assertion = await navigator.credentials.get({
            publicKey: publicKeyCredentialRequestOptions,
            signal: abortController.signal
        });
        console.log("Assertion obtained", assertion);
        updateStatus(`Login successful for ${username}`);
    } catch (err) {
        console.error("Login error", err);
        updateStatus(`Login failed: ${err.message}`);
    }
}

async function conditionalMediationLogin() {

    handleAbort();
    abortController = new AbortController();

    // Adjusted publicKeyCredentialRequestOptions for conditional UI
    const publicKeyCredentialRequestOptions = {
        challenge: generateChallenge("randomChallengeString"),
        timeout: 60000,
        userVerification: "preferred",
    };

    try {
        const assertion = await navigator.credentials.get({
            publicKey: publicKeyCredentialRequestOptions,
            mediation: "conditional",
            signal: abortController.signal
        });
        console.log("Conditional login successful", assertion);
        updateStatus(`Conditional login successful`);
    } catch (err) {
        console.error("Conditional login error", err);
        updateStatus(`Conditional login failed: ${err.name} `);
        if (err.name === 'AbortError') {
            updateStatus('Conditional login aborted.');
        }
    }
}

function handleAbort() {
    if (abortController) {
        abortController.abort();
        abortController = null;
    }
}

function updateStatus(message) {
    document.getElementById('status').innerText = message;
}

function generateChallenge(string) {
    return Uint8Array.from(string, c => c.charCodeAt(0));
}