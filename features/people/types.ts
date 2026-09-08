export type PeoplePlatform =
  | "LinkedIn"
  | "X"
  | "Instagram"
  | "YouTube"
  | "Other";

export type DiscoverStatus =
  | "To review"
  | "Following"
  | "Passed"
  | "Maybe later";

export type RelationshipType =
  | "Colleague"
  | "Friend"
  | "Met in person"
  | "Online"
  | "Other";

export interface DiscoverPerson {
  id?: number;
  name: string;
  platform: PeoplePlatform;
  profileUrl: string;
  whySaved: string;
  status: DiscoverStatus;
  notes: string;
  reviewedAt: number | null;
  createdAt: number;
  updatedAt: number;
}

export interface NetworkPerson {
  id?: number;
  name: string;
  platform: PeoplePlatform;
  profileUrl: string;
  relationshipType: RelationshipType;
  howWeKnow: string;
  metAt: string;
  notes: string;
  createdAt: number;
  updatedAt: number;
}

export type DiscoverPersonInput = Omit<
  DiscoverPerson,
  "id" | "createdAt" | "updatedAt" | "reviewedAt"
>;

export type NetworkPersonInput = Omit<
  NetworkPerson,
  "id" | "createdAt" | "updatedAt"
>;
