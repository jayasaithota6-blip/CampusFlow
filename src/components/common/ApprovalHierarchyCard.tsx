import React from 'react';
import { ApprovalStep } from '../../types';
import { CheckCircle2, Clock, XCircle, MinusCircle } from 'lucide-react';
import { cn } from '../../utils/cn';

interface ApprovalHierarchyCardProps {
  steps: ApprovalStep[];
  className?: string;
}

export function ApprovalHierarchyCard({ steps, className }: ApprovalHierarchyCardProps) {
  return (
    <div className={cn('rounded-xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900', className)}>
      <h4 className="text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-4">
        Approval Stage Timeline
      </h4>

      <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-neutral-200 dark:before:bg-neutral-800">
        {steps.map((step, index) => {
          const isApproved = step.status === 'approved';
          const isRejected = step.status === 'rejected';
          const isPending = step.status === 'pending';
          const isSkipped = step.status === 'skipped';

          return (
            <div key={index} className="relative flex items-start gap-3">
              {/* Timeline marker icon */}
              <div
                className={cn(
                  'absolute -left-6 mt-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-white dark:bg-neutral-900',
                  isApproved && 'text-emerald-600 dark:text-emerald-400',
                  isPending && 'text-amber-500 animate-pulse',
                  isRejected && 'text-rose-600 dark:text-rose-400',
                  isSkipped && 'text-neutral-400 dark:text-neutral-600'
                )}
              >
                {isApproved && <CheckCircle2 className="h-5 w-5" />}
                {isPending && <Clock className="h-5 w-5" />}
                {isRejected && <XCircle className="h-5 w-5" />}
                {isSkipped && <MinusCircle className="h-5 w-5" />}
              </div>

              <div className="flex-1 text-xs">
                <div className="flex items-center justify-between">
                  <span
                    className={cn(
                      'font-medium',
                      isApproved && 'text-neutral-900 dark:text-neutral-100',
                      isPending && 'font-semibold text-amber-700 dark:text-amber-400',
                      isRejected && 'font-semibold text-rose-700 dark:text-rose-400',
                      isSkipped && 'text-neutral-400 dark:text-neutral-500'
                    )}
                  >
                    {step.label}
                  </span>
                  <span
                    className={cn(
                      'rounded px-1.5 py-0.5 text-[10px] uppercase font-semibold tracking-wider',
                      isApproved && 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300',
                      isPending && 'bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300',
                      isRejected && 'bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300',
                      isSkipped && 'bg-neutral-100 text-neutral-500 dark:bg-neutral-800'
                    )}
                  >
                    {step.status}
                  </span>
                </div>

                {step.actorName && (
                  <p className="mt-0.5 text-[11px] text-neutral-500 dark:text-neutral-400">
                    Reviewer: {step.actorName} {step.updatedAt && `· ${step.updatedAt}`}
                  </p>
                )}

                {step.comments && (
                  <div className="mt-1.5 rounded-md bg-neutral-50 p-2 text-[11px] text-neutral-700 dark:bg-neutral-800/60 dark:text-neutral-300">
                    "{step.comments}"
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
