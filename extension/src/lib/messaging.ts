// Message types & contracts (T018)

export enum MessageKind {
  EXTRACT_LATEST = 'EXTRACT_LATEST',
  LIST_ALL = 'LIST_ALL',
  LAST_OPENED = 'LAST_OPENED',
  PUSH_ITEMS = 'PUSH_ITEMS'
}

export interface ExtractLatestRequest {
  type: MessageKind.EXTRACT_LATEST;
}

export interface PreviewItem {
  url: string;
  kind: 'preview' | 'demo';
  ts: number;
}

export interface ExtractLatestResponse {
  ok: boolean;
  latest?: PreviewItem;
  error?: string;
}

export interface ListAllRequest {
  type: MessageKind.LIST_ALL;
}

export interface ListAllResponse {
  ok: boolean;
  items: PreviewItem[];
  error?: string;
}

export interface PushItemsRequest {
  type: MessageKind.PUSH_ITEMS;
  items: PreviewItem[];
}

export interface LastOpenedEvent {
  type: MessageKind.LAST_OPENED;
  item: PreviewItem;
}

export interface LastOpenedNotifyRequest {
  type: MessageKind.LAST_OPENED;
  item: PreviewItem;
}

export type OutgoingRequest = ExtractLatestRequest | ListAllRequest | PushItemsRequest | LastOpenedNotifyRequest;
export type IncomingResponse = ExtractLatestResponse | ListAllResponse | LastOpenedEvent;

export function isLastOpenedEvent(msg: IncomingResponse): msg is LastOpenedEvent {
  return (msg as LastOpenedEvent).type === MessageKind.LAST_OPENED;
}
