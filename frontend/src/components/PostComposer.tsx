import { useState } from 'react';
import { useI18n } from '../lib/i18n';
import { useCreatePostMutation, useUpdatePostMutation } from '../store/api/postApi';
import type { CommunityPost } from '../types/community';
import StatusMessage from './ui/StatusMessage';

type PostComposerProps = {
  post?: CommunityPost;
  onDone?: () => void;
};

export default function PostComposer({ post, onDone }: PostComposerProps) {
  const { t } = useI18n();
  const [title, setTitle] = useState(post?.title ?? '');
  const [content, setContent] = useState(post?.content ?? '');
  const [error, setError] = useState('');
  const [createPost, { isLoading: isCreating }] = useCreatePostMutation();
  const [updatePost, { isLoading: isUpdating }] = useUpdatePostMutation();
  const isSaving = isCreating || isUpdating;

  const submit = async () => {
    if (!title.trim() || !content.trim()) {
      setError(t('community.postValidation'));
      return;
    }
    try {
      const body = { title: title.trim(), content: content.trim() };
      if (post) {
        await updatePost({ id: post.id, body }).unwrap();
      } else {
        await createPost(body).unwrap();
        setTitle('');
        setContent('');
      }
      setError('');
      onDone?.();
    } catch {
      setError(t('community.saveError'));
    }
  };

  return (
    <section className="border border-[#f0ead0]/10 bg-[#141412] p-6">
      <p className="mb-6 text-[9px] uppercase tracking-[0.22em] text-[#d63e2a]">
        {t(post ? 'community.editPost' : 'community.writePost')}
      </p>

      <div className="space-y-5">
        <div>
          <label className="mb-2 block text-[9px] uppercase tracking-[0.18em] text-[#8a8474]">
            {t('community.titlePlaceholder').replace('.', '')}
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={t('community.titlePlaceholder')}
            className="w-full border border-[#f0ead0]/10 bg-[#1c1c19] px-4 py-3 font-['Bebas_Neue'] text-xl tracking-[0.04em] text-[#f0ead0] outline-none transition placeholder:text-[#8a8474]/50 placeholder:font-['IBM_Plex_Serif'] placeholder:text-sm placeholder:normal-case placeholder:tracking-normal focus:border-[#f0ead0]/25"
          />
        </div>

        <div>
          <label className="mb-2 block text-[9px] uppercase tracking-[0.18em] text-[#8a8474]">
            {t('community.contentPlaceholder').replace('?', '')}
          </label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={t('community.contentPlaceholder')}
            className="w-full resize-y border border-[#f0ead0]/10 bg-[#1c1c19] px-4 py-3 font-['IBM_Plex_Serif'] text-[13px] leading-7 text-[#f0ead0] outline-none transition placeholder:text-[#8a8474] focus:border-[#f0ead0]/25 min-h-32"
          />
        </div>
      </div>

      {error ? <StatusMessage className="mt-4">{error}</StatusMessage> : null}

      <div className="mt-5 flex items-center justify-between">
        {post && onDone ? (
          <button
            type="button"
            onClick={onDone}
            className="text-[9px] uppercase tracking-[0.18em] text-[#8a8474] transition hover:text-[#c8c2a8]"
          >
            {t('community.cancel')}
          </button>
        ) : (
          <span />
        )}
        <button
          type="button"
          onClick={submit}
          disabled={isSaving}
          className="bg-[#d63e2a] px-5 py-3 text-[10px] uppercase tracking-[0.18em] text-[#f0ead0] transition hover:bg-[#ff4f38] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSaving ? t('community.saving') : t(post ? 'community.save' : 'community.publish')}
        </button>
      </div>
    </section>
  );
}
