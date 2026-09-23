import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Check, Copy, Form } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import type { TableField, TableFormFieldSetting, TableFormUpdateInput } from "@edgeever/shared";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { api, getConfiguredDesktopApiBaseUrl } from "@/lib/api";
import { copyTextToClipboard } from "@/lib/clipboard";

const formUrl = (token: string) => {
  const baseUrl = getConfiguredDesktopApiBaseUrl() || window.location.origin;
  return `${baseUrl.replace(/\/$/, "")}/form/${encodeURIComponent(token)}`;
};

const passwordKey = (memoId: string) => `edgeever.tableFormPassword.${memoId}`;

const readPassword = (memoId: string, token: string) => {
  try {
    const parsed = JSON.parse(window.sessionStorage.getItem(passwordKey(memoId)) ?? "") as { token?: string; password?: string };
    return parsed.token === token && parsed.password ? parsed.password : "";
  } catch {
    return "";
  }
};

const writePassword = (memoId: string, token: string, password: string) => {
  try {
    window.sessionStorage.setItem(passwordKey(memoId), JSON.stringify({ token, password }));
  } catch {
    // The generated password stays visible for this dialog session.
  }
};

export const TableFormDialog = ({
  memoId,
  memoTitle,
  fields,
  open,
  onOpenChange,
}: {
  memoId: string;
  memoTitle: string;
  fields: TableField[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const queryKey = ["table-form", memoId] as const;
  const formQuery = useQuery({
    queryKey,
    queryFn: () => api.getTableForm(memoId),
    enabled: open,
    retry: false,
  });
  const saved = formQuery.data?.form ?? null;
  const [enabled, setEnabled] = useState(false);
  const [passwordProtected, setPasswordProtected] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [submitLabel, setSubmitLabel] = useState("");
  const [selected, setSelected] = useState<TableFormFieldSetting[]>([]);
  const [password, setPassword] = useState("");
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    const nextFields = saved?.fields.length
      ? saved.fields.filter((field) => fields.some((item) => item.id === field.fieldId))
      : fields.map((field) => ({ fieldId: field.id, required: false }));
    setEnabled(saved?.enabled ?? false);
    setPasswordProtected(saved?.passwordProtected ?? false);
    setTitle(saved?.title || memoTitle);
    setDescription(saved?.description ?? "");
    setSubmitLabel(saved?.submitLabel ?? "");
    setSelected(nextFields);
    setPassword(saved?.token ? readPassword(memoId, saved.token) : "");
    setError(null);
  }, [fields, memoId, memoTitle, open, saved]);

  const saveMutation = useMutation({
    mutationFn: (payload: TableFormUpdateInput) => api.updateTableForm(memoId, payload),
    onSuccess: (data) => {
      queryClient.setQueryData(queryKey, { form: { ...data.form, password: undefined } });
      if (data.form.password) {
        writePassword(memoId, data.form.token, data.form.password);
        setPassword(data.form.password);
      } else if (!data.form.passwordProtected) {
        setPassword("");
      }
      setError(null);
    },
    onError: (reason: Error) => setError(reason.message),
  });

  const payload = (rotatePassword = false): TableFormUpdateInput => ({
    enabled,
    passwordProtected,
    rotatePassword,
    title: title.trim(),
    description: description.trim(),
    submitLabel: submitLabel.trim(),
    fields: selected,
  });

  const save = (rotatePassword = false) => {
    if (enabled && selected.length === 0) {
      setError(t("structuredTable.form.needField"));
      return;
    }
    saveMutation.mutate(payload(rotatePassword));
  };

  const toggleField = (fieldId: string, included: boolean) => {
    setSelected((current) => included
      ? [...current.filter((field) => field.fieldId !== fieldId), { fieldId, required: false }]
      : current.filter((field) => field.fieldId !== fieldId));
  };

  const toggleRequired = (fieldId: string, required: boolean) => {
    setSelected((current) => current.map((field) => field.fieldId === fieldId ? { ...field, required } : field));
  };

  const link = saved?.token ? formUrl(saved.token) : "";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{t("structuredTable.form.title")}</DialogTitle>
          <DialogDescription>{t("structuredTable.form.description")}</DialogDescription>
        </DialogHeader>
        <label className="flex items-center justify-between gap-3 text-sm">
          <span>{t("structuredTable.form.enabled")}</span>
          <Switch checked={enabled} onCheckedChange={setEnabled} aria-label={t("structuredTable.form.enabled")} />
        </label>
        {link && saved?.enabled ? (
          <div className="space-y-2">
            <span className="text-xs text-slate-500">{t("structuredTable.form.link")}</span>
            <div className="flex gap-2">
              <Input readOnly value={link} aria-label={t("structuredTable.form.link")} />
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  void copyTextToClipboard(link).then(() => {
                    setCopied(true);
                    window.setTimeout(() => setCopied(false), 1500);
                  });
                }}
              >
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                {copied ? t("structuredTable.form.copied") : t("structuredTable.form.copy")}
              </Button>
            </div>
          </div>
        ) : null}
        <label className="flex items-center justify-between gap-3 text-sm">
          <span>{t("structuredTable.form.password")}</span>
          <Switch checked={passwordProtected} onCheckedChange={setPasswordProtected} aria-label={t("structuredTable.form.password")} />
        </label>
        <p className="text-xs text-slate-500">{t("structuredTable.form.passwordHint")}</p>
        {password ? <Input readOnly value={password} aria-label={t("structuredTable.form.password")} /> : null}
        {saved?.passwordProtected ? (
          <Button type="button" variant="outline" size="sm" onClick={() => save(true)} disabled={saveMutation.isPending}>
            {t("structuredTable.form.regenerate")}
          </Button>
        ) : null}
        <label className="block space-y-1 text-sm">
          <span>{t("structuredTable.form.formTitle")}</span>
          <Input value={title} onChange={(event) => setTitle(event.target.value)} aria-label={t("structuredTable.form.formTitle")} />
        </label>
        <label className="block space-y-1 text-sm">
          <span>{t("structuredTable.form.formDescription")}</span>
          <textarea
            className="min-h-20 w-full rounded-md border border-slate-200 px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/70"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            aria-label={t("structuredTable.form.formDescription")}
          />
        </label>
        <label className="block space-y-1 text-sm">
          <span>{t("structuredTable.form.submitLabel")}</span>
          <Input
            value={submitLabel}
            placeholder={t("structuredTable.form.submitDefault")}
            onChange={(event) => setSubmitLabel(event.target.value)}
            aria-label={t("structuredTable.form.submitLabel")}
          />
        </label>
        <div className="space-y-2">
          <p className="text-sm">{t("structuredTable.form.fields")}</p>
          {fields.map((field) => {
            const setting = selected.find((item) => item.fieldId === field.id);
            return (
              <div key={field.id} className="flex items-center justify-between gap-3 text-sm">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={Boolean(setting)}
                    aria-label={field.name}
                    onChange={(event) => toggleField(field.id, event.target.checked)}
                  />
                  <span>{field.name}</span>
                  <span className="text-xs text-slate-400">{t(`structuredTable.types.${field.type}`)}</span>
                </label>
                <label className="flex items-center gap-2 text-xs text-slate-500">
                  <input
                    type="checkbox"
                    checked={Boolean(setting?.required)}
                    disabled={!setting}
                    aria-label={`${field.name} ${t("structuredTable.form.required")}`}
                    onChange={(event) => toggleRequired(field.id, event.target.checked)}
                  />
                  {t("structuredTable.form.required")}
                </label>
              </div>
            );
          })}
        </div>
        {error ? <p className="text-sm text-rose-600">{error}</p> : null}
        {saveMutation.isSuccess && !error ? <p className="text-sm text-emerald-700">{t("structuredTable.form.saved")}</p> : null}
        <Button type="button" onClick={() => save(false)} disabled={saveMutation.isPending || formQuery.isLoading}>
          <Form className="h-4 w-4" />
          {saveMutation.isPending ? t("structuredTable.form.saving") : t("structuredTable.form.save")}
        </Button>
      </DialogContent>
    </Dialog>
  );
};
