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

  if (isLoading) {
    return (
      <div className="min-h-[calc(100vh-85px)] bg-[#0c0c0b] px-6 py-14">
        <p className="text-[10px] uppercase tracking-[0.15em] text-[#8a8474]">{t('community.loading')}</p>
      </div>
    );
  }
  if (isError || !post) {
    return (
      <div className="min-h-[calc(100vh-85px)] bg-[#0c0c0b] px-6 py-14">
        <StatusMessage>{t('community.loadError')}</StatusMessage>
      </div>
    );
  }

  return (
    <div className="relative min-h-[calc(100vh-85px)] bg-[#0c0c0b] text-[#f0ead0]">
      {/* 스캔라인 텍스처 */}
      <div className="pointer-events-none fixed inset-0 bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,rgba(0,0,0,0.04)_2px,rgba(0,0,0,0.04)_4px)] z-0" />

      {/* 내비 바 */}
      <div className="relative z-10 border-b border-[#f0ead0]/8 px-6 py-4">
        <div className="mx-auto max-w-4xl">
          <Link
            to="/community"
            className="inline-flex items-center gap-2 text-[9px] uppercase tracking-[0.2em] text-[#8a8474] transition hover:text-[#f0ead0]"
          >
            ← {t('community.back')}
          </Link>
        </div>
      </div>

      <div className="relative z-10 mx-auto max-w-4xl px-6 py-12">
        {editing ? (
          <PostComposer post={post} onDone={() => setEditing(false)} />
        ) : (
          <article>
            {/* 메타 */}
            <div className="flex items-center gap-3 text-[9px] uppercase tracking-[0.14em] text-[#8a8474]/70">
              <span>{post.username ?? `${t('community.user')} #${post.user}`}</span>
              <span>·</span>
              <span>{new Date(post.created_at).toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' })}</span>
              <span className="ml-auto flex gap-4">
                <span>♥ {post.like_count}</span>
                <span>○ {post.view_count}</span>
              </span>
            </div>

            {/* 제목 */}
            <h1 className="mt-3 font-['Bebas_Neue'] text-[clamp(42px,8vw,80px)] leading-none tracking-[0.03em]">
              {post.title}
            </h1>

            {/* 로그인 페이지의 레드 라인 */}
            <div className="mt-5 h-0.5 w-10 bg-[#d63e2a]" />

            {/* 본문 */}
            <p className="mt-8 whitespace-pre-wrap font-['IBM_Plex_Serif'] text-[15px] leading-8 text-[#c8c2a8]">
              {post.content}
            </p>

            {/* 액션 버튼 */}
            {user ? (
              <div className="mt-10 flex flex-wrap items-center gap-2 border-t border-[#f0ead0]/8 pt-6">
                <button
                  type="button"
                  onClick={() => likePost({ id: post.id, liked: Boolean(post.is_liked) })}
                  className={`px-4 py-3 text-[10px] uppercase tracking-[0.15em] transition ${
                    post.is_liked
                      ? 'bg-[#d63e2a] text-[#f0ead0]'
                      : 'border border-[#f0ead0]/10 bg-[#1c1c19] text-[#8a8474] hover:border-[#d63e2a]/50 hover:text-[#d63e2a]'
                  }`}
                >
                  ♥ {t('community.like')} {post.like_count}
                </button>
                <button
                  type="button"
                  onClick={() => setReporting(true)}
                  className="border border-[#f0ead0]/10 bg-[#1c1c19] px-4 py-3 text-[10px] uppercase tracking-[0.15em] text-[#8a8474] transition hover:border-[#f0ead0]/25 hover:text-[#c8c2a8]"
                >
                  {t('community.report')}
                </button>
                {isOwner ? (
                  <>
                    <button
                      type="button"
                      onClick={() => setEditing(true)}
                      className="border border-[#f0ead0]/10 bg-[#1c1c19] px-4 py-3 text-[10px] uppercase tracking-[0.15em] text-[#8a8474] transition hover:border-[#f0ead0]/25 hover:text-[#c8c2a8]"
                    >
                      {t('community.edit')}
                    </button>
                    <button
                      type="button"
                      onClick={remove}
                      disabled={isDeleting}
                      className="border border-[#f0ead0]/10 bg-[#1c1c19] px-4 py-3 text-[10px] uppercase tracking-[0.15em] text-[#8a8474] transition hover:border-[#d63e2a]/50 hover:text-[#d63e2a] disabled:opacity-40"
                    >
                      {t('community.delete')}
                    </button>
                  </>
                ) : null}
                {error ? <StatusMessage className="w-full mt-2">{error}</StatusMessage> : null}
              </div>
            ) : null}
          </article>
        )}

        <CommentThread postId={post.id} />
      </div>

      <ReportModal target={reporting ? { type: 'post', id: post.id } : null} onClose={() => setReporting(false)} />
    </div>
  );
}
