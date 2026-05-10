"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  demoDeliverables,
  demoMemory,
  demoTasks,
  demoWorkspace,
} from "./demo-data";
import type {
  Deliverable,
  MemoryItem,
  Task,
  TaskPriority,
  TaskStatus,
  Workspace,
} from "./types";

/**
 * Client-side store for the demo experience. When wiring Supabase, replace
 * the mutators with TanStack Query mutations that hit your API routes; the
 * shape of the store mirrors the database schema 1:1, so components don't
 * need to change.
 */

interface HenryState {
  workspace: Workspace;
  tasks: Task[];
  memory: MemoryItem[];
  deliverables: Deliverable[];

  // tasks
  addTask: (input: {
    title: string;
    description?: string;
    priority: TaskPriority;
    due_date?: string | null;
  }) => void;
  updateTaskStatus: (id: string, status: TaskStatus) => void;
  updateTask: (id: string, patch: Partial<Task>) => void;
  removeTask: (id: string) => void;

  // memory
  addMemory: (input: Omit<MemoryItem, "id" | "workspace_id" | "updated_at">) => void;
  updateMemory: (id: string, patch: Partial<MemoryItem>) => void;
  removeMemory: (id: string) => void;

  // deliverables
  addDeliverable: (input: Omit<Deliverable, "id" | "workspace_id" | "created_at">) => Deliverable;
  removeDeliverable: (id: string) => void;

  // workspace
  updateWorkspace: (patch: Partial<Workspace>) => void;
  resetDemo: () => void;
}

const id = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `id_${Math.random().toString(36).slice(2, 10)}`;

export const useHenryStore = create<HenryState>()(
  persist(
    (set, get) => ({
      workspace: demoWorkspace,
      tasks: demoTasks,
      memory: demoMemory,
      deliverables: demoDeliverables,

      addTask: (input) =>
        set((s) => ({
          tasks: [
            {
              id: id(),
              workspace_id: s.workspace.id,
              title: input.title,
              description: input.description ?? null,
              status: "pending",
              priority: input.priority,
              due_date: input.due_date ?? null,
              notes: null,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            },
            ...s.tasks,
          ],
        })),

      updateTaskStatus: (id, status) =>
        set((s) => ({
          tasks: s.tasks.map((t) =>
            t.id === id
              ? { ...t, status, updated_at: new Date().toISOString() }
              : t,
          ),
        })),

      updateTask: (id, patch) =>
        set((s) => ({
          tasks: s.tasks.map((t) =>
            t.id === id
              ? { ...t, ...patch, updated_at: new Date().toISOString() }
              : t,
          ),
        })),

      removeTask: (taskId) =>
        set((s) => ({ tasks: s.tasks.filter((t) => t.id !== taskId) })),

      addMemory: (input) =>
        set((s) => ({
          memory: [
            {
              ...input,
              id: id(),
              workspace_id: s.workspace.id,
              updated_at: new Date().toISOString(),
            },
            ...s.memory,
          ],
        })),

      updateMemory: (id, patch) =>
        set((s) => ({
          memory: s.memory.map((m) =>
            m.id === id
              ? { ...m, ...patch, updated_at: new Date().toISOString() }
              : m,
          ),
        })),

      removeMemory: (memId) =>
        set((s) => ({ memory: s.memory.filter((m) => m.id !== memId) })),

      addDeliverable: (input) => {
        const next: Deliverable = {
          ...input,
          id: id(),
          workspace_id: get().workspace.id,
          created_at: new Date().toISOString(),
        };
        set((s) => ({ deliverables: [next, ...s.deliverables] }));
        return next;
      },

      removeDeliverable: (delId) =>
        set((s) => ({
          deliverables: s.deliverables.filter((d) => d.id !== delId),
        })),

      updateWorkspace: (patch) =>
        set((s) => ({ workspace: { ...s.workspace, ...patch } })),

      resetDemo: () =>
        set({
          workspace: demoWorkspace,
          tasks: demoTasks,
          memory: demoMemory,
          deliverables: demoDeliverables,
        }),
    }),
    {
      name: "henry-store-v1",
    },
  ),
);
