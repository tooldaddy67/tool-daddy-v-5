'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ListTodo, Trash2, Plus, Copy, Download, Edit, MoreVertical, Loader2, Calendar as CalendarIcon, ChevronDown, Tv2 } from 'lucide-react';
import { useFirebase, useCollection, useMemoFirebase, FirebaseClientProvider } from '@/firebase';
import { useSettings } from '@/components/settings-provider';
import { collection, query, orderBy, doc, serverTimestamp, writeBatch, Timestamp } from 'firebase/firestore';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { addDocumentNonBlocking, updateDocumentNonBlocking, deleteDocumentNonBlocking, setDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useHistory } from '@/hooks/use-history';

type Task = {
  id: string;
  text: string;
  completed: boolean;
  createdAt: any;
  dueDate?: Timestamp;
};

type TodoList = {
  id: string;
  name: string;
  createdAt: any;
};

const TODO_LISTS_STORAGE_KEY = 'tool-daddy-todo-lists';
const TASKS_STORAGE_KEY_PREFIX = 'tool-daddy-tasks-';

function combineDateAndTime(date: Date, time: string): Date {
  const [hours, minutes] = time.split(':').map(Number);
  const newDate = new Date(date);
  newDate.setHours(hours, minutes, 0, 0);
  return newDate;
}

