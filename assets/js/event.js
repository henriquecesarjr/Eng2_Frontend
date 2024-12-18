const API_URL = "http://localhost:8080/events"; // Substitua pelo endereço real da sua API

// Função para listar organizadores
async function fetchEvents(pagina = 0, tamanhoPagina = 5) {
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
            throw new Error(`Erro ao buscar eventos: ${response.statusText}`);
        }

        // Converter a resposta em JSON
        const data = await response.json();

        // Obter o elemento do corpo da tabela e limpá-lo
        const tbody = document.querySelector("#table-body");
        tbody.innerHTML = ""; // Limpa a tabela antes de carregar novos dados

        // Preencher a tabela com os eventos
        data.content.forEach(event => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${event.id}</td>
                <td>${event.organizerId}</td>
                <td>${event.date}</td>
                <td>${event.location}</td>
                <td>${event.description}</td>
                <td>
                    <button class="btn btn-warning btn-sm"
                    onclick="editEvent(${event.id})
                    btn-edit">Editar</button>
                    <button class="btn btn-danger btn-sm" onclick="deleteEvent(${event.id})">Excluir</button>
                </td>
            `;
            tbody.appendChild(row);

        });

        // Atualizar informações de paginação na interface (opcional)
        atualizarPaginacao(data);

    } catch (error) {
        console.error("Erro ao buscar eventos:", error);
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

// Função para adicionar evento
async function addEvent(event) {
    event.preventDefault(); // Evita o recarregamento da página
    
    const organizer = document.getElementById("organizerId").value;
    const name = document.getElementById("eventName").value;
    const date = document.getElementById("eventDate").value;
    const location = document.getElementById("eventLocation").value;
    const description = document.getElementById("eventDescription").value;

    if(!organizer || !name || !date || !location || !description){
      alert('Todos os campos devem ser preenchidos')
      return;
    }

    const newEvent = { organizer, name, date, location, description };

    try {
        const response = await fetch(API_URL + '/save', {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(newEvent),
        });

        if (response.ok) {
            document.getElementById("eventForm").reset();
            fetchEvents(); // Atualiza a tabela
            alert("Evento adicionado com sucesso!");
        } else {
            alert("Erro ao adicionar evento.");
        }
    } catch (error) {
        console.error("Erro ao adicionar evento:", error);
    }
}

// Função para editar organizador
async function editEvent(id) {
    try {
        // Busca os dados do evento
        const response = await fetch(`${API_URL}/${id}`);
        if (!response.ok) {
            throw new Error(`Erro ao buscar organizador: ${response.statusText}`);
        }
        const event = await response.json();

        // Preenche os campos do formulário
        document.getElementById("editEventName").value = event.name;
        document.getElementById("editEventDate").value = event.date;
        document.getElementById("editEventLocation").value = event.location;
        document.getElementById("editEventDescription").value = event.description;

        // Atualiza o título do modal para "Editar Evento"
        document.querySelector(".modal-title").textContent = "Editar evento";

        // Exibe o modal usando Bootstrap
        const formModal = new bootstrap.Modal(document.getElementById("editEventModal"));
        formModal.show();

        // Configura o evento de envio do formulário
        const form = document.getElementById("editEventForm");
        form.onsubmit = async function (event) {
            event.preventDefault(); // Evita o envio padrão do formulário

            // Cria o objeto atualizado
            const updatedEvent = {
                name: document.getElementById("editEventName").value,
                date: document.getElementById("editEventDate").value,
                location: document.getElementById("editEventLocation").value,
                description: document.getElementById("editEventDescription").value,
            };

            try {
                // Faz a requisição PUT para atualizar os dados
                const updateResponse = await fetch(`${API_URL}/update/${id}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(updatedEvent),
                });

                if (updateResponse.ok) {
                    form.reset(); // Limpa o formulário
                    fetchEvents(); // Atualiza a tabela
                    alert("Evento atualizado com sucesso!");
                    formModal.hide(); // Fecha o modal após a atualização
                } else {
                    alert("Erro ao atualizar evento.");
                }
            } catch (error) {
                console.error("Erro ao atualizar evento:", error);
            }
        };
    } catch (error) {
        console.error("Erro ao buscar eventos:", error);
    }
}


// Função para excluir evento
async function deleteEvent(id) {
    if (!confirm("Tem certeza que deseja excluir este evento?")) return;

    try {
        const response = await fetch(`${API_URL}/delete/${id}`, { method: "DELETE" });

        if (response.ok) {
            fetchEvents(); // Atualiza a tabela
            alert("Evento excluído com sucesso!");
        } else {
            alert("Erro ao excluir evento.");
        }
    } catch (error) {
        console.error("Erro ao excluir evento:", error);
    }
}

// Inicialização
document.addEventListener("DOMContentLoaded", () => {
    fetchEvents(); // Carrega a lista ao abrir a página
    document.getElementById("eventForm").addEventListener("submit", addEvent); // Vincula a função de adicionar
});
