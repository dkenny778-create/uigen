import { test, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { ToolCallBadge } from "../ToolCallBadge";

afterEach(() => cleanup());

// str_replace_editor
test("shows 'Creating filename' for create command", () => {
  render(
    <ToolCallBadge
      toolName="str_replace_editor"
      args={{ command: "create", path: "src/components/Button.tsx" }}
      state="call"
    />
  );
  expect(screen.getByText("Creating Button.tsx")).toBeDefined();
});

test("shows 'Editing filename' for str_replace command", () => {
  render(
    <ToolCallBadge
      toolName="str_replace_editor"
      args={{ command: "str_replace", path: "src/App.tsx" }}
      state="result"
    />
  );
  expect(screen.getByText("Editing App.tsx")).toBeDefined();
});

test("shows 'Editing filename' for insert command", () => {
  render(
    <ToolCallBadge
      toolName="str_replace_editor"
      args={{ command: "insert", path: "src/App.tsx" }}
      state="result"
    />
  );
  expect(screen.getByText("Editing App.tsx")).toBeDefined();
});

test("shows 'Viewing filename' for view command", () => {
  render(
    <ToolCallBadge
      toolName="str_replace_editor"
      args={{ command: "view", path: "src/index.ts" }}
      state="call"
    />
  );
  expect(screen.getByText("Viewing index.ts")).toBeDefined();
});

test("shows 'Processing filename' for unknown str_replace_editor command", () => {
  render(
    <ToolCallBadge
      toolName="str_replace_editor"
      args={{ command: "undo_edit", path: "src/App.tsx" }}
      state="call"
    />
  );
  expect(screen.getByText("Processing App.tsx")).toBeDefined();
});

test("uses basename only, not full path", () => {
  render(
    <ToolCallBadge
      toolName="str_replace_editor"
      args={{ command: "create", path: "src/components/ui/Card.tsx" }}
      state="call"
    />
  );
  expect(screen.getByText("Creating Card.tsx")).toBeDefined();
});

// file_manager
test("shows 'Deleting filename' for delete command", () => {
  render(
    <ToolCallBadge
      toolName="file_manager"
      args={{ command: "delete", path: "src/old.tsx" }}
      state="result"
    />
  );
  expect(screen.getByText("Deleting old.tsx")).toBeDefined();
});

test("shows 'Renaming ... → ...' for rename command", () => {
  render(
    <ToolCallBadge
      toolName="file_manager"
      args={{ command: "rename", path: "src/Foo.tsx", new_path: "src/Bar.tsx" }}
      state="result"
    />
  );
  expect(screen.getByText("Renaming Foo.tsx → Bar.tsx")).toBeDefined();
});

// fallback
test("shows raw tool name for unknown tools", () => {
  render(<ToolCallBadge toolName="some_other_tool" state="call" />);
  expect(screen.getByText("some_other_tool")).toBeDefined();
});

// state indicators
test("renders spinner svg when state is call", () => {
  const { container } = render(
    <ToolCallBadge
      toolName="str_replace_editor"
      args={{ command: "create", path: "App.tsx" }}
      state="call"
    />
  );
  expect(container.querySelector("svg")).toBeDefined();
  expect(container.querySelector(".bg-emerald-500")).toBeNull();
});

test("renders green dot when state is result", () => {
  const { container } = render(
    <ToolCallBadge
      toolName="str_replace_editor"
      args={{ command: "create", path: "App.tsx" }}
      state="result"
    />
  );
  expect(container.querySelector(".bg-emerald-500")).toBeDefined();
  expect(container.querySelector("svg")).toBeNull();
});

test("renders spinner when state is partial-call", () => {
  const { container } = render(
    <ToolCallBadge
      toolName="str_replace_editor"
      args={{ command: "create", path: "App.tsx" }}
      state="partial-call"
    />
  );
  expect(container.querySelector("svg")).toBeDefined();
});

// missing args fallbacks
test("shows 'Creating file' when path is absent", () => {
  render(
    <ToolCallBadge
      toolName="str_replace_editor"
      args={{ command: "create" }}
      state="call"
    />
  );
  expect(screen.getByText("Creating file")).toBeDefined();
});
