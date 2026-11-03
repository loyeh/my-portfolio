// Mirrors of the portfolio backend's DTOs (repo: My Portfolio Backend).
// Every backend response is wrapped in the KaiAvora StandardResponse envelope.

export type GenericResponseStatus =
  | "Failed"
  | "Success"
  | "ValidationError"
  | "Unauthorized"
  | "Forbidden"
  | "NotFound"
  | "TooManyRequests"
  | "ServiceUnavailable";

export type UserMessageType = "Error" | "Success" | "Info" | "OK" | "ValidationError";

export interface ResponseMetadata {
  status: GenericResponseStatus;
  requestId: string | null;
  correlationId: string | null;
  httpStatusCode: number | null;
}

export interface UserMessageItem {
  text: string | null;
  messageType: UserMessageType | null;
}

export interface StandardResponse<T> {
  metadata: ResponseMetadata;
  data: T | null;
  userMessageCollection: UserMessageItem[] | null;
}

export interface ContactMessageInput {
  name: string;
  email: string;
  message: string;
}

export interface ContactMessageCreated {
  id: string;
  createdAt: string;
}

export interface PostView {
  slug: string;
  viewCount: number;
}

export interface PostViewRecorded extends PostView {
  /** False when this visitor already viewed the post today. */
  counted: boolean;
}

export interface PostViewCollection {
  totalCount: number;
  postViewCollection: PostView[];
}
