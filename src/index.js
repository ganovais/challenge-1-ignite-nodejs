const express = require("express");
const cors = require("cors");
const { v4: uuidv4 } = require("uuid");

const app = express();

const users = [];

app.use(cors());
app.use(express.json());

// const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const user = users.find((user) => user.username === username);

  if (!user) {
    return response.status(400).send({ message: "User not found" });
  }

  request.user = user;

  return next();
}

app.post("/users", (request, response) => {
  const { name, username } = request.body;

  const thereIsUser = users.some((user) => user.username === username);

  if (thereIsUser) {
    return response.status(400).send({ error: true });
  }
  const id = uuidv4();

  const user = {
    id,
    name,
    username,
    todos: [],
  };

  users.push(user);

  return response.status(201).send(user);
});

app.get("/todos", checksExistsUserAccount, (request, response) => {
  const { username } = request.user;

  const user = users.find((user) => user.username === username);

  return response.send(user.todos);
});

app.post("/todos", checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;
  const { username } = request.user;
  const id = uuidv4();

  const userIndex = users.findIndex((user) => user.username === username);

  const todo = {
    id,
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date(),
  };

  users[userIndex].todos.push(todo);

  return response.status(201).send(todo);
});

app.put("/todos/:id", checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;
  const id = request.params.id;
  const { username } = request.user;

  const user = users.find((user) => user.username === username);

  const todoIndex = user.todos.findIndex((todo) => todo.id === id);

  if (todoIndex === -1) {
    return response.status(404).send({ error: true });
  }

  user.todos[todoIndex].title = title;
  user.todos[todoIndex].deadline = deadline;

  return response.status(200).send(user.todos[todoIndex]);
});

app.patch("/todos/:id/done", checksExistsUserAccount, (request, response) => {
  const id = request.params.id;
  const { username } = request.user;

  const user = users.find((user) => user.username === username);

  const todoIndex = user.todos.findIndex((todo) => todo.id === id);

  if (todoIndex === -1) {
    return response.status(404).send({ error: true });
  }

  user.todos[todoIndex].done = true;

  return response.status(200).send(user.todos[todoIndex]);
});

app.delete("/todos/:id", checksExistsUserAccount, (request, response) => {
  const id = request.params.id;
  const { username } = request.user;

  const user = users.find((user) => user.username === username);

  const todoIndex = user.todos.findIndex((todo) => todo.id === id);

  if (todoIndex === -1) {
    return response.status(404).send({ error: true });
  }

  user.todos.splice(todoIndex, 1);

  return response.status(204).send();
});

module.exports = app;
