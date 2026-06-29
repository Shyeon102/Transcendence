import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useI18n } from '../lib/i18n';
import type { RootState } from '../store';
import { useGetPostsQuery, useGetTrendingPostsQuery } from '../store/api/postApi';
import type { PostSort } from '../types/community';
import PostComposer from '../components/PostComposer';
import StatusMessage from '../components/ui/StatusMessage';

const postDate = (value: string) =>
  new Date(value).toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' });

export default function CommunityPage() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const user = useSelector((state: RootState) => state.auth.user);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<PostSort>('recent');
  const [composerOpen, setComposerOpen] = useState(false);
  const { data, isLoading, isError } = useGetPostsQuery({ sort });
  const { data: trending, isError: trendingError } = useGetTrendingPostsQuery();
  const posts = data?.posts ?? [];
  // 백엔드 목록이 전체 글을 한 번에 주므로 검색은 클라이언트에서 제목/본문 필터링.
  const query = search.trim().toLowerCase();
  const visiblePosts = query
    ? posts.filter((post) =>
        `${post.title} ${post.content}`.toLowerCase().includes(query)
      )
    : posts;

  return (
    <div className="min-h-[calc(100vh-85px)] bg-[#0c0c0b] text-[#f0ead0]">
      {/* 스캔라인 텍스처 (전체 덮개) */}
      <div className="pointer-events-none fixed inset-0 bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,rgba(0,0,0,0.04)_2px,rgba(0,0,0,0.04)_4px)] z-0" />

      {/* 헤더 배너 */}
      <div className="relative overflow-hidden border-b border-[#f0ead0]/8 px-6 py-16">
        {/* 배경 거대 텍스트 */}
        <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap font-['Bebas_Neue'] text-[clamp(100px,18vw,200px)] tracking-[-0.02em] text-[#f0ead0]/[0.025]">
          {t('community.eyebrow')}
        </div>

        <div className="relative z-10 mx-auto flex max-w-7xl items-end justify-between gap-6">
          <div className="max-w-xl">
            <p className="mb-3 text-[10px] uppercase tracking-[0.22em] text-[#d63e2a]">{t('community.eyebrow')}</p>
            <h1 className="font-['Bebas_Neue'] text-[clamp(48px,9vw,88px)] leading-none tracking-[0.03em]">
              {t('community.title')}
            </h1>
            <div className="mt-5 h-0.5 w-10 bg-[#d63e2a]" />
            <p className="mt-4 font-['IBM_Plex_Serif'] text-sm italic leading-7 text-[#8a8474]">
              {t('community.description')}
            </p>
          </div>
          {user ? (
            <button
              type="button"
              onClick={() => setComposerOpen((prev) => !prev)}
              className="mb-1 shrink-0 bg-[#d63e2a] px-5 py-3 text-[10px] uppercase tracking-[0.2em] text-[#f0ead0] transition hover:bg-[#ff4f38]"
            >
              {composerOpen ? '✕ 닫기' : `+ ${t('community.writePost')}`}
            </button>
          ) : null}
        </div>
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-6 py-10">
        {/* 글쓰기 폼 */}
        {composerOpen ? (
          <div className="mb-10">
            <PostComposer onDone={() => setComposerOpen(false)} />
          </div>
        ) : null}

        {/* 정렬 컨트롤 */}
        <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-end gap-2">
            {(['recent', 'trending'] as PostSort[]).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setSort(s)}
                className={`px-4 py-3 text-[10px] uppercase tracking-[0.15em] transition ${
                  sort === s
                    ? 'bg-[#d63e2a] text-[#f0ead0]'
                    : 'border border-[#f0ead0]/10 bg-[#1c1c19] text-[#8a8474] hover:border-[#f0ead0]/25 hover:text-[#c8c2a8]'
                }`}
              >
                {t(`community.${s}`)}
              </button>
            ))}
          </div>

          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('community.searchPlaceholder')}
            className="w-full border border-[#f0ead0]/10 bg-[#1c1c19] px-4 py-3 text-[12px] text-[#f0ead0] outline-none transition placeholder:text-[#8a8474] focus:border-[#f0ead0]/25 sm:w-64"
          />
        </div>

        {/* 메인 그리드 */}
        <div className="grid gap-10 lg:grid-cols-[1fr_260px]">
          {/* 포스트 목록 */}
          <div>
            {isLoading ? (
              <p className="text-[10px] uppercase tracking-[0.15em] text-[#8a8474]">{t('community.loading')}</p>
            ) : isError ? (
              <StatusMessage>{t('community.loadError')}</StatusMessage>
            ) : visiblePosts.length === 0 ? (
              <p className="font-['IBM_Plex_Serif'] text-sm italic text-[#8a8474]">{t('community.empty')}</p>
            ) : (
              <div className="space-y-2">
                {visiblePosts.map((post, index) => (
                  <Link
                    key={post.id}
                    to={`/community/${post.id}`}
                    className="group flex gap-4 border border-[#f0ead0]/10 bg-[#1c1c19] p-5 transition hover:border-[#d63e2a]/40 hover:bg-[#1c1c19]"
                  >
                    {/* 인덱스 */}
                    <span className="mt-0.5 w-6 shrink-0 font-['Bebas_Neue'] text-lg leading-none tracking-[0.06em] text-[#8a8474]/40 transition group-hover:text-[#d63e2a]">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <div className="min-w-0 flex-1">
                      <h2 className="font-['Bebas_Neue'] text-2xl leading-tight tracking-[0.04em] transition group-hover:text-[#d63e2a]">
                        {post.title}
                      </h2>
                      <p className="mt-1 line-clamp-2 font-['IBM_Plex_Serif'] text-[13px] leading-6 text-[#8a8474]">
                        {post.content}
                      </p>
                      <div className="mt-3 flex items-center gap-3 text-[9px] uppercase tracking-[0.12em] text-[#8a8474]/60">
                        <span
                          role="link"
                          tabIndex={0}
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            navigate(`/profile/${post.user}`);
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              e.stopPropagation();
                              navigate(`/profile/${post.user}`);
                            }
                          }}
                          className="cursor-pointer transition hover:text-[#d63e2a]"
                        >
                          {post.username ?? `${t('community.user')} #${post.user}`}
                        </span>
                        <span>·</span>
                        <span>{postDate(post.created_at)}</span>
                        <span className="ml-auto flex gap-3">
                          <span>♥ {post.like_count}</span>
                          <span>○ {post.view_count}</span>
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* 트렌딩 사이드바 */}
          <aside className="h-fit">
            <p className="mb-2 text-[9px] uppercase tracking-[0.22em] text-[#8a8474]">{t('community.trending')}</p>
            <div className="mb-5 h-0.5 w-10 bg-[#d4a847]" />
            <div className="space-y-5">
              {trendingError ? (
                <StatusMessage>{t('community.loadError')}</StatusMessage>
              ) : (
                (trending?.posts ?? []).map((post, index) => (
                  <Link key={post.id} to={`/community/${post.id}`} className="group flex gap-3 border border-[#f0ead0]/10 bg-[#1c1c19] p-4 transition hover:border-[#d4a847]/40">
                    <span className="font-['Bebas_Neue'] text-2xl leading-none text-[#d4a847]/30 transition group-hover:text-[#d4a847]">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <p className="mt-1 text-[13px] leading-snug text-[#8a8474] transition group-hover:text-[#c8c2a8]">
                      {post.title}
                    </p>
                  </Link>
                ))
              )}
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
