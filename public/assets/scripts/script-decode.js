document.addEventListener('DOMContentLoaded', () => {
    const codeEditor = document.getElementById('main-code-editor');
    const compileButton = document.querySelector('.btn--compile');
    const exerciseCards = document.querySelectorAll('.exercise__card');
    const chatInput = document.querySelector('.chat-column__input input');
    const sendButton = document.querySelector('.btn--send');
    const chatContent = document.querySelector('.chat-column__content');
    
    const copyButton = document.getElementById('btn-copy');
    const resetButton = document.getElementById('btn-reset');
    const btnLoad = document.getElementById('btn-load');
    const btnSave = document.getElementById('btn-save'); // Referencia al botón Guardar
    const saveButtonConfirm = document.getElementById('btn-save-confirm');
    const saveFilenameInput = document.getElementById('save-filename');
    const savedFilesList = document.getElementById('saved-files-list');
    
    const terminalOutput = document.querySelector('.terminal__output');
    const statusFooter = document.querySelector('.editor__footer-item--status');

    // Referencias a los contenedores de menú 
    const loadMenu = document.getElementById('load-menu'); 
    const saveMenu = document.getElementById('save-menu'); 

    const KEYWORD_RESPONSE = '¡Excelente pregunta! Para declarar una variable entera en C++ y asignarle un valor, usas la palabra clave <code class="code-inline">int</code>.<br><br>Por ejemplo: <code class="code-inline">int edad = 30;</code> ¡Inténtalo ahora en el editor!';
    const DEFAULT_RESPONSE = 'No he entendido tu consulta, escríbela de nuevo';
    const KEYWORDS = ['ayuda', 'verificar', 'variable', 'variables'];

    const exercisesData = {
        'ex1': {
            regex: /#include\s*<iostream>.*using\s+namespace\s+std;.*int\s+main\s*\(\)\s*\{[^}]*cout\s*<<\s*["']¡Hola, mundo!["']\s*<<\s*endl;[^}]*return\s+0;\s*\}/si,
            initialCode: `#include <iostream>
using namespace std;

int main() {
    // Escribe tu código aquí. ¡Recuerda el mensaje!
    return 0;
}`
        },
        'ex2': {
            regex: /#include\s*<string>.*int\s+edad\s*[^;]*;.*string\s+nombre\s*[^;]*;.*cout\s*<<\s*[^;]*(nombre|edad)\s*[^;]*(nombre|edad)\s*[^;]*;/si,
            initialCode: `#include <iostream>
#include <string> // Necesario para usar string
using namespace std;

int main() {
    // Declara y asigna 'edad' (int) y 'nombre' (string)
    // Luego, imprime un mensaje que las combine
    return 0;
}`
        }
    };

    let currentExerciseId = null;
    const activeTabClass = 'info-column__tab--active';
    const hiddenClass = 'info-column__content--hidden';
    const activeExerciseClass = 'exercise__card--active';
    const completedStatusClass = 'exercise__status-indicator--completed';
    const tabButtons = document.querySelectorAll('.info-column__tab');
    const sectionTheory = document.getElementById('section-theory');
    const sectionExercises = document.getElementById('section-exercises');

    const mainLayout = document.getElementById('main-layout');
    const bottomNavButtons = document.querySelectorAll('.bottom-nav .nav-item');

    bottomNavButtons.forEach(button => {
        button.addEventListener('click', () => {
            const view = button.getAttribute('data-view');
            
            // 1. Alternar la clase activa de la navegación inferior
            bottomNavButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');

            // 2. Alternar la clase de vista activa en el main-layout
            //    Esto es lo que controla la visibilidad de las columnas a través del CSS
            mainLayout.className = 'main-layout'; // Reinicia las clases de vista
            mainLayout.classList.add(`active-${view}-view`);

            // Opcional: Si el botón de menú estaba abierto, cerrarlo
            const dropdownMenu = document.getElementById('dropdown-menu');
            if (dropdownMenu.classList.contains('show')) {
                dropdownMenu.classList.remove('show');
            }
        });
    });

    // =========================================================
    // LÓGICA DE RETROALIMENTACIÓN VISUAL Y UTILIDADES
    // =========================================================

    const showTerminalMessage = (message, statusText, isError = false) => {
        const color = isError ? '#ff5555' : 'var(--color-accent)';
        
        if (terminalOutput) {
            terminalOutput.innerHTML = `<span style="color: ${color};">${message}</span>`;
            terminalOutput.scrollTop = terminalOutput.scrollHeight;
        }
        if (statusFooter) {
            statusFooter.textContent = statusText;
            statusFooter.style.color = color;
        }
    };
    
    /** Toggle visibility of a menu and close the other. */
    const toggleMenu = (target) => { 
        if (!loadMenu || !saveMenu) return; 

        if (target === 'load') {
            // Usamos 'block' para las listas de archivos
            const isVisible = loadMenu.style.display === 'block'; 
            loadMenu.style.display = isVisible ? 'none' : 'block';
            saveMenu.style.display = 'none';
            if (loadMenu.style.display === 'block') renderSavedFiles(); // Renderiza al abrir
        } else if (target === 'save') {
            // Usamos 'flex' para el input y botón de guardar
            const isVisible = saveMenu.style.display === 'flex'; 
            saveMenu.style.display = isVisible ? 'none' : 'flex';
            loadMenu.style.display = 'none';
        }
    };

    // =========================================================
    // LÓGICA DE ALMACENAMIENTO (LOCALSTORAGE)
    // =========================================================

    const getSavedFiles = () => {
        try {
            return JSON.parse(localStorage.getItem('saved_code_files')) || {};
        } catch (e) {
            console.error("Error al parsear saved_code_files de LocalStorage", e);
            return {};
        }
    };

    const renderSavedFiles = () => {
        const files = getSavedFiles();
        const filenames = Object.keys(files);
        savedFilesList.innerHTML = ''; 

        if (filenames.length === 0) {
            savedFilesList.innerHTML = '<li class="no-files">No hay archivos guardados.</li>';
            return;
        }

        filenames.forEach(filename => {
            const li = document.createElement('li');
            li.textContent = filename;
            
            const deleteBtn = document.createElement('button');
            deleteBtn.classList.add('delete-file-btn');
            deleteBtn.textContent = 'x';
            deleteBtn.title = `Eliminar ${filename}`;
            
            deleteBtn.addEventListener('click', (e) => {
                e.stopPropagation(); 
                deleteFile(filename);
            });

            li.appendChild(deleteBtn);
            
            li.addEventListener('click', () => {
                loadFile(filename);
            });

            savedFilesList.appendChild(li);
        });
    };

    const saveFile = (filename, content) => {
        try {
            let files = getSavedFiles();
            
            if (!filename.toLowerCase().endsWith('.txt')) {
                filename += '.txt';
            }
            
            files[filename] = content;
            localStorage.setItem('saved_code_files', JSON.stringify(files));
            
            showTerminalMessage(`Archivo "${filename}" guardado exitosamente.`, "Guardado ✔️", false);
            saveFilenameInput.value = ''; 
            toggleMenu('save'); 
        } catch (e) {
            console.error("Error al guardar en LocalStorage:", e);
            showTerminalMessage("Error al guardar el archivo. LocalStorage lleno o no disponible.", "Error ❌", true);
        }
    };

    const loadFile = (filename) => {
        try {
            const files = getSavedFiles();
            const content = files[filename];
            
            if (content !== undefined) {
                codeEditor.value = content;
                showTerminalMessage(`Archivo "${filename}" cargado en el editor.`, "Cargado ✔️", false);
                
                currentExerciseId = null;
                exerciseCards.forEach(c => c.classList.remove(activeExerciseClass));
                
                toggleMenu('load'); 
                
            } else {
                showTerminalMessage(`Error: Archivo "${filename}" no encontrado.`, "Error de Carga ❌", true);
            }
        } catch (e) {
            console.error("Error al cargar desde LocalStorage:", e);
            showTerminalMessage("Error al cargar el archivo desde el almacenamiento local.", "Error de Carga ❌", true);
        }
    };

    const deleteFile = (filename) => {
        try {
            let files = getSavedFiles();
            if (!files[filename]) {
                 showTerminalMessage(`Error: Archivo "${filename}" no existe para ser eliminado.`, "Error al eliminar ❌", true);
                 return;
            }
            delete files[filename];
            localStorage.setItem('saved_code_files', JSON.stringify(files));
            showTerminalMessage(`Archivo "${filename}" eliminado.`, "Eliminado ✔️", false);
            renderSavedFiles(); 
        } catch (e) {
            console.error("Error al eliminar desde LocalStorage:", e);
            showTerminalMessage("Error al eliminar el archivo desde el almacenamiento local.", "Error al eliminar ❌", true);
        }
    };

    // =========================================================
    // MANEJADORES DE EVENTOS
    // =========================================================

    // Evento para ABRIR/CERRAR el menú Cargar (¡AÑADIDO!)
    if (btnLoad) {
        btnLoad.addEventListener('click', () => toggleMenu('load'));
    }

    // Evento para ABRIR/CERRAR el menú Guardar (¡AÑADIDO!)
    if (btnSave) {
        btnSave.addEventListener('click', () => toggleMenu('save'));
    }

    // Lógica de Tabs
    tabButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            const targetTab = e.target.getAttribute('data-tab');
            
            tabButtons.forEach(btn => btn.classList.remove(activeTabClass));
            e.target.classList.add(activeTabClass);

            sectionTheory.classList.add(hiddenClass);
            sectionExercises.classList.add(hiddenClass);

            if (targetTab === 'theory') {
                sectionTheory.classList.remove(hiddenClass);
            } else if (targetTab === 'exercises') {
                sectionExercises.classList.remove(hiddenClass);
            }
        });
    });

    // Lógica para el botón del menú principal
    const menuToggle = document.getElementById('menu-toggle');
    const dropdownMenu = document.getElementById('dropdown-menu');
    if (menuToggle && dropdownMenu) {
        menuToggle.addEventListener('click', () => {
            dropdownMenu.classList.toggle('show');
        });
        
        // Cerrar menú si se hace clic fuera
        document.addEventListener('click', (e) => {
            if (!dropdownMenu.contains(e.target) && !menuToggle.contains(e.target) && dropdownMenu.classList.contains('show')) {
                dropdownMenu.classList.remove('show');
            }
        });
    }

    // Cargar ejercicio al hacer clic en la tarjeta
    exerciseCards.forEach(card => {
        card.addEventListener('click', (e) => {
            exerciseCards.forEach(c => c.classList.remove(activeExerciseClass));
            card.classList.add(activeExerciseClass);
            currentExerciseId = card.getAttribute('data-exercise-id');
            
            if (exercisesData[currentExerciseId] && codeEditor) {
                codeEditor.value = exercisesData[currentExerciseId].initialCode.trim();
                showTerminalMessage(`Ejercicio ${currentExerciseId} cargado. ¡A codificar!`, "Listo para compilar", false);
            }
        });
    });

    // Evento de Compilar
    if (compileButton) {
        compileButton.addEventListener('click', () => {
            if (!currentExerciseId) {
                showTerminalMessage("Por favor, selecciona un ejercicio antes de Compilar.", "Compilación pendiente ⚠️", true);
                return;
            }

            const currentCode = codeEditor.value;
            const targetRegex = exercisesData[currentExerciseId].regex;
            const statusIndicator = document.getElementById(`status-${currentExerciseId}`);
            
            terminalOutput.innerHTML = `<span style="color: #999999;">Compilando código...</span>`;
            statusFooter.textContent = `Compilando...`;
            statusFooter.style.color = '#999999'; 

            const cleanedCode = currentCode.replace(/\s+/g, ' ').trim();
            const isCompleted = targetRegex.test(cleanedCode);

            setTimeout(() => { 
                if (isCompleted) {
                    if (statusIndicator) {
                        statusIndicator.classList.add(completedStatusClass);
                    }
                    showTerminalMessage("Compilación exitosa. ¡Ejercicio completado! 🎉", "¡COMPLETADO! ✔️", false);

                } else {
                    showTerminalMessage(
                        `Error de Verificación: El código no cumple con los requisitos del ejercicio. Revisa los pasos.`, 
                        "Error de Verificación ❌", 
                        true
                    );
                }
            }, 500);
        });
    }
    
    // Evento de Copiar
    if (copyButton) {
        copyButton.addEventListener('click', () => {
            if (codeEditor) {
                navigator.clipboard.writeText(codeEditor.value).then(() => {
                    showTerminalMessage("Código copiado al portapapeles.", "Copiado ✔️", false);
                }).catch(err => {
                    showTerminalMessage("Error al copiar el código.", "Error de Copia ❌", true);
                    console.error('Error al copiar el código:', err);
                });
            }
        });
    }

    // Evento de Resetear
    if (resetButton) {
        resetButton.addEventListener('click', () => {
            if (currentExerciseId && exercisesData[currentExerciseId] && codeEditor) {
                codeEditor.value = exercisesData[currentExerciseId].initialCode.trim();
                showTerminalMessage(`Editor reiniciado al código inicial del ejercicio ${currentExerciseId}.`, "Reset ✔️", false);
            } else if (codeEditor) {
                codeEditor.value = '';
                showTerminalMessage("Editor reiniciado a vacío.", "Reset ✔️", false);
            }
        });
    }
    
    // Evento de Guardar (Confirmar)
    if (saveButtonConfirm && saveFilenameInput && codeEditor) {
        saveButtonConfirm.addEventListener('click', () => {
            const filename = saveFilenameInput.value.trim();
            const content = codeEditor.value;
            
            if (filename.length < 3) {
                showTerminalMessage("Por favor, ingresa un nombre de archivo válido (mínimo 3 caracteres).", "Error de Guardado ❌", true);
                return;
            }
            if (content.trim() === "") {
                showTerminalMessage("El editor está vacío. No hay nada para guardar.", "Error de Guardado ❌", true);
                return;
            }
            
            saveFile(filename, content);
        });
    }

    // --- LÓGICA DE CHAT ---

    const addMessageToChat = (text, isTutor = true) => {
        const messageClass = isTutor ? 'chat-message--tutor' : 'chat-message--user';
        const textClass = isTutor ? '' : 'chat-message__text--user';
        const time = new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });

        const newMessage = document.createElement('div');
        newMessage.classList.add('chat-message', messageClass);
        newMessage.innerHTML = `
            <p class="chat-message__time">${time}</p>
            <p class="chat-message__text ${textClass}">${text}</p>
        `;
        chatContent.appendChild(newMessage);
        chatContent.scrollTop = chatContent.scrollHeight;
    };
    
    const sendUserMessage = () => {
        const message = chatInput.value.trim();
        if (message === '') return;

        addMessageToChat(message, false); // Mensaje del usuario
        chatInput.value = '';

        // Generar respuesta del tutor
        let tutorResponse = DEFAULT_RESPONSE;
        const normalizedMessage = message.toLowerCase();
        
        for (const keyword of KEYWORDS) {
            if (normalizedMessage.includes(keyword)) {
                tutorResponse = KEYWORD_RESPONSE;
                break;
            }
        }
        
        setTimeout(() => {
            addMessageToChat(tutorResponse, true); // Respuesta del tutor
        }, 800);
    };

    if (sendButton) {
        sendButton.addEventListener('click', sendUserMessage);
    }
    if (chatInput) {
        chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                sendUserMessage();
            }
        });
    }

    // --- INICIALIZACIÓN ---
    if (codeEditor) {
        codeEditor.value = ''; 
    }
    renderSavedFiles(); 


});

