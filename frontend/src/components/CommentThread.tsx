import { useState } from 'react';
import { useSelector } from 'react-redux';
import { useI18n } from '../lib/i18n';
import type { RootState } from '../store';
import { useCreateCommentMutation, useGetCommentsQuery, useLikeCommentMutation } from '../store/api/postApi';
import type { CommunityComment } from '../types/community';
import ReportModal from './ReportModal';
import StatusMessage from './ui/StatusMessage';

type CommentThreadProps = { postId: number };

export default function CommentThread({ postId }: CommentThreadProps) {
  const { t } = useI18n();
  const user = useSelector((state: RootState) => state.auth.user);
  const { data, isLoading, isError } = useGetCommentsQuery(postId);
  const [createComment, { isLoading: isCreating }] = useCreateCommentMutation();
  const [likeComment] = useLikeCommentMutation();
  const [content, setContent] = useState('');
  const [error, setError] = useState('');
  const [reportTarget, setReportTarget] = useState<number | null>(null);

  const submit = async () => {
    if (!content.trim()) {
      setError(t('community.commentValidation'));
      return;
    }
    try {
      await createComment({ postId, body: { content: content.trim() } }).unwrap();
      setContent('');
      setError('');
    } catch {
      setError(t('community.saveError'));
    }
  };

  const renderComment = (comment: CommunityComment, depth = 0) => (
    <article
      key={comment.id}
      className={
        depth > 0
          ? 'mt-4 border-l border-[#f0ead0]/15 pl-5'
          : 'border-t border-[#f0ead0]/8 py-6'
      }
    >
      <div className="flex items-center justify-between gap-3 text-[9px] uppercase tracking-[0.14em] text-[#8a8474]/60">
        <span>{comment.username ?? `${t('community.user')} #${comment.user}`}</span>
        <span>{new Date(comment.created_at).toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' })}</span>
      </div>
      <p className="mt-3 whitespace-pre-wrap font-['IBM_Plex_Serif'] text-[13px] leading-7 text-[#c8c2a8]">
        {comment.content}
      </p>
      {user ? (
        <div className="mt-3 flex gap-3">
          <button
            type="button"
            onClick={() => likeComment({ id: comment.id, liked: Boolean(comment.is_liked) })}
            className={`text-[9px] uppercase tracking-[0.12em] transition ${
              comment.is_liked ? 'text-[#d63e2a]' : 'text-[#8a8474] hover:text-[#d63e2a]'
            }`}
          >
            ♥ {t('community.like')} {comment.like_count}
          </button>
          <button
            type="button"
            onClick={() => setReportTarget(comment.id)}
            className="text-[9px] uppercase tracking-[0.12em] text-[#8a8474] transition hover:text-[#c8c2a8]"
          >
            {t('community.report')}
          </button>
        </div>
      ) : null}
      {comment.replies && comment.replies.length > 0 ? (
        <div className="mt-2">
          {comment.replies.map((reply) => renderComment(reply, depth + 1))}
        </div>
      ) : null}
    </article>
  );

  const comments = data?.comments ?? [];

  return (
    <section className="mt-14">
      {/* 헤더 */}
      <p className="mb-2 text-[9px] uppercase tracking-[0.22em] text-[#8a8474]">
        {t('community.comments')}
        {comments.length > 0 ? (
          <span className="ml-2 font-['Bebas_Neue'] text-base text-[#d4a847]">{comments.length}</span>
        ) : null}
      </p>
      <div className="mb-6 h-0.5 w-10 bg-[#d63e2a]" />

      {/* 댓글 작성 */}
      {user ? (
        <div className="mb-4 space-y-3">
          <div>
            <label className="mb-2 block text-[9px] uppercase tracking-[0.18em] text-[#8a8474]">
              {t('community.commentPlaceholder').replace('.', '')}
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={t('community.commentPlaceholder')}
              className="w-full resize-y border border-[#f0ead0]/10 bg-[#1c1c19] px-4 py-3 font-['IBM_Plex_Serif'] text-[13px] leading-6 text-[#f0ead0] outline-none transition placeholder:text-[#8a8474] focus:border-[#f0ead0]/25 min-h-24"
            />
          </div>
          {error ? <StatusMessage>{error}</StatusMessage> : null}
          <div className="flex justify-end">
            <button
              type="button"
              onClick={submit}
              disabled={isCreating}
              className="bg-[#d63e2a] px-5 py-3 text-[10px] uppercase tracking-[0.18em] text-[#f0ead0] transition hover:bg-[#ff4f38] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {t('community.addComment')}
            </button>
          </div>
        </div>
      ) : (
        <p className="mb-6 font-['IBM_Plex_Serif'] text-sm italic text-[#8a8474]">
          {t('community.loginToComment')}
        </p>
      )}

      {/* 댓글 목록 */}
      <div>
        {isLoading ? (
          <p className="text-[10px] uppercase tracking-[0.15em] text-[#8a8474]">{t('community.loading')}</p>
        ) : isError ? (
          <StatusMessage>{t('community.loadError')}</StatusMessage>
        ) : (
          comments.map(renderComment)
        )}
      </div>

      <ReportModal
        target={reportTarget ? { type: 'comment', id: reportTarget } : null}
        onClose={() => setReportTarget(null)}
      />
    </section>
  );
}
