interface basePurcaseInfo {
  username: string;
  userId: string;
  price: number;
}

// Purchase Event - Published to Kafka
export interface PurchaseEvent extends basePurcaseInfo {
  timestamp: number;
  id: string;
}

// API Request/Response types
export interface BuyRequest extends basePurcaseInfo {
  time: Date
}

export interface AcceptedBuyRequest extends BuyRequest {
  id: string
}

export interface BuyResponse {
  id: string
}

export type GetPurchasesResponse = PurchaseEvent[]