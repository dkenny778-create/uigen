"use client";

import { Loader2 } from "lucide-react";

interface ToolCallBadgeProps {
  toolName: string;
  args?: Record<string, unknown>;
  state: "call" | "partial-call" | "result";
}

function basename(path: string): string {
  return path.split("/").pop() || path;
}

function getLabel(toolName: string, args?: Record<string, unknown>): string {
  const filename = args?.path ? basename(String(args.path)) : null;
  const newFilename = args?.new_path ? basename(String(args.new_path)) : null;

  if (toolName === "str_replace_editor") {
    switch (args?.command) {
      case "create":
        return filename ? `Creating ${filename}` : "Creating file";
      case "str_replace":
      case "insert":
        return filename ? `Editing ${filename}` : "Editing file";
      case "view":
        return filename ? `Viewing ${filename}` : "Viewing file";
      default:
        return filename ? `Processing ${filename}` : "Processing file";
    }
  }

  if (toolName === "file_manager") {
    switch (args?.command) {
      case "delete":
        return filename ? `Deleting ${filename}` : "Deleting file";
      case "rename":
        return filename && newFilename
          ? `Renaming ${filename} → ${newFilename}`
          : "Renaming file";
    }
  }

  return toolName;
}

export function ToolCallBadge({ toolName, args, state }: ToolCallBadgeProps) {
  const label = getLabel(toolName, args);
  const isPending = state !== "result";

  return (
    <div className="inline-flex items-center gap-2 mt-2 px-3 py-1.5 bg-neutral-50 rounded-lg text-xs font-mono border border-neutral-200">
      {isPending ? (
        <Loader2 className="w-3 h-3 animate-spin text-blue-600" />
      ) : (
        <div className="w-2 h-2 rounded-full bg-emerald-500" />
      )}
      <span className="text-neutral-700">{label}</span>
    </div>
  );
}
