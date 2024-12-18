
const API_URL = "http://localhost:8080/participants"; // Substitua pelo endereço real da sua API

// Função para listar organizadores
async function fetchParticipants(pagina = 0, tamanhoPagina = 5) {
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
        data.content.forEach(participant => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${participant.id}</td>
                <td>${participant.name}</td>
                <td>${participant.email}</td>
                <td>${participant.phone}</td>
                <td>
                    <button class="btn btn-warning btn-sm"
                    onclick="editParticipant(${participant.id})
                    ">Editar</button>
                    <button class="btn btn-danger btn-sm" onclick="deleteParticipant(${participant.id})">Excluir</button>
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
        button.onclick = () => fetchParticipants(i, data.size);
        if (i === data.number) {
            button.classList.add("active"); // Destaca a página atual
        }
        paginationControls.appendChild(button);
    }
}

// Função para adicionar participante
async function addParticipant(event) {
    event.preventDefault(); // Evita o recarregamento da página

    const name = document.getElementById("participantName").value;
    const email = document.getElementById("participantEmail").value;
    const phone = document.getElementById("participantPhone").value;
   

    const newParticipant = { name, email, phone};

    try {
        const response = await fetch(API_URL + '/save', {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(newParticipant),
        });

        if (response.ok) {
            document.getElementById("participantForm").reset();
            fetchParticipants(); // Atualiza a tabela
            alert("Participante adicionado com sucesso!");
        } else {
            alert("Erro ao adicionar participante.");
        }
    } catch (error) {
        console.error("Erro ao adicionar participante:", error);
    }
}

// Função para editar organizador
async function editParticipant(id) {
    try {
        // Busca os dados do participante
        const response = await fetch(`${API_URL}/${id}`);
        if (!response.ok) {
            throw new Error(`Erro ao buscar participante: ${response.statusText}`);
        }
        const participante = await response.json();

        // Preenche os campos do formulário
        document.getElementById("participantNameEdit").value = participante.name;
        document.getElementById("participantEmailEdit").value = participante.email;
        document.getElementById("participantTelEdit").value = participante.phone;
       

        // Atualiza o título do modal para "Editar participante"
        document.querySelector(".modal-title").textContent = "Editar participante";

        // Exibe o modal usando Bootstrap
        const formModal = new bootstrap.Modal(document.getElementById("editParticipantModal"));
        formModal.show();

        // Configura o evento de envio do formulário
        const form = document.getElementById("editParticipantForm");
        form.onsubmit = async function (event) {
            event.preventDefault(); // Evita o envio padrão do formulário

            // Cria o objeto atualizado
            const updatedParticipant = {
                name: document.getElementById("participantNameEdit").value,
                email: document.getElementById("participantEmailEdit").value,
                phone: document.getElementById("participantTelEdit").value
            };

            try {
                // Faz a requisição PUT para atualizar os dados
                const updateResponse = await fetch(`${API_URL}/update/${id}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(updatedParticipant),
                });

                if (updateResponse.ok) {
                    form.reset(); // Limpa o formulário
                    fetchParticipants(); // Atualiza a tabela
                    alert("Organizador atualizado com sucesso!");
                    formModal.hide(); // Fecha o modal após a atualização
                } else {
                    alert("Erro ao atualizar participante.");
                }
            } catch (error) {
                console.error("Erro ao atualizar participante:", error);
            }
        };
    } catch (error) {
        console.error("Erro ao buscar participante:", error);
    }
}


// Função para excluir organizador
async function deleteParticipant(id) {
    if (!confirm("Tem certeza que deseja excluir este organizador?")) return;

    try {
        const response = await fetch(`${API_URL}/delete/${id}`, { method: "DELETE" });

        if (response.ok) {
            fetchParticipants(); // Atualiza a tabela
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
    fetchParticipants(); // Carrega a lista ao abrir a página
    document.getElementById("participantForm").addEventListener("submit", addParticipant); // Vincula a função de adicionar
});
