const displayResult = (elementId, data, type) => {
    const el = document.getElementById(elementId);

    if (data.error) {
        el.innerHTML = `<span class="error">[ERROR] ${data.error}</span>`;
        return;
    }

    if (Array.isArray(data)) {
        el.innerHTML = '';
        if (data.length === 0) {
            el.innerHTML = '// SISTEMA: NO HAY REGISTROS EN LA BASE DE DATOS';
            return;
        }

        data.forEach(item => {
            let div = document.createElement('div');
            div.className = 'record-card';

            let html = `<strong>ID_SISTEMA: [ ${item.id} ]</strong><br>`;
            for (let key in item) {
                if (key !== 'id' && key !== 'avatar' && key !== 'img') {
                    html += `> ${key.toUpperCase()}: ${item[key]}<br>`;
                }
            }

            let imgHtml = '<div class="image-preview">';
            if (item.avatar) {
                imgHtml += `<img src="${item.avatar}" alt="Avatar">`;
            }
            if (item.img && Array.isArray(item.img)) {
                item.img.forEach(src => {
                    imgHtml += `<img src="${src}" alt="Mascota">`;
                });
            }
            imgHtml += '</div>';

            // Botón de eliminar inyectado dinámicamente con el ID correspondiente
            let actions = `<div class="action-buttons">
                <button class="btn-action btn-edit" onclick="openEditModal('${type}', ${item.id})">[/] MODIFICAR</button>
                <button class="btn-action btn-delete" onclick="deleteRecord('${type}', ${item.id})">[X] ELIMINAR</button>
                </div>`;
            div.innerHTML = html + imgHtml + actions;
            el.appendChild(div);
        });
    } else {
        el.innerHTML = JSON.stringify(data, null, 2);
    }
};

const handleFormSubmit = async (event, endpoint, resultId) => {
    event.preventDefault();
    const form = event.target;
    const formData = new FormData(form);

    try {
        const response = await fetch(`/api/${endpoint}`, {
            method: 'POST',
            body: formData
        });
        const result = await response.json();

        if (response.ok) {
            form.reset();
            fetchData(endpoint, resultId); // Recargar la lista automáticamente tras crear
        } else {
            displayResult(resultId, result, endpoint);
        }
    } catch (error) {
        displayResult(resultId, { error: error.message }, endpoint);
    }
};

const fetchData = async (endpoint, resultId) => {
    //Mensaje visual de carga
    const el = document.getElementById(resultId);
    el.innerHTML = '<span style="color: var(--neon-blue);">// CONSULTANDO BASE DE DATOS...</span>';

    try {
        const response = await fetch(`/api/${endpoint}`);
        const data = await response.json();

        //Retraso artificial para que se note la acción
        setTimeout(() => {
            displayResult(resultId, data, endpoint);
        }, 400);

    } catch (error) {
        displayResult(resultId, { error: error.message }, endpoint);
    }
};
const deleteRecord = async (endpoint, id) => {
    if (!confirm('¿Estás seguro de eliminar este registro del JSON?')) return;

    try {
        const response = await fetch(`/api/${endpoint}/${id}`, {
            method: 'DELETE'
        });
        const result = await response.json();

        if (response.ok) {
            // Refrescar los resultados mostrados en pantalla si la eliminación fue exitosa
            fetchData(endpoint, endpoint === 'users' ? 'userResult' : 'petResult');
        } else {
            alert(result.error);
        }
    } catch (error) {
        alert(error.message);
    }
};
const closeModal = (modalId) => document.getElementById(modalId).style.display = 'none';

const openEditModal = async (type, id) => {
    try {
        const response = await fetch(`/api/${type}/${id}`);
        const data = await response.json();
        if (!response.ok) throw new Error(data.error);

        if (type === 'users') {
            document.getElementById('editUserId').value = data.id;
            document.getElementById('editUserFirstname').value = data.firstname;
            document.getElementById('editUserLastname').value = data.lastname;
            document.getElementById('editUserUsername').value = data.username;
            document.getElementById('editUserPassword').value = '';
            document.getElementById('editUserModal').style.display = 'flex';
        } else {
            document.getElementById('editPetId').value = data.id;
            document.getElementById('editPetEspecie').value = data.especie;
            document.getElementById('editPetColor').value = data.color;
            document.getElementById('editPetEdad').value = data.edad;
            document.getElementById('editPetSexo').value = data.sexo;
            document.getElementById('editPetModal').style.display = 'flex';
        }
    } catch (error) { alert("Error al cargar datos: " + error.message); }
};

const submitEditUser = async (event) => {
    event.preventDefault();
    const id = document.getElementById('editUserId').value;
    const formData = new FormData(event.target);
    if (!formData.get('password')) formData.delete('password');

    try {
        const response = await fetch(`/api/users/${id}`, { method: 'PUT', body: formData });
        if (response.ok) { closeModal('editUserModal'); event.target.reset(); getUsers(); }
        else alert((await response.json()).error);
    } catch (err) { alert(err.message); }
};

const submitEditPet = async (event) => {
    event.preventDefault();
    const id = document.getElementById('editPetId').value;
    try {
        const response = await fetch(`/api/pets/${id}`, { method: 'PUT', body: new FormData(event.target) });
        if (response.ok) { closeModal('editPetModal'); event.target.reset(); getPets(); }
        else alert((await response.json()).error);
    } catch (err) { alert(err.message); }
};

// NUEVA FUNCIÓN DE BÚSQUEDA POR ID
const fetchDataById = async (endpoint, id, resultId) => {
    if (!id) {
        return fetchData(endpoint, resultId); // Si el campo está vacío, carga todos
    }

    const el = document.getElementById(resultId);
    el.innerHTML = '<span style="color: var(--neon-blue);">// BUSCANDO REGISTRO [ ID: ' + id + ' ]...</span>';

    try {
        const response = await fetch(`/api/${endpoint}/${id}`);
        const data = await response.json();

        setTimeout(() => {
            if (!response.ok) {
                displayResult(resultId, data, endpoint); // Mostrará el error 404
            } else {
                // Lo envolvemos en un array [data] para que nuestra función original displayResult 
                // entienda que es un objeto válido y dibuje la tarjeta con sus botones
                displayResult(resultId, [data], endpoint);
            }
        }, 400);
    } catch (error) {
        displayResult(resultId, { error: error.message }, endpoint);
    }
};

const searchUserById = () => {
    const id = document.getElementById('searchUserId').value;
    fetchDataById('users', id, 'userResult');
};

const searchPetById = () => {
    const id = document.getElementById('searchPetId').value;
    fetchDataById('pets', id, 'petResult');
};

// Event Listeners y Wrappers
const createUser = (e) => handleFormSubmit(e, 'users', 'userResult');
const createPet = (e) => handleFormSubmit(e, 'pets', 'petResult');
const getUsers = () => fetchData('users', 'userResult');
const getPets = () => fetchData('pets', 'petResult');

// Cargar los datos iniciales al arrancar la página
window.onload = () => {
    getUsers();
    getPets();
};