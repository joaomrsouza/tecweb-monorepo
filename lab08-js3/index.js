const $usersList = document.querySelector("#usersList");
const $formCadastrar = document.querySelector("#formCadastrar");
const $formAtualizar = document.querySelector("#formAtualizar");
const $formDeletar = document.querySelector("#formDeletar");

async function fetchAPI(route, method = "GET", body = undefined) {
  // http://localhost:3000/
  const data = await fetch(`https://reqres.in/api/${route}`, {
    body,
    method,
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (data.status === 204) return;

  return await data.json();
}

// === Fetch and Update Users Table ===

function updateUsers(usersList) {
  const columns = ["id", "first_name", "last_name", "email"];
  $usersList.innerHTML = "";
  usersList.map((user) => {
    const $tr = document.createElement("tr");
    columns.forEach((column) => {
      const $td = document.createElement("td");
      $td.innerHTML = user[column];
      $tr.appendChild($td);
    });
    $usersList.appendChild($tr);
  });
}

async function fetchUsers() {
  const { data } = await fetchAPI("users?page=1");
  updateUsers(data);
}

fetchUsers();

// === Create Users ===

$formCadastrar.addEventListener("submit", async (e) => {
  e.preventDefault();
  const formData = new FormData($formCadastrar);

  await fetchAPI("users", "POST", formData);

  fetchUsers();
  $formCadastrar.reset();
});

// === Update Users ===

$formAtualizar.addEventListener("submit", async (e) => {
  e.preventDefault();
  const formData = new FormData($formAtualizar);

  const id = formData.get("id");
  formData.delete("id");

  await fetchAPI(`users/${id}`, "PUT", formData);

  fetchUsers();
  $formAtualizar.reset();
});

// === Delete Users ===

$formDeletar.addEventListener("submit", async (e) => {
  e.preventDefault();
  const formData = new FormData($formDeletar);

  const id = formData.get("id");

  await fetchAPI(`users/${id}`, "DELETE");

  fetchUsers();
  $formDeletar.reset();
});
