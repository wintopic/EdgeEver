import { useState, type FormEvent, type ReactNode } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { VIDEO_COOKIE_BROWSERS, type AiTranscriptionSettings, type AiTranscriptionStandard, type VideoCookieBrowser } from "@edgeever/shared";
import { AudioLines, Loader2, Plus, ShieldCheck, TriangleAlert } from "lucide-react";
import { useTranslation } from "react-i18next";
import { aiErrorMessage } from "@/components/settings/ai-provider-options";
import { SpeechProviderCard } from "@/components/settings/SpeechProviderCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { api } from "@/lib/api";
import {
  SETTINGS_CARD_HEADER_CLASSNAME,
  SETTINGS_CARD_ICON_CLASSNAME,
  SETTINGS_CARD_TITLE_CLASSNAME,
  SETTINGS_ITEM_TITLE_CLASSNAME,
} from "./settings-ui";

const emptyDraft = {
  provider: "openai-compatible" as AiTranscriptionStandard,
  displayName: "",
  baseUrl: "",
  apiKey: "",
  initialModelId: "",
};

type YtDlpStatus = {
  state: "idle" | "checking" | "downloading" | "ready" | "failed";
  version: string | null;
  path: string;
  errorCode: string | null;
  httpStatus: number | null;
};

const ytDlpReason = (
  t: (key: string, options?: Record<string, string>) => string,
  status: YtDlpStatus,
) => {
  if (!status.errorCode) return "";
  if (status.errorCode === "http") {
    return t("systemInfo.ytDlpErrors.http", { status: String(status.httpStatus ?? "") });
  }
  const key = `systemInfo.ytDlpErrors.${status.errorCode}`;
  const translated = t(key);
  return translated === key ? t("systemInfo.ytDlpFailed") : translated;
};

const ytDlpVersionValue = (
  t: (key: string, options?: Record<string, string>) => string,
  status: YtDlpStatus | undefined,
) => {
  if (!status || status.state === "idle" || status.state === "checking") {
    return status?.version || t("systemInfo.ytDlpMissing");
  }
  const reason = ytDlpReason(t, status);
  if (status.state === "downloading") {
    return status.version
      ? t("systemInfo.ytDlpUpdating", { version: status.version })
      : t("systemInfo.ytDlpDownloading");
  }
  if (status.state === "failed") return reason || t("systemInfo.ytDlpFailed");
  if (status.errorCode && status.version) {
    return t("systemInfo.ytDlpUpdateFailed", {
      version: status.version,
      reason: reason || t("systemInfo.ytDlpFailed"),
    });
  }
  return status.version || t("systemInfo.ytDlpMissing");
};

