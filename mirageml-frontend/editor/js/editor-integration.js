async function initBackendIntegration() {
    const isAuth = await MirageMLAPI.checkAuth();

    if (isAuth) {
        updateUserMenu();
        loadCurrentProject();
        console.log('[Integration] Пользователь авторизован:', MirageMLAPI.getCurrentUser());
    } else {
        console.log('[Integration] Пользователь не авторизован. Работа без сохранения на сервер.');
    }

    setupProjectModal();
    setupSaveButton();
    setupProjectsButton();
}

function setupProjectsButton() {
    document.getElementById('projects-btn')?.addEventListener('click', () => {
        showProjectModal();
    });
}

function updateUserMenu() {
    const user = MirageMLAPI.getCurrentUser();
    if (!user) return;

    const avatarEl = document.getElementById('user-avatar');
    const nameEl = document.getElementById('user-name');
    const userInfoBtn = document.getElementById('user-info-btn');

    if (avatarEl) {
        avatarEl.textContent = user.name.substring(0, 2).toUpperCase();
    }
    if (nameEl) {
        nameEl.textContent = user.name;
    }

    if (userInfoBtn) {
        userInfoBtn.style.cursor = 'pointer';
        userInfoBtn.addEventListener('click', () => {
            window.location.href = '/profile';
        });
    }
}

function setupProjectModal() {
    document.getElementById('create-project-btn')?.addEventListener('click', async () => {
        const name = prompt('Введите название проекта:', 'Новый проект');
        if (!name) return;

        const result = await MirageMLAPI.createProject(name);

        if (result.success) {
            showToast('Проект создан', 'success');
            loadProjectsList();
            loadCurrentProject();
        } else {
            showToast(result.error, 'error');
        }
    });
}

async function showProjectModal() {
    const modal = document.getElementById('project-modal');
    if (!modal) return;

    modal.style.display = 'flex';
    await loadProjectsList();
}

async function loadProjectsList() {
    const projectsList = document.getElementById('projects-list');
    if (!projectsList) return;

    const projects = await MirageMLAPI.getProjects();
    const currentProjectId = localStorage.getItem('currentProjectId');

    if (projects.length === 0) {
        projectsList.innerHTML = `
            <div class="empty-projects">
                <i class="fas fa-folder-open"></i>
                <p>У вас пока нет проектов</p>
                <span>Нажмите "Новый проект" для создания</span>
            </div>
        `;
        return;
    }

    projectsList.innerHTML = projects.map(project => {
        const isActive = project.id === currentProjectId;
        const date = new Date(project.updated_at || project.created_at).toLocaleDateString('ru-RU', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });

        return `
            <div class="project-item ${isActive ? 'active' : ''}" data-project-id="${project.id}">
                <div class="project-info">
                    <div class="project-icon">
                        <i class="fas fa-file-code"></i>
                    </div>
                    <div>
                        <div class="project-name">${escapeHtml(project.name)}</div>
                        <div class="project-date">Обновлен: ${date}</div>
                    </div>
                </div>
                <div class="project-actions">
                    <button class="btn btn-primary btn-sm" onclick="selectProject('${project.id}', event)">
                        ${isActive ? '✓ Открыт' : 'Открыть'}
                    </button>
                    ${isActive ? `
                        <button class="btn btn-ghost btn-sm" onclick="closeProject(event)">
                            <i class="fas fa-times"></i>
                        </button>
                    ` : ''}
                </div>
            </div>
        `;
    }).join('');
}

async function selectProject(projectId, event) {
    if (event) event.stopPropagation();

    const project = await MirageMLAPI.loadProject(projectId);

    if (project) {
        authState.currentProject = project;
        loadProjectIntoEditor(project);
        showToast('Проект загружен', 'success');
        document.getElementById('project-modal').style.display = 'none';
        loadProjectsList();
    } else {
        showToast('Ошибка загрузки проекта', 'error');
    }
}

async function closeProject(event) {
    if (event) event.stopPropagation();

    authState.currentProject = null;
    localStorage.removeItem('currentProjectId');

    state.sections = [];
    DOM.canvas.innerHTML = '';
    DOM.canvasPlaceholder.style.display = 'flex';

    showToast('Проект закрыт', 'info');
    loadProjectsList();
}

