document.addEventListener('DOMContentLoaded', () => {
    const menuBtn = document.getElementById('menu-toggle');
    const dropdown = document.getElementById('dropdown-menu');

    const doNotDisturbToggle = document.getElementById('toggle-do-not-disturb');
    const othersToggle = document.querySelectorAll('.other-setting');

    const saveConfirmPopUp = document.getElementById('save-confirm-popup');
    const leaveConfirmPopUp = document.getElementById('leave-confirm-popup');
    const savePfpConfirmPopUp = document.getElementById('save-pfp-confirm-popup');
    const saveUsernameConfirmPopUp = document.getElementById('save-username-confirm-popup');
    const saveMailConfirmPopUp = document.getElementById('save-mail-confirm-popup');
    const savePasswordConfirmPopUp = document.getElementById('save-password-confirm-popup');

    const othersBack = document.querySelectorAll('.popup-backdrop');

    const saveYes = document.getElementById('confirm-save-yes');
    const saveNo = document.getElementById('confirm-save-no');

    const leaveYes = document.getElementById('confirm-leave-yes');
    const leaveNo = document.getElementById('confirm-leave-no');

    const fileInput = document.getElementById('file-input');

    const pfp2img = document.getElementById('internal-pfp');
    const pfpimg = document.getElementById('external-pfp');
    const headerav = document.getElementById('headeravatar');

    const cameraInput = document.getElementById("camera-container");
    const cameraPreview = document.getElementById("cameraPreview");
    const takePhotoBtn = document.getElementById("takePhotoBtn");
    const closeCameraBtn = document.getElementById("closeCameraBtn");

    const usernameDisplay = document.getElementById("username-display");
    const newUsernameInput = document.getElementById("input-new-name");
    const emailDisplay = document.getElementById("email-display");
    const newEmailInput = document.getElementById("input-new-email");
    const passwordDisplay = document.getElementById("password-display");
    const newPasswordInput = document.getElementById("input-new-password");

    const boxPassword = document.getElementById("box-password");

    let stream = null;


    document.getElementById('edit-pfp').addEventListener('click', () => {
        savePfpConfirmPopUp.style.display = 'flex';
    });

    document.getElementById('edit-name').addEventListener('click', () => {
        saveUsernameConfirmPopUp.style.display = 'flex';
    });

    document.getElementById('edit-email').addEventListener('click', () => {
        saveMailConfirmPopUp.style.display = 'flex';
    });

    document.getElementById('edit-password').addEventListener('click', () => {
        savePasswordConfirmPopUp.style.display = 'flex';
    });

    document.getElementById('btn-save').addEventListener('click', () => {
        saveConfirmPopUp.style.display = 'flex';
    });

    document.getElementById('btn-exit').addEventListener('click', () => {
        leaveConfirmPopUp.style.display = 'flex';
    });

    saveNo.addEventListener('click', () => {
        saveConfirmPopUp.style.display = 'none';
        leaveConfirmPopUp.style.display = 'flex';
    });

    saveYes.addEventListener('click', () => {
        saveSettings();
        saveName();
        saveEmail();
        savePassword();
        savePfp();
        saveConfirmPopUp.style.display = 'none';
    });

    leaveYes.addEventListener('click', () => {
        leaveConfirmPopUp.style.display = 'none';
        window.location.href = 'profile.html';
    });

    leaveNo.addEventListener('click', () => {
        leaveConfirmPopUp.style.display = 'none';
        saveConfirmPopUp.style.display = 'flex';
    });

    doNotDisturbToggle.addEventListener('change', () => {
        if(doNotDisturbToggle.checked){
            othersToggle.forEach(o => o.checked = false);
        }
    });

    othersToggle.forEach(o => {
        o.addEventListener('change', () => {
            if(o.checked){
                doNotDisturbToggle.checked = false;
            }
        });
    });

    menuBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        dropdown.classList.toggle('show');
    });

    othersBack.forEach(back => {
        back.addEventListener('click', (e) => {
            if(e.target === back){
                back.style.display = 'none';
            }
        })
    });

    document.addEventListener('click', (e) => {
        if(!dropdown.contains(e.target) && !menuBtn.contains(e.target)){
            dropdown.classList.remove('show');
        }
    });

    /*
    cameraInput.addEventListener('change', async () => {
        cameraInput.style.display = "block";

        stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: "user" } // cambialo a "environment" para cámara trasera
        });

        cameraPreview.srcObject = stream;
    });
    */

    takePhotoBtn.addEventListener("click", () => {
        const canvas = document.getElementById("cameraCanvas");
        const context = canvas.getContext("2d");

        canvas.width = cameraPreview.videoWidth;
        canvas.height = cameraPreview.videoHeight;

        context.drawImage(cameraPreview, 0, 0, canvas.width, canvas.height);

        const dataUrl = canvas.toDataURL("image/png");

        pfpimg.src = dataUrl;
        pfp2img.src = dataUrl;
        headerav.src = dataUrl;

        nuevaFotoPfp = dataUrl;

        stopCamera();
    });

    closeCameraBtn.addEventListener("click", () => {
        stopCamera();
    });

    function stopCamera() {
        cameraInput.style.display = "none";
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
        }
    }


    fileInput.addEventListener('change', function() {
        const file = this.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e){
                pfp2img.src = e.target.result;
                pfpimg.src = e.target.result;
                headerav.src = e.target.result;

                nuevaFotoPfp = e.target.result;
            };
            reader.readAsDataURL(file);
        }
    });

    document.getElementById('upload').addEventListener('click', () => {
        fileInput.click();
    });

    document.getElementById('take-photo').addEventListener('click', async () => {
        cameraInput.style.display = "flex";

        stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: "user" }
        });

        cameraPreview.srcObject = stream;
    });

    newUsernameInput.addEventListener("input", () => {
        const preview = newUsernameInput.value.trim();
        usernameDisplay.textContent = 
            preview !== "" 
            ? `Nombre de usuario: ${preview}`
            : `Nombre de usuario: ${nombreActual}`;
    });


    newEmailInput.addEventListener("input", () => {
        const preview = newEmailInput.value.trim();
        emailDisplay.textContent = 
            preview !== "" 
            ? `Correo electrónico: ${preview}`
            : `Correo electrónico: ${correoActual}`;
    });

    newPasswordInput.addEventListener("input", () => {
        const preview = newPasswordInput.value.trim();
        
        const maskedPreview = "*".repeat(preview.length);
        const maskedActual = "*".repeat(contrasenaActual.length);

        passwordDisplay.textContent =
            preview !== ""
            ? `Contraseña: ${maskedPreview}`
            : `Contraseña: ${maskedActual}`;
    });

    boxPassword.addEventListener("mouseover", () => {
        passwordDisplay.textContent = `Contraseña: ${contrasenaActual}`;
    });

    boxPassword.addEventListener("mouseout", () => {
        const maskedActual = "*".repeat(contrasenaActual.length);
        passwordDisplay.textContent = `Contraseña: ${maskedActual}`;
    });

})