function TodoListManager() {
  const { firestore, user, isUserLoading } = useFirebase();
  const { settings } = useSettings();
  const { addToHistory } = useHistory();
  const [newTaskText, setNewTaskText] = useState('');
  const [newTaskDueDate, setNewTaskDueDate] = useState<Date | undefined>();
  const [newTaskDueTime, setNewTaskDueTime] = useState('12:00');
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editingTaskText, setEditingTaskText] = useState('');
  const [editingTaskDueDate, setEditingTaskDueDate] = useState<Date | undefined>();
  const [editingTaskDueTime, setEditingTaskDueTime] = useState('12:00');
  const [activeListId, setActiveListId] = useState<string | null>(null);
  const [newListName, setNewListName] = useState('');
  const [isListDialogOpen, setIsListDialogOpen] = useState(false);
  const [editingPopoverOpen, setEditingPopoverOpen] = useState<{ [key: string]: boolean }>({});
  const { toast } = useToast();

  // Local storage state for guests
  const [localLists, setLocalLists] = useState<TodoList[]>([]);
  const [localTasks, setLocalTasks] = useState<{ [listId: string]: Task[] }>({});
  const [isLocalLoaded, setIsLocalLoaded] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const storedLists = localStorage.getItem(TODO_LISTS_STORAGE_KEY);
      if (storedLists) {
        const parsedLists = JSON.parse(storedLists);
        setLocalLists(parsedLists);

        const allTasks: { [listId: string]: Task[] } = {};
        parsedLists.forEach((list: TodoList) => {
          const storedTasks = localStorage.getItem(`${TASKS_STORAGE_KEY_PREFIX}${list.id}`);
          if (storedTasks) {
            allTasks[list.id] = JSON.parse(storedTasks);
          }
        });
        setLocalTasks(allTasks);
      }
    } catch (e) {
      console.error("Failed to load todos from localStorage", e);
    } finally {
      setIsLocalLoaded(true);
    }
  }, []);

  // Fetching Todo Lists from Firebase
  const listsCollectionPath = useMemo(() => {
    if (!user || user.isAnonymous || !firestore || !settings.dataPersistence) return null;
    return collection(firestore, 'users', user.uid, 'todolists');
  }, [firestore, user, settings.dataPersistence]);

  const listsQuery = useMemoFirebase(() => {
    if (!listsCollectionPath) return null;
    return query(listsCollectionPath, orderBy('createdAt', 'desc'));
  }, [listsCollectionPath]);

  const { data: cloudLists, isLoading: areCloudListsLoading } = useCollection<TodoList>(listsQuery);

  // Combine Lists
  const todoLists = useMemo(() => {
    if (user && !user.isAnonymous && settings.dataPersistence) return cloudLists || [];
    return localLists;
  }, [user, cloudLists, localLists, settings.dataPersistence]);

  // Sync to Cloud on login
  useEffect(() => {
    if (user && !user.isAnonymous && isLocalLoaded && localLists.length > 0 && listsCollectionPath && settings.dataPersistence) {
      const syncToCloud = async () => {
        try {
          const batch = writeBatch(firestore);
          for (const list of localLists) {
            const listDocRef = doc(listsCollectionPath, list.id);
            batch.set(listDocRef, {
              ...list,
              createdAt: serverTimestamp() // Ensure server timestamp on cloud
            });

            const tasks = localTasks[list.id] || [];
            const tasksCollection = collection(listDocRef, 'tasks');
            for (const task of tasks) {
              const taskDocRef = doc(tasksCollection, task.id);
              batch.set(taskDocRef, {
                ...task,
                createdAt: serverTimestamp()
              });
            }
          }
          await batch.commit();
          setLocalLists([]);
          setLocalTasks({});
          localStorage.removeItem(TODO_LISTS_STORAGE_KEY);
          localLists.forEach(l => localStorage.removeItem(`${TASKS_STORAGE_KEY_PREFIX}${l.id}`));
          toast({ title: "To-Do lists synced!", description: "Your guest lists have been moved to your account." });
        } catch (e) {
          console.error("Failed to sync todos to cloud", e);
        }
      };
      syncToCloud();
    }
  }, [user, isLocalLoaded, firestore, listsCollectionPath, localLists, localTasks, toast, settings.dataPersistence]);

  // Set initial active list
  useEffect(() => {
    if (!activeListId && todoLists && todoLists.length > 0) {
      setActiveListId(todoLists[0].id);
    }
  }, [todoLists, activeListId]);

  // Fetching Tasks for the active list from Firebase
  const tasksCollectionPath = useMemo(() => {
    if (!user || user.isAnonymous || !firestore || !activeListId || !settings.dataPersistence) return null;
    return collection(firestore, 'users', user.uid, 'todolists', activeListId, 'tasks');
  }, [firestore, user, activeListId, settings.dataPersistence]);

  const tasksQuery = useMemoFirebase(() => {
    if (!tasksCollectionPath) return null;
    return query(tasksCollectionPath, orderBy('createdAt', 'desc'));
  }, [tasksCollectionPath]);

  const { data: cloudTasks, isLoading: areCloudTasksLoading } = useCollection<Task>(tasksQuery);

  // Combine Tasks
  const tasks = useMemo(() => {
    if (user && !user.isAnonymous && settings.dataPersistence) return cloudTasks || [];
    return localTasks[activeListId || ''] || [];
  }, [user, cloudTasks, localTasks, activeListId, settings.dataPersistence]);

  const areTasksLoading = (user && !user.isAnonymous && settings.dataPersistence) ? areCloudTasksLoading : !isLocalLoaded;
  const areListsLoading = (user && !user.isAnonymous && settings.dataPersistence) ? areCloudListsLoading : !isLocalLoaded;

  // List Management
  const handleAddList = async () => {
    if (!newListName.trim()) return;

    const newListId = crypto.randomUUID();
    const newList: TodoList = {
      id: newListId,
      name: newListName,
      createdAt: new Date().toISOString()
    };

    if (listsCollectionPath) {
      try {
        const listDocRef = doc(listsCollectionPath, newListId);
        const { name } = newList;

        await setDocumentNonBlocking(listDocRef, {
          name,
          createdAt: serverTimestamp()
        }, { merge: true });

        toast({ title: "New list created!" });
      } catch (e) {
        toast({ title: "Error creating list", variant: "destructive" });
        return;
      }
    } else {
      const updatedLists = [newList, ...localLists];
      setLocalLists(updatedLists);
      localStorage.setItem(TODO_LISTS_STORAGE_KEY, JSON.stringify(updatedLists));
      toast({ title: "List saved locally" });
    }

    addToHistory({
      tool: 'To-Do List',
      data: { details: `Created new list: ${newListName}` }
    });

    setActiveListId(newListId);
    setNewListName('');
    setIsListDialogOpen(false);
  };

  const handleDeleteList = useCallback(async (listId: string) => {
    if (listsCollectionPath && user && !user.isAnonymous && settings.dataPersistence) {
      const listDocRef = doc(firestore, 'users', user.uid, 'todolists', listId);
      await deleteDocumentNonBlocking(listDocRef);
    } else {
      const updatedLists = localLists.filter(l => l.id !== listId);
      setLocalLists(updatedLists);
      localStorage.setItem(TODO_LISTS_STORAGE_KEY, JSON.stringify(updatedLists));
      localStorage.removeItem(`${TASKS_STORAGE_KEY_PREFIX}${listId}`);

      const updatedLocalTasks = { ...localTasks };
      delete updatedLocalTasks[listId];
      setLocalTasks(updatedLocalTasks);
    }

    toast({ title: 'List deleted.' });

    if (activeListId === listId) {
      const newActiveList = todoLists?.find(l => l.id !== listId);
      setActiveListId(newActiveList ? newActiveList.id : null);
    }
  }, [firestore, user, listsCollectionPath, localLists, localTasks, activeListId, todoLists, toast]);

  // Task Management
  const handleAddTask = () => {
    if (!activeListId || !newTaskText.trim()) return;

    let finalDueDate: Date | null = null;
    if (newTaskDueDate) {
      finalDueDate = combineDateAndTime(newTaskDueDate, newTaskDueTime);
    }

    const newTask: Task = {
      id: crypto.randomUUID(),
      text: newTaskText,
      completed: false,
      createdAt: new Date().toISOString(),
      dueDate: finalDueDate ? Timestamp.fromDate(finalDueDate) : undefined,
    };

    if (tasksCollectionPath) {
      const taskDocRef = doc(tasksCollectionPath, newTask.id);
      const { text, completed, dueDate } = newTask; // Exclude ID

      setDocumentNonBlocking(taskDocRef, {
        text,
        completed,
        createdAt: serverTimestamp(),
        // Only include dueDate if it exists
        ...(dueDate ? { dueDate } : {})
      }, { merge: true });
    } else {
      const currentTasks = localTasks[activeListId] || [];
      const updatedTasks = [newTask, ...currentTasks];
      const newLocalTasks = { ...localTasks, [activeListId]: updatedTasks };
      setLocalTasks(newLocalTasks);
      localStorage.setItem(`${TASKS_STORAGE_KEY_PREFIX}${activeListId}`, JSON.stringify(updatedTasks));
    }

    addToHistory({
      tool: 'To-Do List',
      data: { details: `Added task: ${newTaskText}` }
    });

    setNewTaskText('');
    setNewTaskDueDate(undefined);
    setNewTaskDueTime('12:00');
  };

  const handleToggleTask = (task: Task) => {
    if (tasksCollectionPath) {
      const taskDocRef = doc(tasksCollectionPath, task.id);
      updateDocumentNonBlocking(taskDocRef, { completed: !task.completed });
    } else if (activeListId) {
      const currentTasks = localTasks[activeListId] || [];
      const updatedTasks = currentTasks.map(t =>
        t.id === task.id ? { ...t, completed: !t.completed } : t
      );
      const newLocalTasks = { ...localTasks, [activeListId]: updatedTasks };
      setLocalTasks(newLocalTasks);
      localStorage.setItem(`${TASKS_STORAGE_KEY_PREFIX}${activeListId}`, JSON.stringify(updatedTasks));
    }
  };

  const handleDeleteTask = (taskId: string) => {
    if (tasksCollectionPath) {
      const taskDocRef = doc(tasksCollectionPath, taskId);
      deleteDocumentNonBlocking(taskDocRef);
    } else if (activeListId) {
      const currentTasks = localTasks[activeListId] || [];
      const updatedTasks = currentTasks.filter(t => t.id !== taskId);
      const newLocalTasks = { ...localTasks, [activeListId]: updatedTasks };
      setLocalTasks(newLocalTasks);
      localStorage.setItem(`${TASKS_STORAGE_KEY_PREFIX}${activeListId}`, JSON.stringify(updatedTasks));
    }
  };

  const handleCopyTask = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Task text copied to clipboard!" });
  }

  const handleStartEditing = (task: Task) => {
    setEditingTaskId(task.id);
    setEditingTaskText(task.text);
    if (task.dueDate) {
      const date = task.dueDate.toDate();
      setEditingTaskDueDate(date);
      setEditingTaskDueTime(format(date, 'HH:mm'));
    } else {
      setEditingTaskDueDate(undefined);
      setEditingTaskDueTime('12:00');
    }
  };

  const handleCancelEditing = () => {
    setEditingTaskId(null);
    setEditingTaskText('');
    setEditingTaskDueDate(undefined);
    setEditingTaskDueTime('12:00');
  };

  const handleSaveEditing = (taskId: string) => {
    if (!user || !firestore || !activeListId || !editingTaskText.trim()) return;

    let finalDueDate: Date | null = null;
    if (editingTaskDueDate) {
      finalDueDate = combineDateAndTime(editingTaskDueDate, editingTaskDueTime);
    }

    const taskDocRef = doc(firestore, 'users', user.uid, 'todolists', activeListId, 'tasks', taskId);
    updateDocumentNonBlocking(taskDocRef, {
      text: editingTaskText,
      dueDate: finalDueDate ? Timestamp.fromDate(finalDueDate) : null,
    });
    handleCancelEditing();
    setEditingPopoverOpen(prev => ({ ...prev, [taskId]: false }));
  };

  const downloadTodoList = () => {
    if (!tasks || tasks.length === 0) {
      toast({ title: 'This list is empty!', variant: 'destructive' });
      return;
    };

    const fileContent = tasks
      .map(task => {
        const due = task.dueDate ? ` (Due: ${format(task.dueDate.toDate(), 'PPP p')})` : '';
        return `${task.completed ? '[x]' : '[ ]'} ${task.text}${due}`
      })
      .join('\n');

    const blob = new Blob([fileContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${todoLists?.find(l => l.id === activeListId)?.name || 'todo-list'}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast({ title: 'To-Do List Downloaded!' });
  };

  const deleteAllTasks = useCallback(async () => {
    if (!firestore || !user || !tasks || tasks.length === 0 || !activeListId) return;

    const batch = writeBatch(firestore);
    tasks.forEach(task => {
      const taskDocRef = doc(firestore, 'users', user.uid, 'todolists', activeListId, 'tasks', task.id);
      batch.delete(taskDocRef);
    });

    try {
      await batch.commit();
      toast({ title: 'All tasks on this list deleted.' });
    } catch (error) {
      console.error("Error deleting all tasks:", error);
      toast({ title: 'Failed to delete all tasks.', variant: 'destructive' });
    }
  }, [firestore, user, tasks, toast, activeListId]);

  const isLoading = isUserLoading || areListsLoading;
  const activeListName = useMemo(() => todoLists?.find(l => l.id === activeListId)?.name, [todoLists, activeListId]);

  return (
    <Card className="w-full h-full flex flex-col bg-card/50 backdrop-blur-lg border-border/20">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <ListTodo className="h-8 w-8 hidden sm:block" />
            <div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild disabled={isLoading || !todoLists || todoLists.length === 0}>
                  <Button variant="ghost" className="text-2xl font-bold p-0 h-auto font-headline">
                    {isLoading ? <Skeleton className="h-8 w-40" /> : activeListName || "To-Do List"}
                    <ChevronDown className="w-5 h-5 ml-2 mt-1" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  <DropdownMenuLabel>My Lists</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuRadioGroup value={activeListId || ''} onValueChange={setActiveListId}>
                    {todoLists && todoLists.map(list => (
                      <DropdownMenuRadioItem key={list.id} value={list.id}>
                        {list.name}
                      </DropdownMenuRadioItem>
                    ))}
                  </DropdownMenuRadioGroup>
                </DropdownMenuContent>
              </DropdownMenu>
              <CardDescription>
                {todoLists && todoLists.length > 0 ? `${tasks?.length || 0} tasks on this list.` : `Create a list to get started.`}
              </CardDescription>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Dialog open={isListDialogOpen} onOpenChange={setIsListDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="purple" size="sm" onClick={() => setNewListName('')}><Plus className="mr-2 h-4 w-4" /> New List</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create a New To-Do List</DialogTitle>
                </DialogHeader>
                <div className="py-4 space-y-2">
                  <label htmlFor="list-name" className="text-sm font-medium">List Name</label>
                  <Input id="list-name" value={newListName} onChange={(e) => setNewListName(e.target.value)} placeholder="e.g., Work, Groceries..." onKeyDown={(e) => { if (e.key === 'Enter') handleAddList() }} />
                </div>
                <DialogFooter>
                  <DialogClose asChild>
                    <Button type="button" variant="secondary">Cancel</Button>
                  </DialogClose>
                  <Button onClick={handleAddList} disabled={!newListName.trim()}>Create List</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" disabled={!activeListId}><MoreVertical /></Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>List Actions</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={downloadTodoList} disabled={!tasks || tasks.length === 0}>
                  <Download className="mr-2 h-4 w-4" /> Download List (.txt)
                </DropdownMenuItem>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <DropdownMenuItem onSelect={(e) => e.preventDefault()} disabled={!tasks || tasks.length === 0} className="text-red-500 focus:bg-red-500/10 focus:text-red-600">
                      <Trash2 className="mr-2 h-4 w-4" /> Clear All Tasks
                    </DropdownMenuItem>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will permanently delete all {tasks?.length} tasks from the "{activeListName}" list. This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={deleteAllTasks}>Continue</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-red-500 focus:bg-red-500/10 focus:text-red-600">
                      <Trash2 className="mr-2 h-4 w-4" /> Delete List
                    </DropdownMenuItem>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete "{activeListName}"?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will permanently delete this list and all its tasks. This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={() => activeListId && handleDeleteList(activeListId)}>Delete List</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col gap-4">
        <div className="flex gap-2">
          <Input
            placeholder="Add a new task..."
            value={newTaskText}
            onChange={(e) => setNewTaskText(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') handleAddTask() }}
            disabled={isLoading || !activeListId}
          />
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="icon" disabled={isLoading || !activeListId}>
                <CalendarIcon className={cn("h-4 w-4", newTaskDueDate && "text-purple-500")} />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar mode="single" selected={newTaskDueDate} onSelect={setNewTaskDueDate} initialFocus />
              {newTaskDueDate && (
                <div className="p-3 border-t">
                  <Input
                    type="time"
                    value={newTaskDueTime}
                    onChange={(e) => setNewTaskDueTime(e.target.value)}
                    disabled={isLoading || !activeListId}
                  />
                </div>
              )}
            </PopoverContent>
          </Popover>
          <Button onClick={handleAddTask} disabled={!newTaskText.trim() || isLoading || !activeListId} variant="purple">
            <Plus />
          </Button>
        </div>

        <div className="relative flex-1">
          <ScrollArea className="absolute inset-0 pr-4">
            {(isLoading || areTasksLoading) && !tasks && (
              <div className="space-y-2 pt-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            )}

            {!isLoading && !user && (
              <div className="text-center text-muted-foreground py-8">
                <p>Connecting to your lists...</p>
              </div>
            )}

            {!isLoading && user && todoLists?.length === 0 && (
              <div className="text-center text-muted-foreground py-8">
                <p>You don't have any to-do lists yet.</p>
                <Button variant="link" onClick={() => setIsListDialogOpen(true)}>Create one to get started!</Button>
              </div>
            )}

            {!isLoading && user && todoLists && todoLists.length > 0 && !activeListId && (
              <div className="text-center text-muted-foreground py-8">
                <Loader2 className="animate-spin mx-auto mb-2" />
                <p>Select a list to view tasks</p>
              </div>
            )}

            {activeListId && tasks && tasks.length === 0 && !areTasksLoading && (
              <div className="text-center text-muted-foreground py-8">
                <p>This list is empty. Add a task to get started!</p>
              </div>
            )}

            {activeListId && tasks && (
              <ul className="space-y-2">
                {tasks.map(task => (
                  <li key={task.id} className="flex items-center gap-3 p-2 rounded-md bg-background/50 hover:bg-muted/50 transition-colors group">
                    <Checkbox
                      id={`task-${task.id}`}
                      checked={task.completed}
                      onCheckedChange={() => handleToggleTask(task)}
                      disabled={editingTaskId === task.id}
                    />
                    {editingTaskId === task.id ? (
                      <div className="flex-1 flex gap-2">
                        <Input
                          value={editingTaskText}
                          onChange={(e) => setEditingTaskText(e.target.value)}
                          onBlur={() => handleSaveEditing(task.id)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSaveEditing(task.id);
                            if (e.key === 'Escape') handleCancelEditing();
                          }}
                          autoFocus
                          className="h-8"
                        />
                        <Popover open={editingPopoverOpen[task.id]} onOpenChange={(isOpen) => setEditingPopoverOpen(p => ({ ...p, [task.id]: isOpen }))}>
                          <PopoverTrigger asChild>
                            <Button variant="outline" size="icon" className="h-8 w-8">
                              <CalendarIcon className={cn("h-4 w-4", editingTaskDueDate && "text-purple-500")} />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0">
                            <Calendar
                              mode="single"
                              selected={editingTaskDueDate}
                              onSelect={setEditingTaskDueDate}
                              initialFocus
                            />
                            {editingTaskDueDate && (
                              <div className="p-3 border-t">
                                <Input
                                  type="time"
                                  value={editingTaskDueTime}
                                  onChange={(e) => setEditingTaskDueTime(e.target.value)}
                                  className="w-full"
                                />
                              </div>
                            )}
                          </PopoverContent>
                        </Popover>
                      </div>
                    ) : (
                      <div className="flex-1 flex flex-col sm:flex-row sm:items-center sm:justify-between">
                        <label
                          htmlFor={`task-${task.id}`}
                          className={cn("cursor-pointer", task.completed && "line-through text-muted-foreground")}
                          onDoubleClick={() => handleStartEditing(task)}
                        >
                          {task.text}
                        </label>
                        {task.dueDate && (
                          <span className={cn(
                            "text-xs font-medium px-2 py-1 rounded-full",
                            task.completed ? "text-muted-foreground" : "text-purple-600 bg-purple-500/10",
                            task.dueDate.toDate() < new Date() && !task.completed ? "text-red-600 bg-red-500/10" : ""
                          )}>
                            {format(task.dueDate.toDate(), 'PPP p')}
                          </span>
                        )}
                      </div>
                    )}
                    <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary" onClick={() => handleCopyTask(task.text)} title="Copy Task">
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary" onClick={() => handleStartEditing(task)} title="Edit Task">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => handleDeleteTask(task.id)} title="Delete Task">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </ScrollArea>
        </div>
      </CardContent>
    </Card>
  );
}

export default function TodoList() {
  return (
    <div className="w-full min-h-full p-4 flex justify-center">
      {/* Main Content */}
      <main className="w-full h-full flex flex-col gap-6 max-w-4xl">
        <TodoListManager />

        {/* Horizontal Ad */}
        <div className="bg-muted/50 rounded-lg p-4 h-24 flex items-center justify-center">
          <div className="flex items-center justify-center gap-4 text-muted-foreground">
            <Tv2 className="w-8 h-8" />
            <div>
              <h3 className="font-semibold text-foreground">Your Ad Here</h3>
              <p className="text-xs">
                This is a placeholder for a horizontal advertisement.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
