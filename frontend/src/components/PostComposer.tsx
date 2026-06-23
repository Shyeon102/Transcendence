import { useState } from 'react';
import { useI18n } from '../lib/i18n';
import { useCreatePostMutation, useUpdatePostMutation } from '../store/api/postApi';
import type { CommunityPost } from '../types/community';
import StatusMessage from './ui/StatusMessage';
import TextAreaField from './ui/TextAreaField';
import TextField from './ui/TextField';

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
    <section className="border border-[#f0ead0]/10 bg-[#141412] p-5">
      <p className="text-[10px] uppercase tracking-[0.18em] text-[#8a8474]">
        {t(post ? 'community.editPost' : 'community.writePost')}
      </p>
      <TextField
        value={title}
        onChange={(event) => setTitle(event.target.value)}
        placeholder={t('community.titlePlaceholder')}
        className="mt-4 px-4 py-3 text-[13px]"
      />
      <TextAreaField
        value={content}
        onChange={(event) => setContent(event.target.value)}
        placeholder={t('community.contentPlaceholder')}
        className="mt-3 min-h-28 px-4 py-3 font-['IBM_Plex_Serif'] text-[13px] leading-6"
      />
      {error ? <StatusMessage className="mt-3">{error}</StatusMessage> : null}
      <button
        type="button"
        onClick={submit}
        disabled={isSaving}
        className="mt-4 bg-[#d63e2a] px-4 py-3 text-[10px] uppercase tracking-[0.15em] text-[#f0ead0] transition hover:bg-[#ff4f38] disabled:opacity-50"
      >
        {isSaving ? t('community.saving') : t(post ? 'community.save' : 'community.publish')}
      </button>
    </section>
  );
}
