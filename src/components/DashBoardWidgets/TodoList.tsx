import React, { useEffect, useState } from "react";
import { Box, Typography, TextField, IconButton } from "@mui/material";
import Checkbox from "@mui/material/Checkbox";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import CheckIcon from "@mui/icons-material/Check";

interface TodoItem {
  id: string;
  text: string;
  completed: boolean;
}

interface TodoListProps {
  todoItems?: TodoItem[];
  onUpdate?: (todos: TodoItem[]) => void;
}

const TodoList: React.FC<TodoListProps> = ({ todoItems = [], onUpdate }) => {
  const [todos, setTodos] = useState<TodoItem[]>(todoItems);
  const [newTodo, setNewTodo] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState("");

  useEffect(() => {
    setTodos(todoItems);
  }, [todoItems]);

  const handleAddTodo = () => {
    if (newTodo.trim() !== "") {
      const newTodos = [
        ...todos,
        { id: Date.now().toString(), text: newTodo.trim(), completed: false },
      ];
      setTodos(newTodos);
      setNewTodo("");

      // Call onUpdate to save to database
      if (onUpdate) {
        onUpdate(newTodos);
      }
    }
  };

  const handleToggleTodo = (id: string) => {
    const newTodos = todos.map((todo) =>
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    );
    setTodos(newTodos);

    // Call onUpdate to save to database
    if (onUpdate) {
      onUpdate(newTodos);
    }
  };

  const handleEditTodo = (id: string, text: string) => {
    setEditingId(id);
    setEditingText(text);
  };

  const handleSaveEdit = (id: string) => {
    const newTodos = todos.map((todo) =>
      todo.id === id ? { ...todo, text: editingText } : todo
    );
    setTodos(newTodos);
    setEditingId(null);
    setEditingText("");

    // Call onUpdate to save to database
    if (onUpdate) {
      onUpdate(newTodos);
    }
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === "Enter") {
      handleAddTodo();
    }
  };

  return (
    <>
      <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
        <Box
          sx={{
            borderRadius: 2,
            borderBottomLeftRadius: 0,
            borderBottomRightRadius: 0,
            pt: 2,
            px: 1.5,
            bgcolor: "Highlight",
            mb: 1,
          }}
        >
          <Typography
            variant="h6"
            sx={{ fontWeight: "bold", mb: 2, color: "white" }}
          >
            Todo List
          </Typography>
        </Box>
        <Box
          sx={{ display: "flex", gap: 1, mb: 2, alignItems: "center", p: 1 }}
        >
          <TextField
            size="small"
            placeholder="Add new todo"
            value={newTodo}
            onChange={(e) => setNewTodo(e.target.value)}
            onKeyPress={handleKeyPress}
            sx={{ flex: 1 }}
          />
          <IconButton
            onClick={handleAddTodo}
            sx={{
              // backgroundColor: "primary.main",
              color: "primary.main",
              "&:hover": { backgroundColor: "primary.main", color: "white" },
            }}
          >
            <AddIcon fontSize={"medium"} />
          </IconButton>
        </Box>

        <Box
          sx={{
            flex: 1,
            overflow: "auto",
            display: "flex",
            flexDirection: "column",
            gap: 1,
            px: 1,
          }}
        >
          {todos.map((todo) => (
            <Box
              key={todo.id}
              sx={{
                display: "flex",
                alignItems: "center",
                p: 0.3,
                borderRadius: 1,
                backgroundColor: "background.paper",
                "&:hover": { backgroundColor: "action.hover" },
              }}
            >
              <Checkbox
                checked={todo.completed}
                onChange={() => handleToggleTodo(todo.id)}
              />

              {editingId === todo.id ? (
                <TextField
                  size="small"
                  value={editingText}
                  onChange={(e) => setEditingText(e.target.value)}
                  onBlur={() => handleSaveEdit(todo.id)}
                  onKeyPress={(e) =>
                    e.key === "Enter" && handleSaveEdit(todo.id)
                  }
                  autoFocus
                  sx={{ flex: 1 }}
                />
              ) : (
                <Typography
                  sx={{
                    flex: 1,
                    textDecoration: todo.completed ? "line-through" : "none",
                    color: todo.completed ? "text.secondary" : "text.primary",
                  }}
                >
                  {todo.text}
                </Typography>
              )}

              {editingId === todo.id ? (
                <IconButton onClick={() => handleSaveEdit(todo.id)}>
                  <CheckIcon />
                </IconButton>
              ) : (
                <IconButton onClick={() => handleEditTodo(todo.id, todo.text)}>
                  <EditIcon />
                </IconButton>
              )}
            </Box>
          ))}
        </Box>
      </Box>
    </>
  );
};

export default TodoList;
