const API_URL = "http://localhost:8080/organizers"; // Substitua pelo endereço real da sua API

// Função para listar organizadores
async function fetchOrganizers(pagina = 0, tamanhoPagina = 5) {
    try {
        // Montar a URL com os parâmetros de paginação
        const url = `${API_URL}?page=${pagina}&size=${tamanhoPagina}&sort=id`;

        // Fazer a requisição à API
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        });

        // Verificar se a resposta é válida
        if (!response.ok) {
            throw new Error(`Erro ao buscar organizadores: ${response.statusText}`);
        }

        // Converter a resposta em JSON
        const data = await response.json();

        // Obter o elemento do corpo da tabela e limpá-lo
        const tbody = document.querySelector("#table-body");
        tbody.innerHTML = ""; // Limpa a tabela antes de carregar novos dados

        // Preencher a tabela com os organizadores
        data.content.forEach(organizer => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${organizer.id}</td>
                <td>${organizer.name}</td>
                <td>${organizer.email}</td>
                <td>${organizer.phone}</td>
                <td>${organizer.organization}</td>
                <td>
                    <button class="btn btn-warning btn-sm"
                    onclick="editOrganizer(${organizer.id})
                    btn-edit">Editar</button>
                    <button class="btn btn-danger btn-sm" onclick="deleteOrganizer(${organizer.id})">Excluir</button>
                </td>
            `;
            tbody.appendChild(row);

        });

        // Atualizar informações de paginação na interface (opcional)
        atualizarPaginacao(data);

    } catch (error) {
        console.error("Erro ao buscar organizadores:", error);
    }
}

// Função para atualizar os controles de paginação
function atualizarPaginacao(data) {
    const paginationControls = document.querySelector("#pagination-controls");
    if (!paginationControls) return; // Caso não exista o elemento, evita erros

    paginationControls.innerHTML = ""; // Limpa os controles de paginação

    // Adiciona botões para cada página
    for (let i = 0; i < data.totalPages; i++) {
        const button = document.createElement("button");
        button.textContent = i + 1;
        button.className = "btn btn-light btn-sm mx-1";
        button.onclick = () => fetchOrganizers(i, data.size);
        if (i === data.number) {
            button.classList.add("active"); // Destaca a página atual
        }
        paginationControls.appendChild(button);
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
        const response = await fetch(API_URL + '/save', {
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
        // Busca os dados do organizador
        const response = await fetch(`${API_URL}/${id}`);
        if (!response.ok) {
            throw new Error(`Erro ao buscar organizador: ${response.statusText}`);
        }
        const organizer = await response.json();

        // Preenche os campos do formulário
        document.getElementById("organizerNameEdit").value = organizer.name;
        document.getElementById("organizerEmailEdit").value = organizer.email;
        document.getElementById("telEdit").value = organizer.phone;
        document.getElementById("organizacaoEdit").value = organizer.organization;

        // Atualiza o título do modal para "Editar Evento"
        document.querySelector(".modal-title").textContent = "Editar Organizador";

        // Exibe o modal usando Bootstrap
        const formModal = new bootstrap.Modal(document.getElementById("editOrganizerModal"));
        formModal.show();

        // Configura o evento de envio do formulário
        const form = document.getElementById("editOrganizerForm");
        form.onsubmit = async function (event) {
            event.preventDefault(); // Evita o envio padrão do formulário

            // Cria o objeto atualizado
            const updatedOrganizer = {
                name: document.getElementById("organizerNameEdit").value,
                email: document.getElementById("organizerEmailEdit").value,
                phone: document.getElementById("telEdit").value,
                organization: document.getElementById("organizacaoEdit").value,
            };

            try {
                // Faz a requisição PUT para atualizar os dados
                const updateResponse = await fetch(`${API_URL}/update/${id}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(updatedOrganizer),
                });

                if (updateResponse.ok) {
                    form.reset(); // Limpa o formulário
                    fetchOrganizers(); // Atualiza a tabela
                    alert("Organizador atualizado com sucesso!");
                    formModal.hide(); // Fecha o modal após a atualização
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
        const response = await fetch(`${API_URL}/delete/${id}`, { method: "DELETE" });

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
