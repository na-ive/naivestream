'use client';

import { useTransition, useState } from 'react';
import { deleteUser } from './actions';
import { TrashCan, Renew } from '@carbon/icons-react';
import { useRouter } from 'next/navigation';
import { Modal } from '@/components/ui/Modal';

export default function DeleteUserButton({ userId, username }: { userId: number; username: string }) {
  const [isPending, startTransition] = useTransition();
  const [showModal, setShowModal] = useState(false);
  const router = useRouter();

  const confirmDelete = () => {
    startTransition(async () => {
      const result = await deleteUser(userId);
      if (result.success) {
        setShowModal(false);
        router.refresh();
      } else {
        alert(`Failed to delete user: ${result.error}`);
        setShowModal(false);
      }
    });
  };

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        disabled={isPending}
        className="inline-flex items-center px-3 py-1.5 bg-danger/10 hover:bg-danger text-danger hover:text-white dark:hover:text-black border border-danger/30 transition-colors text-[10px] uppercase font-bold tracking-widest disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isPending ? 'Deleting...' : (
          <span className="flex items-center gap-1">
            <TrashCan className="w-3 h-3" />
            Delete
          </span>
        )}
      </button>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => !isPending && setShowModal(false)}
        title={
          <div className="flex items-center gap-3">
            <div className="w-1.5 h-6 bg-danger shadow-[0_0_10px_rgba(239,68,68,0.5)]" />
            <h2 className="text-danger text-xs font-mono font-black uppercase tracking-[0.4em]">
              Delete <span className="text-foreground/50">//</span> Confirm Action
            </h2>
          </div>
        }
        footer={
          <>
            <button
              onClick={() => setShowModal(false)}
              className="px-4 py-2 font-black uppercase text-xs tracking-widest text-muted-text hover:text-foreground transition-colors"
              disabled={isPending}
            >
              Cancel
            </button>
            <button
              onClick={confirmDelete}
              className="flex items-center space-x-2 px-6 py-2.5 bg-danger hover:bg-danger/80 text-white font-black text-[10px] uppercase tracking-[0.2em] shadow-[0_0_15px_rgba(239,68,68,0.5)] hover:shadow-[0_0_25px_rgba(239,68,68,0.7)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ clipPath: 'polygon(4px 0, 100% 0, 100% calc(100% - 4px), calc(100% - 4px) 100%, 0 100%, 0 4px)' }}
              disabled={isPending}
            >
              {isPending ? <Renew className="w-4 h-4 animate-spin" /> : <TrashCan className="w-4 h-4" />}
              <span>{isPending ? 'Deleting...' : 'Confirm Delete'}</span>
            </button>
          </>
        }
      >
        <p className="text-sm text-muted-text">
          WARNING: Are you sure you want to permanently delete user <strong className="text-foreground">"{username}"</strong> (ID: {userId})?
        </p>
        <p className="text-sm text-danger/80 mt-4">
          This will remove the user and cascade delete all their history and watchlist. This action CANNOT be undone.
        </p>
      </Modal>
    </>
  );
}
