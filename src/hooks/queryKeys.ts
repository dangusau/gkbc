export const memberKeys = {
  all: ['members'] as const,
  filtered: (search: string, businessType: string, marketArea: string) =>
    [...memberKeys.all, { search, businessType, marketArea }] as const,
};

export const connectionKeys = {
  all: ['connections'] as const,
  received: () => [...connectionKeys.all, 'received'] as const,
  sent: () => [...connectionKeys.all, 'sent'] as const,
  friends: () => [...connectionKeys.all, 'friends'] as const,
};

export const feedKeys = {
  all: ['feed'] as const,
  lists: () => [...feedKeys.all, 'list'] as const,
  list: (filters: { search?: string } = {}) => [...feedKeys.lists(), filters] as const,
  details: () => [...feedKeys.all, 'detail'] as const,
  detail: (id: string) => [...feedKeys.details(), id] as const,
  comments: (postId: string) => ['comments', postId] as const,
};

export const marketplaceKeys = {
  all: ['marketplace'] as const,
  listings: (filters?: any) => 
    [...marketplaceKeys.all, 'listings', filters] as const,
  listing: (id: string) => [...marketplaceKeys.all, 'listing', id] as const,
  myListings: (userId: string) => [...marketplaceKeys.all, 'myListings', userId] as const,
  favorites: (userId: string) => [...marketplaceKeys.all, 'favorites', userId] as const,
  reviews: (listingId: string) => [...marketplaceKeys.all, 'reviews', listingId] as const,
};

export const jobKeys = {
  all: ['jobs'] as const,
  lists: () => [...jobKeys.all, 'list'] as const,
  list: (filters: any) => [...jobKeys.lists(), filters] as const,
};

export const eventKeys = {
  all: ['events'] as const,
  lists: () => [...eventKeys.all, 'list'] as const,
  list: (filters: any) => [...eventKeys.lists(), filters] as const,
};

export const businessKeys = {
  all: ['businesses'] as const,
  lists: () => [...businessKeys.all, 'list'] as const,
  list: (filters: Record<string, any>) => [...businessKeys.lists(), filters] as const,
  details: () => [...businessKeys.all, 'detail'] as const,
  detail: (id: string) => [...businessKeys.details(), id] as const,
  categories: () => [...businessKeys.all, 'categories'] as const,
  locationCounts: () => [...businessKeys.all, 'locationCounts'] as const,
  userStatus: () => ['userVerificationStatus'] as const,
};

export const profileKeys = {
  all: ['profiles'] as const,
  detail: (userId: string) => [...profileKeys.all, userId] as const,
  posts: (userId: string) => [...profileKeys.all, userId, 'posts'] as const,
};


export const messagingKeys = {
  all: ['messaging'] as const,
  conversations: (userId?: string, context?: string) =>
    [...messagingKeys.all, 'conversations', userId, context] as const,
  conversation: (conversationId: string) =>
    [...messagingKeys.all, 'conversation', conversationId] as const,
  messages: (conversationId: string) =>
    [...messagingKeys.conversation(conversationId), 'messages'] as const,
  unreadCounts: (userId?: string) =>
    [...messagingKeys.all, 'unreadCounts', userId] as const,
};

export const supportKeys = {
  all: ['support'] as const,
  tickets: () => [...supportKeys.all, 'tickets'] as const,
  ticket: (id: string) => [...supportKeys.tickets(), id] as const,
  replies: (ticketId: string) => [...supportKeys.ticket(ticketId), 'replies'] as const,
};