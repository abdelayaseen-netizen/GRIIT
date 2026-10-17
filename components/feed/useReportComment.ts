/**
 * Build 90 07.3: report a comment from either comment list. The comment leaves the
 * list at once (query cache + the phone's hidden set), then the report is filed with
 * reports.reportComment. If filing fails the comment comes back and the notice says so.
 */
import { useCallback, useEffect, useRef, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { trpcMutate } from "@/lib/trpc";
import { TRPC } from "@/lib/trpc-paths";
import { captureError } from "@/lib/sentry";
import { hideComment, unhideComment } from "@/lib/hidden-comments";
import { COMMENT_REPORTED, COMMENT_REPORT_FAILED } from "@/lib/comment-report";

const NOTICE_MS = 2500;

export function useReportComment(eventId: string) {
  const queryClient = useQueryClient();
  const [notice, setNotice] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  const flash = useCallback((text: string) => {
    setNotice(text);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setNotice(null), NOTICE_MS);
  }, []);

  const mutation = useMutation({
    mutationFn: async (commentId: string) => {
      await hideComment(commentId);
      queryClient.setQueryData<{ id: string }[] | undefined>(["feed", "comments", eventId], (rows) =>
        rows ? rows.filter((row) => row.id !== commentId) : rows,
      );
      return trpcMutate<{ alreadyReported?: boolean }>(TRPC.reports.reportComment, { commentId, reason: "other" });
    },
    onSuccess: async () => {
      flash(COMMENT_REPORTED);
      await queryClient.invalidateQueries({ queryKey: ["feedCommentPreview", eventId] });
    },
    onError: async (e, commentId) => {
      captureError(e, "ReportComment");
      await unhideComment(commentId);
      await queryClient.invalidateQueries({ queryKey: ["feed", "comments", eventId] });
      flash(COMMENT_REPORT_FAILED);
    },
  });

  return { report: mutation.mutate, pending: mutation.isPending, notice };
}
