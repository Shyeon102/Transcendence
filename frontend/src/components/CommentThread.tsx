import { useState } from 'react';
import { useSelector } from 'react-redux';
import { useI18n } from '../lib/i18n';
import type { RootState } from '../store';
import { useCreateCommentMutation, useGetCommentsQuery, useLikeCommentMutation } from '../store/api/postApi';
import type { CommunityComment } from '../types/community';
import ReportModal from './ReportModal';
import StatusMessage from './ui/StatusMessage';
import TextAreaField from './ui/TextAreaField';

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

  const comments = data?.comments ?? [];
  const renderComment = (comment: CommunityComment) => (
    <article key={comment.id} className="border-t border-[#f0ead0]/10 py-4">
      <div className="flex items-center justify-between gap-3 text-[10px] uppercase tracking-[0.12em] text-[#8a8474]">
        <span>{t('community.user')} #{comment.user}</span>
        <span>{new Date(comment.created_at).toLocaleDateString()}</span>
      </div>
      <p className="mt-2 whitespace-pre-wrap font-['IBM_Plex_Serif'] text-sm leading-6 text-[#c8c2a8]">{comment.content}</p>
      <div className="mt-3 flex gap-4 text-[10px] uppercase tracking-[0.12em]">
        {user ? <button type="button" onClick={() => likeComment({ id: comment.id, liked: Boolean(comment.is_liked) })}>{t('community.like')} {comment.like_count}</button> : null}
        {user ? <button type="button" onClick={() => setReportTarget(comment.id)}>{t('community.report')}</button> : null}
      </div>
    </article>
  );

  return (
    <section className="mt-8 border border-[#f0ead0]/10 bg-[#141412] p-5">
      <p className="text-[10px] uppercase tracking-[0.18em] text-[#8a8474]">{t('community.comments')}</p>
      {user ? (
        <div className="mt-4">
          <TextAreaField value={content} onChange={(event) => setContent(event.target.value)} placeholder={t('community.commentPlaceholder')} className="min-h-24 px-3 py-3" />
          {error ? <StatusMessage className="mt-3">{error}</StatusMessage> : null}
          <button type="button" onClick={submit} disabled={isCreating} className="mt-3 bg-[#d63e2a] px-4 py-3 text-[10px] uppercase tracking-[0.15em] disabled:opacity-50">{t('community.addComment')}</button>
        </div>
      ) : <p className="mt-4 text-xs text-[#8a8474]">{t('community.loginToComment')}</p>}
      <div className="mt-5">
        {isLoading ? <p className="text-xs text-[#8a8474]">{t('community.loading')}</p> : null}
        {isError ? <StatusMessage>{t('community.loadError')}</StatusMessage> : null}
        {comments.map(renderComment)}
      </div>
      <ReportModal target={reportTarget ? { type: 'comment', id: reportTarget } : null} onClose={() => setReportTarget(null)} />
    </section>
  );
}
