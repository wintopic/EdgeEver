import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ChevronDown, Loader2 } from "lucide-react";
import { Link } from "react-router";
import { WORKSPACE_SETTINGS_PATH } from "@/hooks/useWorkspaceRoute";
import { useTranslation } from "react-i18next";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuRadioGroup,
  DropdownMenuRadioItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { api } from "@/lib/api";
import {
  AI_SIDEBAR_ADAPTER_PATH_KEY, aiSidebarAdapterFromStorage,
  desktopAcpAvailable, listDesktopAcpAdapters, probeDesktopAcpAdapter, selectAiSidebarAgent,
  type AiSidebarSource, type DesktopAcpAdapterId,
} from "@/lib/desktop-acp";
import { aiErrorMessage, formatProviderOrdinal, isLegacyProviderDisplayName } from "../settings/ai-provider-options";
import { resolveBuiltinAgentModel } from "./builtin-agent-model";

export function AiAgentSelector({ source, adapterId, disabled, onPendingChange, noteContext = false }: {
  source: AiSidebarSource;
  adapterId: DesktopAcpAdapterId | null;
  disabled: boolean;
  noteContext?: boolean;
  onPendingChange: (pending: boolean) => void;
}) {
  const { t, i18n } = useTranslation();
  const locale = i18n.resolvedLanguage ?? i18n.language;
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const settings = useQuery({ queryKey: ["ai-settings", locale], queryFn: () => api.getAiSettings(locale), staleTime: 30_000 });
  const desktop = desktopAcpAvailable();
  const agents = useQuery({
    queryKey: ["ai-sidebar-adapters"],
    queryFn: async () => {
      const listed = await listDesktopAcpAdapters();
      const configured = aiSidebarAdapterFromStorage("antigravity", window.localStorage.getItem(AI_SIDEBAR_ADAPTER_PATH_KEY));
      if (configured?.id === "antigravity" && configured.path) {
        const checked = await probeDesktopAcpAdapter(configured);
        return [...listed.filter((agent) => agent.id !== checked.id), checked];
      }
      return listed;
    },
    enabled: desktop && open,
    staleTime: 0,
  });
  const mutation = useMutation({
    mutationFn: async (value: string) => {
      if (value.startsWith("agent:")) {
        const id = value.slice(6) as DesktopAcpAdapterId;
        if (!agents.data?.some((agent) => agent.id === id && agent.state === "available")) throw new Error(t("aiAssistant.agentSource.switchUnavailable"));
        selectAiSidebarAgent("local", id);
      } else {
        if (value !== "builtin" && value.slice(6) !== settings.data?.defaultModelId) {
          const updated = await api.updateDefaultAiModel(value.slice(6));
          queryClient.setQueryData(["ai-settings", locale], updated);
          await queryClient.invalidateQueries({ queryKey: ["ai-settings"] });
        }
        selectAiSidebarAgent("builtin");
      }
    },
    onSuccess: () => setOpen(false),
  });
  useEffect(() => {
    if (disabled) setOpen(false);
  }, [disabled]);
  const builtin = resolveBuiltinAgentModel(settings.data);
  const provider = settings.data?.providers.find((item) => item.models.some((model) => model.id === settings.data?.defaultModelId));
  const modelLabel = [provider?.displayName, builtin?.label].filter(Boolean).join(" · ") || t("aiModel.noDefaultModel");
  const label = source === "local"
    ? (adapterId ? t(`aiAssistant.agentSource.${adapterId}`) : t("aiAssistant.agentSource.local"))
    : `${t("aiAssistant.agentSource.builtin")} · ${modelLabel}`;
  const buttonLabel = source === "local" ? label : builtin?.label ?? t("aiModel.noDefaultModel");
  const localHint = t(noteContext ? "aiAssistant.agentSource.switchNoteAgentHint" : "aiAssistant.agentSource.newAgentThread");
  const selected = source === "local" ? `agent:${adapterId}` : settings.data?.defaultModelId ? `model:${settings.data.defaultModelId}` : "builtin";
  const providers = (settings.data?.providers ?? []).map((provider, index) => {
    const name = !provider.displayName || isLegacyProviderDisplayName(provider.displayName, provider.provider)
      ? t("aiModel.defaultProviderName", { ordinal: formatProviderOrdinal(index + 1, locale) }) : provider.displayName;
    return { ...provider, name };
  }).filter((provider) => provider.models.length);
  const localAgents = agents.data ?? [];
  const choose = (value: string) => {
    if (disabled || mutation.isPending) return;
    if (value === selected) { setOpen(false); return; }
    onPendingChange(true);
    void mutation.mutateAsync(value).catch(() => undefined).finally(() => onPendingChange(false));
  };

  return (
    <div className="min-w-0 max-w-44 flex-1">
      <DropdownMenu open={open} onOpenChange={(next) => {
        if (mutation.isPending) return;
        setOpen(next);
        if (next) { mutation.reset(); void settings.refetch(); }
      }}>
        <DropdownMenuTrigger asChild>
          <button type="button" disabled={disabled || mutation.isPending}
            aria-label={`${t("aiAssistant.agentSource.switch")} · ${label}`}
            className="flex w-full min-w-0 items-center gap-1 rounded-full px-2 py-1.5 text-xs text-slate-600 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 disabled:opacity-50">
            <span className="truncate">{buttonLabel}</span>
            {mutation.isPending ? <Loader2 className="size-3 shrink-0 animate-spin" /> : <ChevronDown className="size-3 shrink-0" />}
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent side="top" align="end" className="w-80 max-w-[calc(100vw-24px)]">
          {settings.isError || mutation.isError ? <p role="alert" className="px-2 py-1 text-xs text-rose-600">{aiErrorMessage(mutation.error ?? settings.error, t("aiAssistant.agentSource.switchUnavailable"), t("aiModel.encryptionKeyMissing"), t("aiModel.savedCredentialsUnavailable"))}</p> : null}
          <div className="max-h-72 overflow-y-auto">
            <DropdownMenuRadioGroup value={selected} onValueChange={choose}>
              {source === "local" ? <DropdownMenuRadioItem value="builtin" disabled={mutation.isPending} onSelect={(event) => event.preventDefault()}>{t("aiAssistant.agentSource.builtin")}</DropdownMenuRadioItem> : null}
              {settings.isPending ? <p className="px-2 py-2 text-xs">{t("common.loading")}</p> : null}
              {providers.map((provider) => (
                <div key={provider.id}>
                  <DropdownMenuLabel>{t("aiAssistant.agentSource.builtin")} · {provider.name}</DropdownMenuLabel>
                  {provider.models.map((model) => <DropdownMenuRadioItem key={model.id} value={`model:${model.id}`}
                    disabled={mutation.isPending || settings.data?.readOnly || !settings.data?.encryptionConfigured || !provider.isEnabled || provider.credentialsUnavailable}
                    onSelect={(event) => event.preventDefault()}>
                    <span className="min-w-0 break-words">{model.displayName || model.modelId}{!provider.isEnabled || provider.credentialsUnavailable ? <span className="ml-2 text-[10px] text-slate-500">{t("aiAssistant.agentSource.optionUnavailable")}</span> : null}</span>
                  </DropdownMenuRadioItem>)}
                </div>
              ))}
              {!settings.isPending && !providers.length ? <p className="px-2 py-2 text-xs text-slate-500">{t("aiAssistant.agentSource.noModels")}</p> : null}
              {desktop ? <>
                <DropdownMenuSeparator />
                <DropdownMenuLabel>{t("aiAssistant.agentSource.local")}</DropdownMenuLabel>
                <p className="px-2 pb-1 text-[11px] text-slate-500">{localHint}</p>
                {agents.isPending ? <p className="px-2 py-2 text-xs">{t("common.loading")}</p> : null}
                {agents.isError ? <p role="alert" className="px-2 py-2 text-xs text-rose-600">{t("aiAssistant.agentSource.switchUnavailable")}</p> : null}
                {localAgents.map((agent) => <DropdownMenuRadioItem key={agent.id} value={`agent:${agent.id}`} disabled={mutation.isPending || agents.isFetching || agent.state !== "available"} onSelect={(event) => event.preventDefault()}>
                  <span className="flex min-w-0 flex-1 flex-wrap justify-between gap-x-2"><span>{t(`aiAssistant.agentSource.${agent.id}`)}</span><span className="text-[10px] text-slate-500">{t(`aiAssistant.agentSource.states.${agent.state}`)}</span></span>
                </DropdownMenuRadioItem>)}
                {!agents.isPending && !agents.isError && !localAgents.length ? <p className="px-2 py-2 text-xs text-slate-500">{t("aiAssistant.agentSource.switchUnavailable")}</p> : null}
              </> : null}
            </DropdownMenuRadioGroup>
          </div>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild disabled={mutation.isPending}>
            <Link to={`${WORKSPACE_SETTINGS_PATH}?tab=ai`}>{t("aiAssistant.agentSource.configure")}</Link>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
