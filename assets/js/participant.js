
document.addEventListener('DOMContentLoaded', () => {
    const form = document.querySelector('#participantForm');
    const participantsTableBody = document.getElementById('participantsTableBody');
  
    // Lidar com o envio do formulário
    form.addEventListener('submit', async (event) => {
      event.preventDefault(); // Evita o comportamento padrão do formulário
  
      // Captura os valores dos campos
      const name = document.querySelector('#pName').value;
      const email = document.querySelector('#email').value;
      const phone = document.querySelector('#phone').value;
      const evento = document.querySelector('#eventoId');
  
      // Validação básica
      if (!name || !email || !phone || !evento) {
        alert('Todos os campos devem ser preenchidos!');
        return;
      }
  
      // Dados para enviar ao back-end
      const participantData = {
        nome: name,
        email: email,
        tel: phone,
        idEvento: evento,
      };
  
      try {
        // Envia os dados para o back-end
        const response = await fetch('http://localhost:8080/events/save', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(participantData),
        });
  
        if (response.ok) {
          alert('Evento cadastrado com sucesso!');
          
          // Limpa os campos após o envio
          form.reset();
  
          // Recarrega a lista de participantes
          loadParticipants();
        } else {
          const error = await response.json();
          alert('Erro ao cadastrar evento: ' + error.message);
        }
      } catch (error) {
        console.error('Erro ao enviar dados:', error);
        alert('Ocorreu um erro ao cadastrar. Tente novamente mais tarde.');
      }
    });
  
    // Função para carregar os participantes da API
    async function loadParticipants() {
      try {
        const response = await fetch('http://localhost:8080/participants',{
            method:'GET',
        });  // Substitua pela URL correta da sua API
        const data = await response.json();
  
        // Limpa o corpo da tabela antes de preencher com novos dados
        participantsTableBody.innerHTML = '';
  
        data.forEach(participant => {
          const row = document.createElement('tr');
  
          row.innerHTML = `
            <td>${participant.id}</td>
            <td>${participant.eventId}</td>
            <td>${participant.name}</td>
            <td>${participant.email}</td>
            <td>${participant.phone}</td>
            <td>
              <button class="btn btn-warning btn-edit" data-id="${participant.id}">Editar</button>
              <button class="btn btn-danger btn-delete" data-id="${participant.id}">Excluir</button>
            </td>
          `;
  
          // Adiciona os eventos para os botões de editar e excluir
          row.querySelector('.btn-edit').addEventListener('click', () => editParticipant(participant.id));
          row.querySelector('.btn-delete').addEventListener('click', () => deleteParticipant(participant.id));
  
          participantsTableBody.appendChild(row);
        });
      } catch (error) {
        console.error('Erro ao carregar os participantes:', error);
      }
    }
  
   // Função para editar participante
async function editParticipant(id) {
    try {
      // Buscar dados do participante
      const response = await fetch(`http://localhost:8080/participants/${id}`);
      const participant = await response.json();
  
      if (response.ok) {
        // Preenche os campos do formulário com os dados do participante
        document.querySelector('#pName').value = participant.nome;
        document.querySelector('#email').value = participant.email;
        document.querySelector('#phone').value = participant.tel;
        document.querySelector('#eventoId').value = participant.eventoId;
  
        // Exibe o modal
        const form = document.querySelector('#participantForm');
        const modal = new bootstrap.Modal(document.getElementById('eventModal'));
        modal.show();  // Abre o modal
  
        // Atualiza o comportamento do formulário para editar o participante
        form.addEventListener('submit', async (event) => {
          event.preventDefault();
  
          // Captura os dados do formulário
          const name = document.querySelector('#pName').value;
          const email = document.querySelector('#email').value;
          const phone = document.querySelector('#phone').value;
          const evento = document.querySelector('#eventoId').value;
  
          const participantData = {
            nome: name,
            email: email,
            tel: phone,
            eventoId: evento
          };
  
          // Envia os dados atualizados para a API
          const updateResponse = await fetch(`http://localhost:8080/participants/update/${id}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(participantData),
          });
  
          if (updateResponse.ok) {
            alert('Participante atualizado com sucesso!');
            form.reset();  // Limpa o formulário
            modal.hide();  // Fecha o modal
            loadParticipants();  // Recarrega a lista de participantes
          } else {
            const error = await updateResponse.json();
            alert('Erro ao atualizar participante: ' + error.message);
          }
        });
      } else {
        alert('Erro ao carregar os dados do participante para edição.');
      }
    } catch (error) {
      console.error('Erro ao editar participante:', error);
      alert('Ocorreu um erro ao tentar editar o participante.');
    }
  }
  
    // Função para excluir participante
    async function deleteParticipant(id) {
      // Confirmar a exclusão
      if (confirm('Tem certeza que deseja excluir este participante?')) {
        try {
          const response = await fetch(`http://localhost:8080/participants/delete/${id}`, {
            method: 'DELETE',
          });
  
          if (response.ok) {
            alert('Participante excluído com sucesso!');
            loadParticipants();  // Recarrega a lista após excluir
          } else {
            alert('Erro ao excluir participante.');
          }
        } catch (error) {
          console.error('Erro ao excluir participante:', error);
        }
      }
    }
  
    // Carregar os participantes ao carregar a página
    loadParticipants();
  });
  