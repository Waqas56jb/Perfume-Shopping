export type Sender = 'bot' | 'user';

export type MessageKind =
  | 'text'
  | 'quick-replies'
  | 'product'
  | 'product-carousel'
  | 'typing';

export interface QuickReply {
  id: string;
  label: string;
  value: string;
}

export interface Product {
  id: string;
  name: string;
  tagline: string;
  family: string;
  notes: {
    tete: string[];
    coeur: string[];
    fond: string[];
  };
  gender: 'F' | 'H' | 'U';
  season: string[];
  intensity: number;
  sillage: number;
  longevity: number;
  price: number;
  oldPrice?: number;
  inStock: boolean;
  url: string;
}

export interface ChatMessage {
  id: string;
  sender: Sender;
  kind: MessageKind;
  text?: string;
  quickReplies?: QuickReply[];
  product?: Product;
  products?: Product[];
  timestamp: number;
}
