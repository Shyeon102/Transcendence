import { useState } from 'react';
import { useI18n } from '../lib/i18n';
import { useReportCommentMutation, useReportPostMutation } from '../store/api/postApi';
import type { ReportType } from '../types/community';
import StatusMessage from './ui/StatusMessage';
import TextAreaField from './ui/TextAreaField';

type ReportModalProps = {
  target: { type: 'post' | 'comment'; id: number } | null;
  onClose: () => void;
};

const reportTypes: ReportType[] = ['spam', 'abuse', 'nsfw', 'copyright'];

export default function ReportModal({ target, onClose }: ReportModalProps) {
  const { t } = useI18n();
  const [reportType, setReportType] = useState<ReportType>('spam');
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');
  const [reportPost, { isLoading: isReportingPost }] = useReportPostMutation();
  const [reportComment, { isLoading: isReportingComment }] = useReportCommentMutation();
  const isReporting = isReportingPost || isReportingComment;

  if (!target) {
    return null;
  }

  const submit = async () => {
    if (!reason.trim()) {
      setError(t('community.reportValidation'));
      return;
    }

    try {
      const body = { report_type: reportType, reason: reason.trim() };
      if (target.type === 'post') {
        await reportPost({ id: target.id, body }).unwrap();
      } else {
        await reportComment({ id: target.id, body }).unwrap();
      }
      onClose();
    } catch {
      setError(t('community.reportError'));
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-6" role="dialog" aria-modal="true">
      <div className="w-full max-w-md border border-[#f0ead0]/15 bg-[#141412] p-6 text-[#f0ead0]">
        <p className="text-[10px] uppercase tracking-[0.18em] text-[#d63e2a]">{t('community.report')}</p>
        <h2 className="mt-2 font-['Bebas_Neue'] text-4xl tracking-[0.04em]">{t('community.reportTitle')}</h2>
        <select
          value={reportType}
          onChange={(event) => setReportType(event.target.value as ReportType)}
          className="mt-5 w-full border border-[#f0ead0]/10 bg-[#1c1c19] px-3 py-3 text-xs text-[#f0ead0] outline-none"
        >
          {reportTypes.map((type) => <option key={type} value={type}>{t(`community.reportTypes.${type}`)}</option>)}
        </select>
        <TextAreaField
          value={reason}
          onChange={(event) => setReason(event.target.value)}
          placeholder={t('community.reportPlaceholder')}
          className="mt-3 min-h-28 px-3 py-3"
        />
        {error ? <StatusMessage className="mt-3">{error}</StatusMessage> : null}
        <div className="mt-5 flex justify-end gap-3">
          <button type="button" onClick={onClose} className="px-4 py-3 text-[10px] uppercase tracking-[0.15em] text-[#c8c2a8]">{t('community.cancel')}</button>
          <button type="button" onClick={submit} disabled={isReporting} className="bg-[#d63e2a] px-4 py-3 text-[10px] uppercase tracking-[0.15em] disabled:opacity-50">{t('community.submitReport')}</button>
        </div>
      </div>
    </div>
  );
}
