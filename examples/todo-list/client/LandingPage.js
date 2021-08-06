import "./common";
import React from "react";
import { server } from "telefunc/client";
import renderPage from "./renderPage";
import LoadingWrapper from "./LoadingWrapper";
import Todo from "./Todo";

renderPage(<LandingPage />);

function LandingPage() {
  // We use our Telefunc endpoint to get user information and the user's todos
  const fetchData = async () => await server.getLandingPageData();

  return (
    <LoadingWrapper fetchData={fetchData}>
      {({
        data: {
          todos,
          user: { username },
        },
        updateTodo,
      }) => (
        <div>
          Hi, {username}.
          <br />
          <br />
          Your todos are:
          <div>
            {todos.map((todo) => (
              <Todo todo={todo} updateTodo={updateTodo} key={todo.id} />
            ))}
          </div>
          <br />
          Your completed todos: <a href="/completed">/completed</a>.
        </div>
      )}
    </LoadingWrapper>
  );
}
