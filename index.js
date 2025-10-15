import express from express
import axios from "axios";  

const app = express();
const PORT = process.env.PORT || 3000;
const CLIENT_ID = 'f8427aa9b86a4ce5925d9da380a8413d'; 

app.get('/', (req, res) => {
  res.send('Welcome to the Spotify API!');
});

// app.get('/login', async (req, res) => {
//     const params = {
//         grant_type: 'client_credentials',
//         client_id: CLIENT_ID,
//         client_secret: CLIENT_SECRET
//     };
//     const data = new URLSearchParams(params).toString();
//     const response = await axios.post('https://accounts.spotify.com/api/token', data, {
//         headers: {
//             'Content-Type': 'application/x-www-form-urlencoded'
//         }
//     });
//     const accessToken = response.data.access_token;
    
//     res.json({ accessToken });  
// }); 

const generateRandomString = (length) => {
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const values = crypto.getRandomValues(new Uint8Array(length));
  return values.reduce((acc, x) => acc + possible[x % possible.length], "");
}

const sha256 = async (plain) => {
  const encoder = new TextEncoder()
  const data = encoder.encode(plain)
  return window.crypto.subtle.digest('SHA-256', data)
}

const base64encode = (input) => {
  return btoa(String.fromCharCode(...new Uint8Array(input)))
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

const codeVerifier  = generateRandomString(64);
const hashed = await sha256(codeVerifier)
const codeChallenge = base64encode(hashed);

const redirecturi = 'http://localhost:3000/callback';
const scope = 'user-read-private user-read-email';
const authUrl = new URL('https://accounts.spotify.com/authorize');
window.localStorage.setItem('code_verifier', codeVerifier);

const params =  {
  response_type: 'code',
  client_id: clientId,
  scope,
  code_challenge_method: 'S256',
  code_challenge: codeChallenge,
  redirect_uri: redirectUri,
};
authUrl.search = new URLSearchParams(params).toString();
window.location.href = authUrl.toString();

const urlParams = new URLSearchParams(window.location.search);
const code = urlParams.get('code');

const getToken = async code => {
    const CodeVerifier = localStorage.getItem('code_verifier');
    if (!code) {
        throw new Error('No code provided');
    }
    const url = 'https://accounts.spotify.com/api/token';
    const payload = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
            clientId: clientId,
            grant_type: 'authorization_code',
            code,
            redirect_uri: redirectUri,
            code_verifier: CodeVerifier,
        }),
    };
    const body = await fetch(url, payload);
    const response = await body.json();
    localStorage.setItem('access_token', response.access_token);
}


app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});