import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useI18n } from '../lib/i18n';
import type { RootState } from '../store';
import { useGetPostsQuery, useGetTrendingPostsQuery } from '../store/api/postApi';
import type { PostSort } from '../types/community';
import PostComposer from '../components/PostComposer';
import StatusMessage from '../components/ui/StatusMessage';
import TextField from '../components/ui/TextField';

const postDate = (value: string) => new Date(value).toLocaleDateString();

export default function CommunityPage() {
  const { t } = useI18n();
  const user = useSelector((state: RootState) => state.auth.user);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<PostSort>('recent');
  const { data, isLoading, isError } = useGetPostsQuery({ search, sort });
  const { data: trending, isError: trendingError } = useGetTrendingPostsQuery();
  const posts = data?.posts ?? [];

  return (
    <section className="min-h-[calc(100vh-85px)] bg-[#0c0c0b] px-6 py-14 text-[#f0ead0]">
      <div className="mx-auto max-w-7xl">
        <div className="mb-10 max-w-3xl">
          <p className="mb-3 text-[10px] uppercase tracking-[0.22em] text-[#d63e2a]">{t('community.eyebrow')}</p>
          <h1 className="font-['Bebas_Neue'] text-[clamp(50px,10vw,96px)] leading-[0.92] tracking-[0.03em]">{t('community.title')}</h1>
          <p className="mt-4 font-['IBM_Plex_Serif'] text-sm italic leading-7 text-[#8a8474]">{t('community.description')}</p>
        </div>

        {user ? <PostComposer /> : null}

        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_320px]">
          <div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <TextField type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder={t('community.searchPlaceholder')} className="px-4 py-3" />
              <select value={sort} onChange={(event) => setSort(event.target.value as PostSort)} className="border border-[#f0ead0]/10 bg-[#141412] px-4 py-3 text-xs text-[#f0ead0] outline-none">
                <option value="recent">{t('community.recent')}</option>
                <option value="trending">{t('community.trending')}</option>
              </select>
            </div>

            <div className="mt-5 space-y-3">
              {isLoading ? <p className="text-xs text-[#8a8474]">{t('community.loading')}</p> : null}
              {isError ? <StatusMessage>{t('community.loadError')}</StatusMessage> : null}
              {!isLoading && !isError && posts.length === 0 ? <p className="text-sm text-[#8a8474]">{t('community.empty')}</p> : null}
              {posts.map((post) => (
                <Link key={post.id} to={`/community/${post.id}`} className="block border border-[#f0ead0]/10 bg-[#141412] p-5 transition hover:border-[#f0ead0]/25">
                  <div className="flex items-center justify-between gap-4 text-[10px] uppercase tracking-[0.12em] text-[#8a8474]"><span>{t('community.user')} #{post.user}</span><span>{postDate(post.created_at)}</span></div>
                  <h2 className="mt-3 font-['Bebas_Neue'] text-3xl tracking-[0.04em]">{post.title}</h2>
                  <p className="mt-2 line-clamp-2 font-['IBM_Plex_Serif'] text-sm leading-6 text-[#c8c2a8]">{post.content}</p>
                  <p className="mt-4 text-[10px] uppercase tracking-[0.12em] text-[#8a8474]">{t('community.likes')} {post.like_count} · {t('community.views')} {post.view_count}</p>
                </Link>
              ))}
            </div>
          </div>

          <aside className="h-fit border border-[#f0ead0]/10 bg-[#141412] p-5">
            <p className="text-[10px] uppercase tracking-[0.18em] text-[#d4a847]">{t('community.trending')}</p>
            <div className="mt-4 space-y-3">
              {trendingError ? <StatusMessage>{t('community.loadError')}</StatusMessage> : null}
              {(trending?.posts ?? []).map((post, index) => <Link key={post.id} to={`/community/${post.id}`} className="block border-l border-[#d4a847] pl-3"><span className="text-[9px] tracking-[0.12em] text-[#8a8474]">#{index + 1}</span><p className="mt-1 text-sm text-[#c8c2a8]">{post.title}</p></Link>)}
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
