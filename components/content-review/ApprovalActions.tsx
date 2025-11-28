'use client';

import { useState } from 'react';
import { CheckCircle, XCircle, MessageSquare, Loader2 } from 'lucide-react';

interface ApprovalActionsProps {
  resourceId: number;
  currentStatus?: 'pending' | 'approved' | 'rejected';
  onStatusChange?: (newStatus: string) => void;
}

type ActionType = 'approve' | 'reject' | null;

export default function ApprovalActions({
  resourceId,
  currentStatus = 'pending',
  onStatusChange,
}: ApprovalActionsProps) {
  const [selectedAction, setSelectedAction] = useState<ActionType>(null);
  const [comments, setComments] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [feedback, setFeedback] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  const handleActionClick = (action: ActionType) => {
    setSelectedAction(action);
    setFeedback(null);
  };

  const handleCancel = () => {
    setSelectedAction(null);
    setComments('');
    setFeedback(null);
  };

  const handleSubmit = async () => {
    if (!selectedAction) return;

    setIsLoading(true);
    setFeedback(null);

    try {
      const response = await fetch(`/api/content/${resourceId}/review`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: selectedAction,
          comments: comments.trim() || undefined,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({
          error: 'Failed to submit review',
        }));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      setFeedback({
        type: 'success',
        message: `Content ${selectedAction}d successfully!`,
      });

      // Call the callback with the new status
      if (onStatusChange) {
        onStatusChange(selectedAction === 'approve' ? 'approved' : 'rejected');
      }

      // Reset form after successful submission
      setTimeout(() => {
        setSelectedAction(null);
        setComments('');
        setFeedback(null);
      }, 2000);
    } catch (error) {
      console.error('Error submitting review:', error);
      setFeedback({
        type: 'error',
        message:
          error instanceof Error ? error.message : 'Failed to submit review. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Don't show action buttons if status is not pending
  if (currentStatus !== 'pending') {
    return (
      <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
        <div className="flex items-center gap-2 text-sm">
          {currentStatus === 'approved' ? (
            <>
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span className="font-medium text-green-700">Content Approved</span>
            </>
          ) : (
            <>
              <XCircle className="h-5 w-5 text-red-600" />
              <span className="font-medium text-red-700">Content Rejected</span>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Action Buttons */}
      {!selectedAction && (
        <div className="flex gap-3">
          <button
            onClick={() => handleActionClick('approve')}
            disabled={isLoading}
            className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-green-600 px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <CheckCircle className="h-5 w-5" />
            Approve
          </button>
          <button
            onClick={() => handleActionClick('reject')}
            disabled={isLoading}
            className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <XCircle className="h-5 w-5" />
            Reject
          </button>
        </div>
      )}

      {/* Comments Section */}
      {selectedAction && (
        <div className="space-y-3 rounded-lg border border-gray-200 bg-white p-4">
          <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <MessageSquare className="h-4 w-4" />
            <span>
              {selectedAction === 'approve' ? 'Approval' : 'Rejection'} Comments
              <span className="ml-1 text-xs font-normal text-gray-500">(optional)</span>
            </span>
          </div>
          <textarea
            value={comments}
            onChange={(e) => setComments(e.target.value)}
            placeholder={`Add comments about your ${selectedAction} decision...`}
            disabled={isLoading}
            rows={4}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:cursor-not-allowed disabled:bg-gray-50"
          />
          <div className="flex gap-2">
            <button
              onClick={handleSubmit}
              disabled={isLoading}
              className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${
                selectedAction === 'approve'
                  ? 'bg-green-600 hover:bg-green-700 focus:ring-green-500'
                  : 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
              }`}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  {selectedAction === 'approve' ? (
                    <CheckCircle className="h-4 w-4" />
                  ) : (
                    <XCircle className="h-4 w-4" />
                  )}
                  Confirm {selectedAction === 'approve' ? 'Approval' : 'Rejection'}
                </>
              )}
            </button>
            <button
              onClick={handleCancel}
              disabled={isLoading}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Feedback Messages */}
      {feedback && (
        <div
          className={`rounded-lg border p-4 ${
            feedback.type === 'success'
              ? 'border-green-200 bg-green-50 text-green-800'
              : 'border-red-200 bg-red-50 text-red-800'
          }`}
        >
          <div className="flex items-start gap-2">
            {feedback.type === 'success' ? (
              <CheckCircle className="h-5 w-5 flex-shrink-0 text-green-600" />
            ) : (
              <XCircle className="h-5 w-5 flex-shrink-0 text-red-600" />
            )}
            <p className="text-sm font-medium">{feedback.message}</p>
          </div>
        </div>
      )}
    </div>
  );
}
