const API_URL = "http://localhost:8080/organizers"; // Substitua pelo endereço real da sua API

// Função para listar organizadores
async function fetchOrganizers() {
    try {
        const response = await fetch(API_URL);
        const organizers = await response.json();

        const tbody = document.querySelector("tbody");
        tbody.innerHTML = ""; // Limpa a tabela antes de carregar novos dados

        organizers.forEach(organizer => {
            const row = document.createElement("tr");

            row.innerHTML = `
                <td>${organizer.id}</td>
                <td>${organizer.name}</td>
                <td>${organizer.email}</td>
                <td>${organizer.phone}</td>
                <td>${organizer.organization}</td>
                <td>
                    <button class="btn btn-warning btn-sm" onclick="editOrganizer(${organizer.id})">Editar</button>
                    <button class="btn btn-danger btn-sm" onclick="deleteOrganizer(${organizer.id})">Excluir</button>
                </td>
            `;

            tbody.appendChild(row);
        });
    } catch (error) {
        console.error("Erro ao buscar organizadores:", error);
    }
}

// Função para adicionar organizador
async function addOrganizer(event) {
    event.preventDefault(); // Evita o recarregamento da página

    const name = document.getElementById("organizerName").value;
    const email = document.getElementById("organizerEmail").value;
    const phone = document.getElementById("tel").value;
    const organization = document.getElementById("organizacao").value;

    const newOrganizer = { name, email, phone, organization };

    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(newOrganizer),
        });

        if (response.ok) {
            document.getElementById("organizerForm").reset();
            fetchOrganizers(); // Atualiza a tabela
            alert("Organizador adicionado com sucesso!");
        } else {
            alert("Erro ao adicionar organizador.");
        }
    } catch (error) {
        console.error("Erro ao adicionar organizador:", error);
    }
}

// Função para editar organizador
async function editOrganizer(id) {
    try {
        const response = await fetch(`${API_URL}/${id}`);
        const organizer = await response.json();

        document.getElementById("organizerName").value = organizer.name;
        document.getElementById("organizerEmail").value = organizer.email;
        document.getElementById("tel").value = organizer.phone;
        document.getElementById("organizacao").value = organizer.organization;

        const form = document.getElementById("organizerForm");
        form.onsubmit = async function (event) {
            event.preventDefault();
            const updatedOrganizer = {
                name: document.getElementById("organizerName").value,
                email: document.getElementById("organizerEmail").value,
                phone: document.getElementById("tel").value,
                organization: document.getElementById("organizacao").value,
            };

            try {
                const response = await fetch(`${API_URL}/${id}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(updatedOrganizer),
                });

                if (response.ok) {
                    form.reset();
                    fetchOrganizers();
                    alert("Organizador atualizado com sucesso!");
                } else {
                    alert("Erro ao atualizar organizador.");
                }
            } catch (error) {
                console.error("Erro ao atualizar organizador:", error);
            }
        };
    } catch (error) {
        console.error("Erro ao buscar organizador:", error);
    }
}

// Função para excluir organizador
async function deleteOrganizer(id) {
    if (!confirm("Tem certeza que deseja excluir este organizador?")) return;

    try {
        const response = await fetch(`${API_URL}/${id}`, { method: "DELETE" });

        if (response.ok) {
            fetchOrganizers(); // Atualiza a tabela
            alert("Organizador excluído com sucesso!");
        } else {
            alert("Erro ao excluir organizador.");
        }
    } catch (error) {
        console.error("Erro ao excluir organizador:", error);
    }
}

// Inicialização
document.addEventListener("DOMContentLoaded", () => {
    fetchOrganizers(); // Carrega a lista ao abrir a página
    document.getElementById("organizerForm").addEventListener("submit", addOrganizer); // Vincula a função de adicionar
});
