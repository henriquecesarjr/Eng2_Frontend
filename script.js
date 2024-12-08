document.addEventListener('DOMContentLoaded', () => {
  const form = document.querySelector('.form');

  // Lidar com o envio do formulário
  form.addEventListener('submit', async (event) => {
    event.preventDefault(); // Evita o comportamento padrão do formulário

    // Captura os valores dos campos
    const name = document.querySelector('.input:nth-of-type(1)').value;
    const email = document.querySelector('.input:nth-of-type(2)').value;
    const phone = document.querySelector('.input:nth-of-type(3)').value;
    const organization = document.querySelector('.input:nth-of-type(4)').value;

    // Validação básica
    if (!name || !email || !phone || !organization) {
      alert('Todos os campos devem ser preenchidos!');
      return;
    }

    // Dados para enviar ao back-end
    const organizerData = {
      name: name,
      email: email,
      phone: phone,
      organization: organization,
    };

    try {
      // Envia os dados para o back-end
      const response = await fetch('http://localhost:8080/organizers/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(organizerData),
      });

      if (response.ok) {
        alert('Organizador cadastrado com sucesso!');
        
        // Limpa os campos após o envio
        form.reset();
      } else {
        const error = await response.json();
        alert('Erro ao cadastrar organizador: ' + error.message);
      }
    } catch (error) {
      console.error('Erro ao enviar dados:', error);
      alert('Ocorreu um erro ao cadastrar. Tente novamente mais tarde.');
    }
  });
});
