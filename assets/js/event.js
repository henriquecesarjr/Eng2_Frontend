document.addEventListener('DOMContentLoaded', () => {
    const form = document.querySelector('#eventForm');
    const eventsTableBody = document.getElementById('eventsTableBody');
  
    // Lidar com o envio do formulário para criar ou editar evento
    form.addEventListener('submit', async (event) => {
      event.preventDefault(); // Evita o comportamento padrão do formulário
  
      // Captura os valores dos campos
      const name = document.querySelector('#eventName').value;
      const organizer = document.querySelector('#organizerId').value;
      const date = document.querySelector('#eventDate').value;
      const location = document.querySelector('#eventLocation').value;
      const description = document.querySelector('#eventDescription').value;
  
      console.log(name, organizer, date, location, description);
  
      // Validação básica
      if (!name || !organizer || !date || !location || !description) {
        alert('Todos os campos devem ser preenchidos!');
        return;
      }
  
      // Dados para enviar ao back-end
      const eventData = {
        nome: name,
        data: date,
        local: location,
        descricao: description,
        organizador: organizer
      };
  
      try {
        // Envia os dados para o back-end
        const response = await fetch('http://localhost:8080/events/save', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(eventData),
        });
  
        if (response.ok) {
          alert('Evento cadastrado com sucesso!');
          
          // Limpa os campos após o envio
          form.reset();
          
          // Recarrega a lista de eventos
          loadEvents();
        } else {
          const error = await response.json();
          alert('Erro ao cadastrar evento: ' + error.message);
        }
      } catch (error) {
        console.error('Erro ao enviar dados:', error);
        alert('Ocorreu um erro ao cadastrar. Tente novamente mais tarde.');
      }
    });
  
    // Função para carregar os eventos da API
    async function loadEvents() {
      try {
        const response = await fetch('http://localhost:8080/events', {
          method: 'GET',
        });
        const data = await response.json();
  
        // Limpa o corpo da tabela antes de preencher com novos dados
        eventsTableBody.innerHTML = '';
  
        data.forEach(event => {
          const row = document.createElement('tr');
  
          row.innerHTML = `
            <td>${event.id}</td>
            <td>${event.nome}</td>
            <td>${event.data}</td>
            <td>${event.local}</td>
            <td>${event.descricao}</td>
            <td>
              <button class="btn btn-warning btn-edit" data-id="${event.id}">Editar</button>
              <button class="btn btn-danger btn-delete" data-id="${event.id}">Excluir</button>
            </td>
          `;
  
          // Adiciona os eventos para os botões de editar e excluir
          row.querySelector('.btn-edit').addEventListener('click', () => editEvent(event.id));
          row.querySelector('.btn-delete').addEventListener('click', () => deleteEvent(event.id));
  
          eventsTableBody.appendChild(row);
        });
      } catch (error) {
        console.error('Erro ao carregar os eventos:', error);
      }
    }
  
    // Função para editar evento
    async function editEvent(id) {
      try {
        // Buscar dados do evento
        const response = await fetch(`http://localhost:8080/events/${id}`);
        const event = await response.json();
  
        if (response.ok) {
          // Preenche os campos do formulário com os dados do evento
          document.querySelector('#eventName').value = event.nome;
          document.querySelector('#organizerId').value = event.organizador;
          document.querySelector('#eventDate').value = event.data;
          document.querySelector('#eventLocation').value = event.local;
          document.querySelector('#eventDescription').value = event.descricao;
  
          // Exibe o modal para edição
          const modal = new bootstrap.Modal(document.getElementById('eventModal'));
          modal.show(); // Abre o modal
  
          // Atualiza o comportamento do formulário para editar o evento
          form.addEventListener('submit', async (event) => {
            event.preventDefault();
  
            // Captura os dados do formulário
            const name = document.querySelector('#eventName').value;
            const organizer = document.querySelector('#organizerId').value;
            const date = document.querySelector('#eventDate').value;
            const location = document.querySelector('#eventLocation').value;
            const description = document.querySelector('#eventDescription').value;
  
            const eventData = {
              nome: name,
              data: date,
              local: location,
              descricao: description,
              organizador: organizer
            };
  
            // Envia os dados atualizados para a API
            const updateResponse = await fetch(`http://localhost:8080/events/update/${id}`, {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(eventData),
            });
  
            if (updateResponse.ok) {
              alert('Evento atualizado com sucesso!');
              form.reset();  // Limpa o formulário
              modal.hide();  // Fecha o modal
              loadEvents();  // Recarrega a lista de eventos
            } else {
              const error = await updateResponse.json();
              alert('Erro ao atualizar evento: ' + error.message);
            }
          });
        } else {
          alert('Erro ao carregar os dados do evento para edição.');
        }
      } catch (error) {
        console.error('Erro ao editar evento:', error);
        alert('Ocorreu um erro ao tentar editar o evento.');
      }
    }
  
    // Função para excluir evento
    async function deleteEvent(id) {
      // Confirmar a exclusão
      if (confirm('Tem certeza que deseja excluir este evento?')) {
        try {
          const response = await fetch(`http://localhost:8080/events/delete/${id}`, {
            method: 'DELETE',
          });
  
          if (response.ok) {
            alert('Evento excluído com sucesso!');
            loadEvents();  // Recarrega a lista após excluir
          } else {
            alert('Erro ao excluir evento.');
          }
        } catch (error) {
          console.error('Erro ao excluir evento:', error);
        }
      }
    }
  
    // Carregar os eventos ao carregar a página
    loadEvents();
  });
  