export const SpeechTranscriptionCard = ({ demoMode }: { demoMode: boolean }) => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const desktop = typeof window !== "undefined" && window.edgeeverDesktop?.isAvailable === true;
  const settingsQuery = useQuery({
    queryKey: ["ai-transcription-settings"],
    queryFn: api.getAiTranscriptionSettings,
  });
  const cookieBrowserQuery = useQuery({
    queryKey: ["video-cookie-browser"],
    queryFn: () => window.edgeeverDesktop!.videoCookieBrowser(),
    enabled: desktop,
  });
  const ytDlpStatusQuery = useQuery({
    queryKey: ["desktop-yt-dlp-status"],
    queryFn: () => window.edgeeverDesktop!.ytDlpStatus(),
    enabled: desktop,
    refetchInterval: 30_000,
    retry: 1,
  });
  const [showAdd, setShowAdd] = useState(false);
  const [draft, setDraft] = useState(emptyDraft);
  const [previewBrowser, setPreviewBrowser] = useState<VideoCookieBrowser | null>(null);

  const settings = settingsQuery.data;
  const providers = settings?.providers ?? [];
  const readOnly = demoMode || Boolean(settings?.readOnly);
  const encryptionConfigured = settings?.encryptionConfigured ?? false;
  const canAdd = !readOnly && encryptionConfigured;
  const hasUnavailableCredentials = providers.some((provider) => provider.credentialsUnavailable);
  const allModels = providers.flatMap((provider) =>
    provider.models.map((model) => ({ ...model, providerName: provider.displayName, providerEnabled: provider.isEnabled })));
  const defaultModelAvailable = !settings?.defaultModelId
    || allModels.some((model) => model.id === settings.defaultModelId && model.providerEnabled);
  const applySettings = (saved: AiTranscriptionSettings) => {
    queryClient.setQueryData(["ai-transcription-settings"], saved);
  };
  const createMutation = useMutation({
    mutationFn: () => api.createAiTranscriptionProvider({
      provider: draft.provider,
      displayName: draft.displayName.trim(),
      baseUrl: draft.baseUrl.trim(),
      apiKey: draft.apiKey.trim(),
      isEnabled: true,
      ...(draft.initialModelId.trim() ? { initialModelId: draft.initialModelId.trim() } : {}),
    }),
    onSuccess: (saved) => {
      applySettings(saved);
      setShowAdd(false);
      setDraft(emptyDraft);
    },
  });
  const defaultMutation = useMutation({
    mutationFn: api.updateDefaultAiTranscriptionModel,
    onSuccess: applySettings,
  });
  const cookieBrowserMutation = useMutation({
    mutationFn: (browser: VideoCookieBrowser) => window.edgeeverDesktop!.setVideoCookieBrowser(browser),
    onSuccess: (saved) => {
      queryClient.setQueryData(["video-cookie-browser"], saved.browser);
    },
  });
  const browserNotice = desktop
    ? (cookieBrowserMutation.isSuccess ? cookieBrowserMutation.data.browser : null)
    : previewBrowser;
  const ytDlpStatus = ytDlpStatusQuery.data;
  const ytDlpFailed = ytDlpStatusQuery.isError || ytDlpStatus?.state === "failed" || (ytDlpStatus?.state === "ready" && Boolean(ytDlpStatus.errorCode));
  const ytDlpVersion = ytDlpStatusQuery.isError ? t("systemInfo.ytDlpFailed") : ytDlpVersionValue(t, ytDlpStatus);
  const ytDlpPath = ytDlpStatus?.path || t("systemInfo.unknown");
  const addDisabledReason = readOnly
    ? t("speechTranscription.demoDisabled")
    : !encryptionConfigured
      ? t("aiModel.encryptionKeyMissing")
      : undefined;
  const handleAddDialogChange = (open: boolean) => {
    setShowAdd(open);
    if (!open) {
      setDraft(emptyDraft);
      createMutation.reset();
    }
  };

  return (
    <Card className="w-full min-w-0 overflow-hidden shadow-none">
      <CardHeader className={SETTINGS_CARD_HEADER_CLASSNAME}>
        <CardTitle className={SETTINGS_CARD_TITLE_CLASSNAME}>
          <AudioLines className={SETTINGS_CARD_ICON_CLASSNAME} />
          {t("speechTranscription.title")}
        </CardTitle>
      </CardHeader>
      <CardContent className="grid gap-5 p-4 pt-0 sm:px-5 sm:pb-5">
        {settingsQuery.isLoading ? (
          <p className="flex items-center gap-2 text-xs leading-5 text-slate-500">
            <Loader2 className="h-4 w-4 animate-spin" />
            {t("common.loading")}
          </p>
        ) : settingsQuery.isError ? (
          <p className="text-xs font-medium text-rose-600" role="alert">
            {aiErrorMessage(settingsQuery.error, t("speechTranscription.failed"), t("aiModel.encryptionKeyMissing"), t("speechTranscription.savedCredentialsUnavailable"))}
          </p>
        ) : (
          <>
            {!encryptionConfigured ? (
              <p className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs leading-5 text-amber-800">
                <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" />
                {t("aiModel.encryptionKeyMissing")}
              </p>
            ) : null}
            {hasUnavailableCredentials ? (
              <p className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs leading-5 text-amber-800">
                <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" />
                {t("speechTranscription.savedCredentialsUnavailable")}
              </p>
            ) : null}
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-3">
                <div className={SETTINGS_ITEM_TITLE_CLASSNAME}>{t("speechTranscription.defaultModel")}</div>
                <div className="w-56 max-w-[60%] shrink-0 sm:w-72">
                  <Select
                    value={settings?.defaultModelId ?? "none"}
                    onValueChange={(value) => defaultMutation.mutate(value === "none" ? null : value)}
                    disabled={readOnly || defaultMutation.isPending}
                  >
                    <SelectTrigger className="h-8 bg-card text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">{t("speechTranscription.noDefaultModel")}</SelectItem>
                      {allModels.map((model) => (
                        <SelectItem key={model.id} value={model.id} disabled={!model.providerEnabled}>
                          {model.displayName} · {model.providerName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              {!defaultModelAvailable ? (
                <p className="flex items-center gap-1.5 text-xs text-amber-700">
                  <TriangleAlert className="h-3.5 w-3.5 shrink-0" />
                  {t("speechTranscription.defaultUnavailable")}
                </p>
              ) : null}
              {defaultMutation.isError ? (
                <p className="text-xs font-medium text-rose-600" role="alert">
                  {aiErrorMessage(defaultMutation.error, t("speechTranscription.failed"), t("aiModel.encryptionKeyMissing"), t("speechTranscription.savedCredentialsUnavailable"))}
                </p>
              ) : null}
            </div>
            <section className="grid gap-3">
              <div className="flex items-center justify-end">
                <DisabledActionTooltip label={!canAdd ? addDisabledReason : undefined}>
                  <Button type="button" variant="outline" size="sm" className="h-8 gap-1.5 bg-card text-xs font-normal" disabled={!canAdd} onClick={() => handleAddDialogChange(true)}>
                    <Plus className="h-3.5 w-3.5" />{t("speechTranscription.addProvider")}
                  </Button>
                </DisabledActionTooltip>
              </div>
              {providers.length ? (
                <div className="overflow-hidden rounded-lg border border-slate-200 divide-y divide-slate-100 bg-card">
                  {providers.map((provider) => (
                    <SpeechProviderCard
                      key={provider.id}
                      provider={provider}
                      defaultModelId={settings?.defaultModelId ?? null}
                      readOnly={readOnly}
                      onChanged={applySettings}
                    />
                  ))}
                </div>
              ) : (
                <p className="rounded-lg border border-dashed border-slate-200 p-6 text-center text-xs text-slate-400">{t("speechTranscription.noProviders")}</p>
              )}
            </section>
            {readOnly ? <p className="text-xs leading-5 text-slate-500">{t("speechTranscription.demoDisabled")}</p> : null}
            <section className="overflow-hidden rounded-lg border border-slate-200 bg-card divide-y divide-slate-100">
              <div className="grid gap-2 px-4 py-3">
                <div className="flex items-center justify-between gap-3">
                  <label className={`${SETTINGS_ITEM_TITLE_CLASSNAME} min-w-0`} htmlFor="video-cookie-browser">
                    {t("speechTranscription.cookieBrowser")}
                  </label>
                  <div className="w-56 max-w-[60%] shrink-0 sm:w-72">
                    <Select
                      value={(desktop ? cookieBrowserQuery.data : previewBrowser) ?? "chrome"}
                      onValueChange={(value) => {
                        const browser = value as VideoCookieBrowser;
                        if (desktop) cookieBrowserMutation.mutate(browser);
                        else setPreviewBrowser(browser);
                      }}
                      disabled={desktop && (cookieBrowserQuery.isLoading || cookieBrowserMutation.isPending)}
                    >
                      <SelectTrigger id="video-cookie-browser" className="h-8 bg-card text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {VIDEO_COOKIE_BROWSERS.map((browser) => (
                          <SelectItem key={browser} value={browser}>
                            {t(`speechTranscription.cookieBrowsers.${browser}`)}
                          </SelectItem>
                        ))}
                        <SelectItem value="none">{t("speechTranscription.cookieBrowserNone")}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <p className="text-xs leading-4 text-slate-500">
                  {t("speechTranscription.cookieBrowserNotice")}
                </p>
                {browserNotice ? (
                  <p className="text-xs font-medium text-emerald-700">
                    {browserNotice === "none"
                      ? t("speechTranscription.cookieBrowserOff")
                      : t("speechTranscription.cookieBrowserApplied", {
                        browser: t(`speechTranscription.cookieBrowsers.${browserNotice}`),
                      })}
                  </p>
                ) : null}
                {desktop && (cookieBrowserQuery.isError || cookieBrowserMutation.isError) ? (
                  <p className="text-xs font-medium text-rose-600" role="alert">{t("speechTranscription.cookieBrowserFailed")}</p>
                ) : null}
              </div>
              <div className="flex items-center justify-between gap-3 px-4 py-3">
                <p className={SETTINGS_ITEM_TITLE_CLASSNAME}>{t("systemInfo.ytDlpVersion")}</p>
                <p className={`text-right text-xs font-medium leading-5 ${ytDlpFailed ? "text-rose-600" : "text-slate-900"}`}>{ytDlpVersion}</p>
              </div>
              <div className="flex items-start justify-between gap-3 px-4 py-3">
                <p className={SETTINGS_ITEM_TITLE_CLASSNAME}>{t("systemInfo.ytDlpPath")}</p>
                <p className="max-w-[60%] break-all text-right font-mono text-xs leading-5 text-slate-900">{ytDlpPath}</p>
              </div>
            </section>
            <section className="rounded-lg border border-slate-200 bg-slate-50/60 p-4 text-xs leading-5 text-slate-600">
              <div className="flex items-center gap-1.5 font-medium text-slate-800">
                <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" />
                <span>{t("speechTranscription.complianceNoticeTitle")}</span>
              </div>
              <ul className="mt-2 list-disc space-y-1 pl-4 text-slate-500">
                <li>{t("speechTranscription.complianceNoticePersonalUse")}</li>
                <li>{t("speechTranscription.complianceNoticeCopyright")}</li>
                <li>{t("speechTranscription.complianceNoticeLocalSecurity")}</li>
              </ul>
            </section>
            <Dialog open={showAdd} onOpenChange={handleAddDialogChange}>
              <DialogContent className="max-h-[calc(100vh-2rem)] overflow-y-auto sm:max-w-lg">
                <form
                  className="grid gap-4"
                  onSubmit={(event: FormEvent) => {
                    event.preventDefault();
                    if (!canAdd || createMutation.isPending) return;
                    createMutation.mutate();
                  }}
                >
                  <DialogHeader>
                    <DialogTitle className="text-xs font-normal">{t("speechTranscription.addProvider")}</DialogTitle>
                  </DialogHeader>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label={t("speechTranscription.displayName")}>
                      <Input className="h-9 text-xs" value={draft.displayName} onChange={(event) => setDraft({ ...draft, displayName: event.target.value })} required maxLength={80} />
                    </Field>
                    <SpeechStandardField
                      value={draft.provider}
                      onChange={(provider) => setDraft({ ...draft, provider })}
                    />
                  </div>
                  <Field label={t("speechTranscription.baseUrl")} hint={t("speechTranscription.baseUrlHint")}>
                    <Input className="h-9 text-xs" value={draft.baseUrl} onChange={(event) => setDraft({ ...draft, baseUrl: event.target.value })} placeholder={t("speechTranscription.baseUrlPlaceholder")} required inputMode="url" autoComplete="off" spellCheck={false} maxLength={500} />
                  </Field>
                  <Field label={t("speechTranscription.modelId")}>
                    <Input className="h-9 text-xs" value={draft.initialModelId} onChange={(event) => setDraft({ ...draft, initialModelId: event.target.value })} placeholder={t("speechTranscription.modelIdPlaceholder")} required autoComplete="off" spellCheck={false} maxLength={200} />
                  </Field>
                  <Field label={t("speechTranscription.apiToken")} hint={t("speechTranscription.apiTokenHint")}>
                    <Input className="h-9 text-xs" type="password" value={draft.apiKey} onChange={(event) => setDraft({ ...draft, apiKey: event.target.value })} required autoComplete="new-password" maxLength={4096} />
                  </Field>
                  {createMutation.isError ? (
                    <p className="text-xs font-medium text-rose-600" role="alert">
                      {aiErrorMessage(createMutation.error, t("speechTranscription.failed"), t("aiModel.encryptionKeyMissing"), t("speechTranscription.savedCredentialsUnavailable"))}
                    </p>
                  ) : null}
                  <DialogFooter className="gap-2 sm:space-x-0">
                    <Button type="button" variant="outline" className="text-xs font-normal" onClick={() => handleAddDialogChange(false)}>{t("common.cancel")}</Button>
                    <Button type="submit" variant="solid" className="text-xs font-normal" disabled={!canAdd || createMutation.isPending}>
                      {createMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}{t("speechTranscription.addProvider")}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </>
        )}
      </CardContent>
    </Card>
  );
};

