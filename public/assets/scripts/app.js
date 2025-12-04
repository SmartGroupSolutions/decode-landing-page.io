const toggle = document.getElementById('toggle-dark');
const savedTheme = localStorage.getItem("theme");

let nombreActual = "johndoe";
let correoActual = "john@doe.com";
let contrasenaActual = "gatito";
let nuevaFotoPfp = null;

if (savedTheme) {
    document.documentElement.setAttribute('data-theme', savedTheme);
    if (toggle) {
        toggle.checked = savedTheme === "dark";
    
        toggle.addEventListener("change", () => {
            const theme = toggle.checked ? "dark" : "light";
            document.documentElement.setAttribute('data-theme', theme);
            localStorage.setItem("theme", theme);
        });
    }
}

const storedSettings = JSON.parse(localStorage.getItem('userSettings'));

if (storedSettings) {

    const ids = {
        'toggle-do-not-disturb': storedSettings.doNotDisturbToggle,
        'toggle-suggested-problems': storedSettings.suggestedProblemsToggle,
        'toggle-daily-streak': storedSettings.rachaDiaria,
        'toggle-announces': storedSettings.anuncios,
        'toggle-awards': storedSettings.logros,
        'toggle-updates': storedSettings.actualizacionesCorreo,
        'toggle-dark': storedSettings.theme
    };

    Object.entries(ids).forEach(([id, value]) => {
        const el = document.getElementById(id);
        if (el) el.checked = value;
    });

}

const storedPfp = localStorage.getItem("savedPfp");
if (storedPfp) {
    if(document.getElementById('internal-pfp')) document.getElementById('internal-pfp').src = storedPfp;
    if(document.getElementById('external-pfp')) document.getElementById('external-pfp').src = storedPfp;
    if(document.getElementById('headeravatar'))document.getElementById('headeravatar').src = storedPfp;
}
const storedName = localStorage.getItem("savedName");
if (storedName && document.getElementById("username-display")) {
    nombreActual = storedName;
    document.getElementById("username-display").textContent = 
        `Nombre de usuario: ${storedName}`;
}
if (storedName && document.getElementById("name-tag")) {
    nombreActual = storedName;
    document.getElementById("name-tag").textContent = 
        `Nombre de usuario: ${storedName}`;
}
const storedEmail = localStorage.getItem("savedEmail");
if (storedEmail && document.getElementById("email-display")) {
    correoActual = storedEmail;
    document.getElementById("email-display").textContent = 
        `Correo electrónico: ${storedEmail}`;
}
if (storedEmail && document.getElementById("email-tag")) {
    correoActual = storedEmail;
    document.getElementById("email-tag").textContent = 
        `Correo electrónico: ${storedEmail}`;
}
const storedPassword = localStorage.getItem("savedPassword");
if (storedPassword && document.getElementById("password-display")) {
    contrasenaActual = storedPassword;
    var maskedPassword = "*".repeat(storedPassword.length);
    document.getElementById("password-display").textContent =
        `Contraseña: ${maskedPassword}`;
}
const savedPfp = localStorage.getItem("savedPfp");
if (savedPfp) {
    const headerAvatar = document.getElementById("headeravatar");
    const profileAvatar = document.getElementById("external-pfp");
    const internalAvatar = document.getElementById("internal-pfp");

    if (headerAvatar !== null) headerAvatar.src = savedPfp;
    if (profileAvatar !== null) profileAvatar.src = savedPfp;
    if (internalAvatar !== null) internalAvatar.src = savedPfp;
}


function saveSettings() {
    const settings = {
        doNotDisturbToggle: document.getElementById('toggle-do-not-disturb').checked,
        suggestedProblemsToggle: document.getElementById('toggle-suggested-problems').checked,
        rachaDiaria: document.getElementById('toggle-daily-streak').checked,
        anuncios: document.getElementById('toggle-announces').checked,
        logros: document.getElementById('toggle-awards').checked,
        actualizacionesCorreo: document.getElementById('toggle-updates').checked,
        theme: document.getElementById('toggle-dark').checked
    };
    localStorage.setItem('userSettings', JSON.stringify(settings));
}

function saveName() {
    const newName = document.getElementById('input-new-name').value.trim();
    if (newName !== "") {
        nombreActual = newName;

        document.getElementById("username-display").textContent = 
            `Nombre de usuario: ${nombreActual}`;
        localStorage.setItem("savedName", nombreActual);
    }
}

function saveEmail() {
    const newEmail = document.getElementById('input-new-email').value.trim();
    if (newEmail !== "") {
        correoActual = newEmail;

        document.getElementById("email-display").textContent = 
            `Correo electrónico: ${correoActual}`;
        localStorage.setItem("savedEmail", correoActual);
    }
}

function savePassword(){
    const newPassword = document.getElementById('input-new-password').value.trim();
    const oldPassword = document.getElementById('input-old-password').value.trim();
    const confirmPassword = document.getElementById('input-confirm-password').value.trim();
    if (newPassword !== "" && newPassword === confirmPassword && oldPassword === contrasenaActual){
        contrasenaActual = newPassword;

        var maskedPassword = "*".repeat(contrasenaActual.length);

        document.getElementById("password-display").textContent =
            `Contraseña: ${maskedPassword}`;
        localStorage.setItem("savedPassword", contrasenaActual)

    }
}

function comprimirImagen(dataUrl, maxWidth = 300, quality = 0.7) {
    return new Promise((resolve) => {
        const img = new Image();
        img.src = dataUrl;

        img.onload = () => {
            const canvas = document.createElement("canvas");
            const ctx = canvas.getContext("2d");
            let ratio = img.width / img.height;
            canvas.width = maxWidth;
            canvas.height = maxWidth / ratio;

            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            const compressedDataUrl = canvas.toDataURL("image/jpeg", quality);

            resolve(compressedDataUrl);
        };
    });
}

async function savePfp() {
    if (!nuevaFotoPfp) return;
    const compressed = await comprimirImagen(nuevaFotoPfp, 300, 0.7);
    localStorage.setItem("savedPfp", compressed);
}