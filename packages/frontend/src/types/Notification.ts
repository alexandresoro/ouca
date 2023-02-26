export type AlertType = "info" | "success" | "warning" | "error";

export type Notification = {
  id: number;
  type?: AlertType;
  message: string;
};