const SpeechStandardField = ({
  value,
  onChange,
  disabled = false,
}: {
  value: AiTranscriptionStandard;
  onChange: (value: AiTranscriptionStandard) => void;
  disabled?: boolean;
}) => {
  const { t } = useTranslation();
  return (
    <Field label={t("speechTranscription.standard")}>
      <Select value={value} onValueChange={(next) => onChange(next as AiTranscriptionStandard)} disabled={disabled}>
        <SelectTrigger className="h-9 bg-card text-xs font-normal"><SelectValue /></SelectTrigger>
        <SelectContent>
          <SelectItem value="openai-compatible">{t("speechTranscription.standards.openai-compatible")}</SelectItem>
        </SelectContent>
      </Select>
    </Field>
  );
};

const Field = ({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) => (
  <label className="grid gap-1.5 text-xs font-normal leading-5 text-slate-700">
    {label}{children}{hint ? <span className="text-xs font-normal leading-4 text-slate-500">{hint}</span> : null}
  </label>
);

const DisabledActionTooltip = ({ label, children }: { label?: string; children: ReactNode }) => {
  if (!label) return children;
  return (
    <TooltipProvider delayDuration={0} skipDelayDuration={0}>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="inline-flex" tabIndex={0}>{children}</span>
        </TooltipTrigger>
        <TooltipContent side="bottom">{label}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
