import React from "react";
import { TaskCapture } from "../TaskCapture";

type Props = {
  challengeName: string;
  taskName: string;
  currentDay: number;
  onCancel: () => void;
  onCaptured: (uri: string, at: string) => void;
};

export function CaptureStep({ challengeName, taskName, currentDay, onCancel, onCaptured }: Props) {
  return (
    <TaskCapture
      challenge={challengeName}
      task={`${taskName}. Day ${currentDay}.`}
      onCancel={onCancel}
      onCaptured={onCaptured}
    />
  );
}
