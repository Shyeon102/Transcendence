import { useState } from 'react';
import { useSelector } from 'react-redux';
import { Link, useNavigate, useParams } from 'react-router-dom';
import CommentThread from '../components/CommentThread';
import PostComposer from '../components/PostComposer';
import ReportModal from '../components/ReportModal';
import StatusMessage from '../components/ui/StatusMessage';
import { useI18n } from '../lib/i18n';
import type { RootState } from '../store';
import { useDeletePostMutation, useGetPostQuery, useLikePostMutation } from '../store/api/postApi';

export default function PostDetailPage() {
  const { id } = useParams();
  const postId = Number(id);
  const navigate = useNavigate();
  const { t } = useI18n();
  const user = useSelector((state: RootState) => state.auth.user);
  const { data: post, isLoading, isError } = useGetPostQuery(postId, { skip: !postId });
  const [deletePost, { isLoading: isDeleting }] = useDeletePostMutation();
  const [likePost] = useLikePostMutation();
  const [editing, setEditing] = useState(false);
  const [reporting, setReporting] = useState(false);
  const [error, setError] = useState('');
  const isOwner = Boolean(post && user?.id === post.user);

  const remove = async () => {
    if (!post || !window.confirm(t('community.deleteConfirm'))) return;
    try {
      await deletePost(post.id).unwrap();
      navigate('/community');
    } catch {
      setError(t('community.saveError'));
    }
  };

  if (isLoading) return <div className="bg-[#0c0c0b] px-6 py-14 text-[#8a8474]">{t('community.loading')}</div>;
  if (isError || !post) return <div className="bg-[#0c0c0b] px-6 py-14"><StatusMessage>{t('community.loadError')}</StatusMessage></div>;

  return (
    <section className="min-h-[calc(100vh-85px)] bg-[#0c0c0b] px-6 py-14 text-[#f0ead0]">
      <div className="mx-auto max-w-4xl">
        <Link to="/community" className="text-[10px] uppercase tracking-[0.15em] text-[#8a8474]">← {t('community.back')}</Link>
        {editing ? <PostComposer post={post} onDone={() => setEditing(false)} /> : (
          <article className="mt-6 border border-[#f0ead0]/10 bg-[#141412] p-6">
            <div className="flex items-center justify-between gap-4 text-[10px] uppercase tracking-[0.12em] text-[#8a8474]"><span>{t('community.user')} #{post.user}</span><span>{new Date(post.created_at).toLocaleDateString()}</span></div>
            <h1 className="mt-4 font-['Bebas_Neue'] text-[clamp(42px,8vw,72px)] leading-none tracking-[0.03em]">{post.title}</h1>
            <p className="mt-6 whitespace-pre-wrap font-['IBM_Plex_Serif'] text-base leading-8 text-[#c8c2a8]">{post.content}</p>
            <div className="mt-8 flex flex-wrap gap-4 text-[10px] uppercase tracking-[0.12em]">
              {user ? <button type="button" onClick={() => likePost({ id: post.id, liked: Boolean(post.is_liked) })}>{t('community.like')} {post.like_count}</button> : null}
              {user ? <button type="button" onClick={() => setReporting(true)}>{t('community.report')}</button> : null}
              {isOwner ? <button type="button" onClick={() => setEditing(true)}>{t('community.edit')}</button> : null}
              {isOwner ? <button type="button" onClick={remove} disabled={isDeleting} className="text-[#ff4f38]">{t('community.delete')}</button> : null}
            </div>
            {error ? <StatusMessage className="mt-4">{error}</StatusMessage> : null}
          </article>
        )}
        <CommentThread postId={post.id} />
      </div>
      <ReportModal target={reporting ? { type: 'post', id: post.id } : null} onClose={() => setReporting(false)} />
    </section>
  );
}
