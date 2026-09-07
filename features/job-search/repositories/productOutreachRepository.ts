import {
  normalizeProductOutreachHandle,
  isProductOutreachChannel,
} from "../constants";
import { getDB } from "../db";
import { isTimestampInWeek } from "../lib/dateUtils";
import type {
  ProductOutreachContactWithInteractions,
  ProductOutreachInteraction,
} from "../types";

export type ProductOutreachInteractionInput = Omit<
  ProductOutreachInteraction,
  "id" | "contactId" | "createdAt"
>;

function normalizeInteractionInput(
  data: ProductOutreachInteractionInput,
): ProductOutreachInteractionInput {
  const channel = isProductOutreachChannel(data.channel)
    ? data.channel
    : "Instagram";

  return {
    channel,
    handle: normalizeProductOutreachHandle(channel, data.handle),
    context: data.context.trim(),
  };
}

function groupContactsWithInteractions(
  contacts: { id?: number; label: string; createdAt: number }[],
  interactions: ProductOutreachInteraction[],
): ProductOutreachContactWithInteractions[] {
  const byContactId = new Map<number, ProductOutreachInteraction[]>();

  for (const interaction of interactions) {
    const list = byContactId.get(interaction.contactId) ?? [];
    list.push(interaction);
    byContactId.set(interaction.contactId, list);
  }

  const grouped: ProductOutreachContactWithInteractions[] = contacts
    .filter((contact): contact is typeof contact & { id: number } =>
      Boolean(contact.id),
    )
    .map((contact) => {
      const contactInteractions = (byContactId.get(contact.id) ?? []).sort(
        (a, b) => b.createdAt - a.createdAt,
      );

      return {
        ...contact,
        id: contact.id,
        interactions: contactInteractions,
      };
    })
    .filter((contact) => contact.interactions.length > 0);

  grouped.sort((a, b) => {
    const aLatest = a.interactions[0]?.createdAt ?? a.createdAt;
    const bLatest = b.interactions[0]?.createdAt ?? b.createdAt;
    return bLatest - aLatest;
  });

  return grouped;
}

export async function getAllContactsWithInteractions(): Promise<
  ProductOutreachContactWithInteractions[]
> {
  const database = getDB();
  const [contacts, interactions] = await Promise.all([
    database.productOutreachContacts.toArray(),
    database.productOutreachInteractions.toArray(),
  ]);

  return groupContactsWithInteractions(contacts, interactions);
}

export async function createContactWithInteraction(
  label: string,
  interaction: ProductOutreachInteractionInput,
): Promise<number> {
  const database = getDB();
  const normalized = normalizeInteractionInput(interaction);
  const now = Date.now();

  return database.transaction(
    "rw",
    [database.productOutreachContacts, database.productOutreachInteractions],
    async () => {
      const contactId = (await database.productOutreachContacts.add({
        label: label.trim(),
        createdAt: now,
      })) as number;

      await database.productOutreachInteractions.add({
        contactId,
        ...normalized,
        createdAt: now,
      });

      return contactId;
    },
  );
}

export async function addInteraction(
  contactId: number,
  interaction: ProductOutreachInteractionInput,
): Promise<number> {
  const database = getDB();
  const contact = await database.productOutreachContacts.get(contactId);
  if (!contact) {
    throw new Error("Contact not found");
  }

  const normalized = normalizeInteractionInput(interaction);
  const id = await database.productOutreachInteractions.add({
    contactId,
    ...normalized,
    createdAt: Date.now(),
  });

  return id as number;
}

export async function updateInteraction(
  id: number,
  data: Partial<ProductOutreachInteractionInput>,
): Promise<void> {
  const database = getDB();
  const existing = await database.productOutreachInteractions.get(id);
  if (!existing) {
    throw new Error("Interaction not found");
  }

  const channel = data.channel ?? existing.channel;
  const handle =
    data.handle !== undefined
      ? normalizeProductOutreachHandle(channel, data.handle)
      : existing.handle;
  const context =
    data.context !== undefined ? data.context.trim() : existing.context;

  await database.productOutreachInteractions.update(id, {
    channel,
    handle,
    context,
  });
}

export async function deleteInteraction(id: number): Promise<void> {
  const database = getDB();
  const interaction = await database.productOutreachInteractions.get(id);
  if (!interaction) return;

  await database.transaction(
    "rw",
    [database.productOutreachContacts, database.productOutreachInteractions],
    async () => {
      await database.productOutreachInteractions.delete(id);

      const remaining = await database.productOutreachInteractions
        .where("contactId")
        .equals(interaction.contactId)
        .count();

      if (remaining === 0) {
        await database.productOutreachContacts.delete(interaction.contactId);
      }
    },
  );
}

export async function deleteContact(id: number): Promise<void> {
  const database = getDB();

  await database.transaction(
    "rw",
    [database.productOutreachContacts, database.productOutreachInteractions],
    async () => {
      await database.productOutreachInteractions
        .where("contactId")
        .equals(id)
        .delete();
      await database.productOutreachContacts.delete(id);
    },
  );
}

export async function updateContactLabel(
  id: number,
  label: string,
): Promise<void> {
  const database = getDB();
  await database.productOutreachContacts.update(id, {
    label: label.trim(),
  });
}

export function matchesProductOutreachQuery(
  contact: ProductOutreachContactWithInteractions,
  query: string,
): boolean {
  const lower = query.toLowerCase().trim();
  if (!lower) return true;

  if (contact.label.toLowerCase().includes(lower)) return true;

  return contact.interactions.some(
    (interaction) =>
      interaction.handle.toLowerCase().includes(lower) ||
      interaction.context.toLowerCase().includes(lower) ||
      interaction.channel.toLowerCase().includes(lower),
  );
}

export function contactHasInteractionInWeek(
  contact: ProductOutreachContactWithInteractions,
  weekStart: string,
): boolean {
  return contact.interactions.some((interaction) =>
    isTimestampInWeek(interaction.createdAt, weekStart),
  );
}
