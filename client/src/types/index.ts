//Enums
export type Status = "open" | "in_progress" | "resolved";
export type Priority = "low" | "medium" | "high";
export type TicketType = "bug" | "feature" | "task";
export type UserRole = "agent" | "admin";

export type ActivityType =
  | "status_changed"
  | "priority_changed"
  | "assignee_changed"
  | "comment_added";

export type NotificationType =
  | "assigned_to_you"
  | "comment_on_your_ticket"
  | "status_changed";

//Core
export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
}

export interface Ticket {
  id: number;
  title: string;
  description: string;
  status: Status;
  priority: Priority;
  type: TicketType;
  reporterId: number;
  assigneeId?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Comment {
  id: number;
  ticketId: number;
  authorId: number;
  body: string;
  createdAt: string;
}

export interface ActivityLog {
  id: number;
  ticketNumber: number;
  userId: number;
  type: ActivityType;
  payload: ActivityPayload;
  createdAt: string;
}

export interface Notification {
  id: number;
  userId: number;
  ticketId: number;
  type: NotificationType;
  read: boolean;
  createdAt: string;
}

//DU
type StatusChangedPayload = {
  type: "status_changed";
  from: Status;
  to: Status;
};
type PriorityChangedPayload = {
  type: "priority_changed";
  from: Priority;
  to: Priority;
};
type AssigneeChangedPayload = {
  type: "assignee_changed";
  from: number | null;
  to: number | null;
};
type CommentAddedPayload = { type: "comment_added"; commentId: number };

export type ActivityPayload =
  | StatusChangedPayload
  | PriorityChangedPayload
  | AssigneeChangedPayload
  | CommentAddedPayload;
