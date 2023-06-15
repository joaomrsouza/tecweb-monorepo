const $form = document.querySelector("#form");

function getUser(user, callback) {
  const xhr = new XMLHttpRequest();
  xhr.open("GET", `https://api.github.com/users/${user}`, true);

  xhr.onload = () => {
    if (xhr.status === 200) {
      callback({
        status: "success",
        data: xhr.response,
      });
    } else if (xhr.status >= 400) {
      callback({
        status: "error",
        message: xhr.statusText,
      });
    }
  };
  xhr.send();
}

function addUserToTable(user) {
  console.log(user, user.name, typeof user);
  const $table = document.querySelector("#table-body");
  const $tr = document.createElement("tr");
  const $tdAvatar = document.createElement("td");
  const $tdName = document.createElement("td");
  const $tdUsername = document.createElement("td");
  const $tdLocation = document.createElement("td");

  $tdAvatar.innerHTML = `<img src="${user.avatar_url}" />`;
  $tdName.innerHTML = user.name;
  $tdUsername.innerHTML = user.login;
  $tdLocation.innerHTML = user.location;

  $tr.appendChild($tdAvatar);
  $tr.appendChild($tdName);
  $tr.appendChild($tdUsername);
  $tr.appendChild($tdLocation);

  $table.appendChild($tr);
}

function setError(username, message) {
  const $errorP = document.querySelector("#error");
  $errorP.innerHTML = `Erro ao procurar informações do usuário ${username}! ${message}`;
}

$form.addEventListener("submit", (e) => {
  e.preventDefault();
  const $usernameInput = document.querySelector("#username");
  const username = $usernameInput.value;
  getUser(username, ({ data, message, status }) => {
    if (status === "success") {
      addUserToTable(JSON.parse(data));
    } else if (status === "error") {
      setError(username, message);
    }
  });
});
