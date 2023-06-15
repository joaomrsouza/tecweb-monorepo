const inMemory = new Map();

function seed() {
  const users = [
    {
      id: 1,
      first_name: "João",
      last_name: "Marcos",
      email: "joaomarcos25@hotmail.com",
    },
    {
      id: 2,
      first_name: "Lucas",
      last_name: "Costa",
      email: "lucascost@gmail.com",
    },
  ];

  const userTable = new Map();
  users.forEach((user) => {
    userTable.set(user.id, user);
  });
  inMemory.set("users", userTable);
}

seed();
const { json, urlencoded } = require("express");
var cors = require("cors");
const app = require("express")();

app.use(cors());
app.use(urlencoded({ extended: true, limit: "1mb" }));
app.use(json());

app.get("/", (_req, res) => {
  res.send(200);
});

app.get("/:resource", (req, res) => {
  const { resource } = req.params;

  res.json({
    data: Array.from(inMemory.get(resource).values()),
  });
});

app.post("/:resource", (req, res) => {
  const { resource } = req.params;
  const { body } = req;

  console.log(body);

  const resourceTable = inMemory.get(resource);
  const lastId = Math.max(...Array.from(resourceTable.keys()));

  resourceTable.set(lastId + 1, {
    id: lastId + 1,
    ...body,
  });

  inMemory.set(resource, resourceTable);

  res.send({});
});

app.put("/:resource/:id", (req, res) => {
  const { resource, id } = req.params;
  const { body } = req;

  const resourceTable = inMemory.get(resource);

  resourceTable.set(id, {
    ...resourceTable.get(id),
    ...body,
  });

  inMemory.set(resource, resourceTable);

  res.send({});
});

app.delete("/:resource/:id", (req, res) => {
  const { resource, id } = req.params;

  const resourceTable = inMemory.get(resource);

  resourceTable.delete(id);

  inMemory.set(resource, resourceTable);

  res.send({});
});

app.listen(3000, () => {
  console.log("Running...");
});
