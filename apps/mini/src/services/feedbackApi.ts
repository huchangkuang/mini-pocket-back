import type { ApiSubmitFeedbackResult, FeedbackType } from "@/types/api";
import { post } from "@/utils/request";

export type SubmitFeedbackPayload = {
  type: FeedbackType;
  content: string;
  contact?: string;
  imageUrls?: string[];
};

export function submitFeedback(data: SubmitFeedbackPayload): Promise<ApiSubmitFeedbackResult> {
  return post<ApiSubmitFeedbackResult>("/feedback", data);
}
