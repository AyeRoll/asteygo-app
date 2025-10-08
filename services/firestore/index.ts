import {
    addDoc,
    collection,
    deleteDoc,
    doc,
    getDoc,
    getDocs,
    onSnapshot,
    orderBy,
    query,
    serverTimestamp,
    setDoc,
    updateDoc,
    where,
} from 'firebase/firestore';
import { db } from '../../config/firebase';
import type { Budget, Category, EventDoc, Expense, Group, ItineraryItem, MapLocation, Person } from './types';

export const col = {
  categories: () => collection(db, 'categories'),
  events: () => collection(db, 'events'),
  mapLocations: () => collection(db, 'map_locations'),
  groups: () => collection(db, 'groups'),
  people: () => collection(db, 'people'),
  itineraries: () => collection(db, 'group_itineraries'),
  budgets: () => collection(db, 'budgets'),
  expenses: () => collection(db, 'expenses'),
};

// Generic helpers
export async function createDoc<T extends object>(pathCol: ReturnType<typeof collection>, data: T & { id?: string }) {
  const { id, ...rest } = data as any;
  if (id) {
    await setDoc(doc(pathCol, id), { ...rest, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
    return id;
  } else {
    const ref = await addDoc(pathCol, { ...rest, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
    return ref.id;
  }
}

export async function readDoc<T>(pathCol: ReturnType<typeof collection>, id: string): Promise<(T & { id: string }) | null> {
  const snap = await getDoc(doc(pathCol, id));
  if (!snap.exists()) return null;
  return { id: snap.id, ...(snap.data() as any) };
}

export async function updateDocById<T extends object>(pathCol: ReturnType<typeof collection>, id: string, patch: Partial<T>) {
  await updateDoc(doc(pathCol, id), { ...patch, updatedAt: serverTimestamp() });
}

export async function deleteDocById(pathCol: ReturnType<typeof collection>, id: string) {
  await deleteDoc(doc(pathCol, id));
}

// Domain-specific shortcuts
export const Categories = {
  create: (cat: Category) => createDoc<Category>(col.categories(), cat),
  list: async () => (await getDocs(query(col.categories(), orderBy('name', 'asc')))).docs.map((d) => ({ id: d.id, ...(d.data() as any) } as Category & { id: string })),
};

export const Events = {
  create: (e: EventDoc) => createDoc<EventDoc>(col.events(), e),
  listByCategory: async (category: string) =>
    (await getDocs(query(col.events(), where('category', '==', category), orderBy('createdAt', 'desc')))).docs.map((d) => ({ id: d.id, ...(d.data() as any) } as EventDoc & { id: string })),
};

export const MapLocations = {
  create: (m: MapLocation) => createDoc<MapLocation>(col.mapLocations(), m),
};

export const Groups = {
  create: (g: Group) => createDoc<Group>(col.groups(), g),
  get: (id: string) => readDoc<Group>(col.groups(), id),
};

export const People = {
  create: (p: Person) => createDoc<Person>(col.people(), p),
};

export const Itineraries = {
  addItem: (item: ItineraryItem) => createDoc<ItineraryItem>(col.itineraries(), item),
  watchByGroup: (groupId: string, cb: (items: (ItineraryItem & { id: string })[]) => void) =>
    onSnapshot(query(col.itineraries(), where('group_id', '==', groupId)), (snap) => {
      cb(snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })) as any);
    }),
};

export const Budgets = {
  create: (b: Budget) => createDoc<Budget>(col.budgets(), b),
};

export const Expenses = {
  create: (e: Expense) => createDoc<Expense>(col.expenses(), e),
  listByGroup: async (groupId: string) =>
    (await getDocs(query(col.expenses(), where('group_id', '==', groupId), orderBy('createdAt', 'desc')))).docs.map((d) => ({ id: d.id, ...(d.data() as any) } as Expense & { id: string })),
};
