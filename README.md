# Grupo 8 - PS PET
- Participantes: `Marcos Vinicius`, `Ravel`, `Arthur`, `Lara`.

## Instalação e Preparação do ambiente
O processo de instalação é simples, envolvendo os comandos:
```
npm install
npm start
```

Caso o ambiente tenha algum tipo de problema de permissão com o arquivo `start.sh`, deve-se executar o seguinte comando:
```
chmod +x start.sh
```
Supõe-se execução em ambiente `linux` devido ao formato utilizado pelas APIs.

## Funcionamento

O projeto de armazenamento e manipulação de gabaritos foi criado com o intuito de manter uma interface gráfica e com múltiplas funcionalidades para os usuários do mesmo. O objetivo é que possa ser inserido, pesquisado, editado e deletado cada um deles. Neste quesito, o projeto é separado em três telas principais:

1. Início
2. Participantes
3. Confirmação/Edição

### 1. Tela Inicial

A tela de início do site possui o processo de criação de um usuário e a pesquisa de gabaritos existentes a partir do `nome do arquivo`.

O processo de criação do usuário é feito através do fornecimento de informações ao sistema, sendo essas: nome do aluno, escola, matrícula e a imagem do gabarito (normalmente PNG). Após inserir todas as informações devidas, o usuário poderá enviar os dados e será movido para a tela de confirmação.

A busca é realizada a partir do momento em que o usuário quiser achar um gabarito específico. Na interface existe uma área de rolamento que mostra os PNGs com todos os gabaritos, e é permitido acessá-los.

### 2. Tela de Participantes

Nesta tela são vistos todos os usuários, seus nomes, escolas, matrículas e gabaritos. É possível pesquisar e filtrar por campos.

A edição e deleção dos usuários também ocorre nessa tela. A função de deleção ocorre após uma notificação pedindo a confirmação da deleção. Já a edição, assim como o processo de envio de novos usuários, é feita a partir da tela de confirmação/edição.

### 3. Tela de Confirmação/Edição

Essa tela possui duas funcionalidades:

- Permitir a edição da leitura do gabarito antes do salvamento no banco de dados.  
- Permitir a edição de informações dos usuários, feitas a partir da tela de participantes.

O funcionamento desta tela consiste em trazer as informações em inputs para a leitura, e, se o usuário achar necessário editar, ele clica no botão de edição, que alterará os campos de leitura para que seja permitido escrever. Após isso, o usuário pode confirmar o envio de um novo participante ou a edição do mesmo.

# Ferramentas

As ferramentas utilizadas para a criação do site se resumem a:
- **Front-end:** Inicialmente, foi elaborado um protótipo das telas do site com o Figma.  
- Foram utilizadas as seguintes linguagens: JavaScript, HTML e CSS, por conta da maior facilidade e agilidade, além de ser versátil o uso. O uso de JavaScript em toda a parte do projeto, seja frontend ou backend, ajuda a manter a integridade do funcionamento.  
- Para as fontes da página e ícones de certos botões, foram utilizadas as ferramentas do Font Awesome.  
- Para a personalização dos alertas pré edição e deleção, e pós confirmação do envio de dados ou a atualização dos mesmos, foi utilizado o SweetAlert2.

# Backend
O servidor foi inteiramente moldado em `NodeJS`, utilizando Express para gerenciamento de rotas.

## Rotas
O projeto conta com três rotas de acesso as páginas citadas anteriormente, além de:
- `/pet/gabarito` (GET) para puxar informações dos gabaritos do servidor, podendo ou não conter filtros.
- `/pet/gabarito` (POST) para publicar um novo gabarito.
- `/pet/gabarito` (PATCH) para editar um gabarito previamente enviado.
- `/pet/gabarito` (DELETE) para deletar um gabarito previamente enviado.

A integração com o frontend acontece utilizando fetchs em javascript que manipulam valores internos da página, mantendo responsividade e eficiência.

## Databases
- O sistema utiliza o MySQL, através da biblioteca `mysql2/promise` para gerenciar conexões, utilizando um sólido sistemas de classes, instâncias e objetos mantendo o príncipio da responsabilidade e um código limpo.
- Além disso, o `redis` é utilizado como biblioteca para fazer um controle de requisições, evitando uma sobrecarga do servidor.