async function loadCurrentProject() {
    const projectId = localStorage.getItem('currentProjectId');

    if (projectId) {
        const project = await MirageMLAPI.getProject(projectId);
        if (project) {
            authState.currentProject = project;
            loadProjectIntoEditor(project);
        }
    }
}

function loadProjectIntoEditor(project) {
    console.log('[Integration] loadProjectIntoEditor - загружаем проект:', project.name);
    console.log('[Integration] loadProjectIntoEditor - элементы:', project.elements ? Object.keys(project.elements).length : 0);

    state.sections = [];
    DOM.canvas.innerHTML = '';
    if (DOM.canvasPlaceholder) DOM.canvasPlaceholder.style.display = 'none';

    if (project.elements) {
        const sortedElements = Object.values(project.elements).sort((a, b) => a.order - b.order);

        sortedElements.forEach((elementData, index) => {
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = elementData.html;
            const sectionElement = tempDiv.firstElementChild;

            if (sectionElement) {
                sectionElement.classList.add('canvas-section');
                sectionElement.style.border = '2px solid transparent';
                sectionElement.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)';

                const sectionId = `section-${Date.now()}-${index}`;
                sectionElement.id = sectionId;

                DOM.canvas.appendChild(sectionElement);

                state.sections.push({
                    id: sectionId,
                    name: elementData.name || 'Секция',
                    element: sectionElement,
                    css: elementData.css || ''
                });
            }
        });

        console.log('[Integration] loadProjectIntoEditor - загружено секций:', state.sections.length);
        updateElementsCount();
        updateLayersList();
        saveToHistory();
    }
}

function setupSaveButton() {
    const saveBtn = document.getElementById('save-btn');
    if (saveBtn) {
        const newSaveBtn = saveBtn.cloneNode(true);
        saveBtn.parentNode.replaceChild(newSaveBtn, saveBtn);

        newSaveBtn.addEventListener('click', async () => {
            await handleSaveProject();
        });
    }
}

async function handleSaveProject() {
    const isAuth = MirageMLAPI.isAuthenticated();
    console.log('[Integration] handleSaveProject - isAuthenticated:', isAuth);
    console.log('[Integration] handleSaveProject - localStorage token:', localStorage.getItem('token') ? 'есть' : 'нет');
    console.log('[Integration] handleSaveProject - sessionStorage token:', sessionStorage.getItem('token') ? 'есть' : 'нет');

    if (!isAuth) {
        console.log('[Integration] handleSaveProject - пробуем восстановить авторизацию...');
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        if (token) {
            console.log('[Integration] handleSaveProject - токен найден, пробуем загрузить профиль...');
            await MirageMLAPI.checkAuth();
            if (MirageMLAPI.isAuthenticated()) {
                console.log('[Integration] handleSaveProject - авторизация восстановлена!');
            } else {
                console.log('[Integration] handleSaveProject - не удалось восстановить авторизацию');
            }
        } else {
            console.log('[Integration] handleSaveProject - токен не найден');
        }
    }

    if (!MirageMLAPI.isAuthenticated()) {
        showToast('Ошибка авторизации. Перенаправляем...', 'error');
        setTimeout(() => {
            window.location.href = '/';
        }, 2000);
        return;
    }

    const canvasSize = {
        width: parseInt(document.getElementById('canvas-width')?.value || 800),
        height: parseInt(document.getElementById('canvas-height')?.value || 600)
    };

    console.log('[Integration] handleSaveProject - сохраняем на сервере...');
    const result = await MirageMLAPI.saveProject(state.sections, canvasSize);

    if (result.success) {
        showToast('Проект сохранён на сервере', 'success');
        updateStatus('Проект сохранён на сервере');

        if (document.getElementById('project-modal').style.display === 'flex') {
            loadProjectsList();
        }
    } else {
        showToast(result.error, 'error');
        updateStatus('Ошибка сохранения');
    }
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function updateElementsCount() {
    const elementsCount = document.getElementById('elements-count');
    if (elementsCount) {
        elementsCount.textContent = `${state.sections.length} секций`;
    }
}

function updateLayersList() {
    console.log('[Integration] Layers list updated');
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initBackendIntegration);
} else {
    initBackendIntegration();
}
