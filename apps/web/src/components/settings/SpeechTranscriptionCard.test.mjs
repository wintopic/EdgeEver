import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { createInstance } from "i18next";
import { I18nextProvider } from "react-i18next";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { zhCN } from "../../../../../packages/shared/src/i18n/zh-CN.ts";
import { SpeechTranscriptionCard } from "./SpeechTranscriptionCard.tsx";

const saved = {
  providers: [
    {
      id: "atp_groq",
      provider: "openai-compatible",
      displayName: "Groq",
      baseUrl: "https://api.groq.com/openai/v1",
      isEnabled: true,
      hasApiKey: true,
      models: [{
        id: "atm_turbo",
        providerId: "atp_groq",
        modelId: "whisper-large-v3-turbo",
        displayName: "whisper-large-v3-turbo",
      }],
    },
    {
      id: "atp_local",
      provider: "openai-compatible",
      displayName: "本机",
      baseUrl: "http://127.0.0.1:8080/v1",
      isEnabled: true,
      hasApiKey: true,
      models: [{
        id: "atm_local",
        providerId: "atp_local",
        modelId: "local-whisper",
        displayName: "local-whisper",
      }],
    },
  ],
  defaultModelId: "atm_turbo",
  enabled: true,
  encryptionConfigured: true,
  readOnly: false,
};

const renderCard = async (settings, demoMode = false) => {
  const i18n = createInstance();
  await i18n.init({ lng: "zh-CN", resources: { "zh-CN": { translation: zhCN } } });
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, staleTime: Infinity } },
  });
  queryClient.setQueryData(["ai-transcription-settings"], settings);
  return renderToStaticMarkup(createElement(
    QueryClientProvider,
    { client: queryClient },
    createElement(I18nextProvider, { i18n }, createElement(SpeechTranscriptionCard, { demoMode })),
  ));
};

describe("speech transcription settings card", () => {
  test("lists every saved speech service and the one used for extraction", async () => {
    const html = await renderCard(saved);
    expect(html).toContain("语音识别模型配置");
    expect(html).not.toContain("语音识别服务当前主要用于视频字幕识别");
    expect(html).toContain("默认语音模型");
    expect(html).toContain("添加模型服务");
    expect(html).toContain("Groq");
    expect(html).toContain("本机");
    expect(html).toContain("api.groq.com");
    expect(html).toContain("127.0.0.1:8080");
    expect(html).toContain("whisper-large-v3-turbo");
    expect(html).toContain("local-whisper");
    expect(html).toContain("默认");
    expect(html).toContain("OpenAI 兼容标准");
    expect(html).not.toContain("asr-token");
    expect(html).not.toContain("title=");
  });

  test("shows an empty list when no speech service is saved", async () => {
    const html = await renderCard({
      providers: [],
      defaultModelId: null,
      enabled: false,
      encryptionConfigured: true,
      readOnly: false,
    });
    expect(html).toContain("还没有语音识别服务");
    expect(html).toContain("默认语音模型");
    expect(html).toContain("yt-dlp 复用的浏览器登录状态");
    expect(html).not.toContain("提取字幕下载音频时");
    expect(html).toContain("仅在本地用于读取当前浏览器已登录的媒体流以获取音轨与字幕");
    expect(html).toContain("使用规范与版权说明");
    expect(html).toContain("字幕提取与音视频转录功能仅供个人学习、离线研读及辅助记录使用");
    expect(html).toContain("音视频素材及其原始台词、字幕等衍生内容的知识产权均归原作者及发布平台所有");
    expect(html).toContain("相关解析与下载逻辑完全在您的本地设备运行");
    expect(html).toContain("yt-dlp 版本");
    expect(html).toContain("尚未下载");
    expect(html).toContain("yt-dlp 路径");
    expect(html).toContain("未知");
  });

  test("is its own settings page under models and agents", () => {
    const pane = readFileSync(new URL("../SettingsPane.tsx", import.meta.url), "utf8");
    const card = readFileSync(new URL("./SpeechTranscriptionCard.tsx", import.meta.url), "utf8");
    const provider = readFileSync(new URL("./SpeechProviderCard.tsx", import.meta.url), "utf8");
    const aiTab = pane.slice(pane.indexOf('case "ai"'), pane.indexOf('case "speech"'));
    const speechTab = pane.slice(pane.indexOf('case "speech"'), pane.indexOf('case "mcp"'));
    expect(aiTab).toContain("<AiModelCard />");
    expect(aiTab).not.toContain("SpeechTranscriptionCard");
    expect(speechTab).toContain("<SpeechTranscriptionCard demoMode={demoMode} />");
    expect(pane.indexOf('key: "ai"')).toBeLessThan(pane.indexOf('key: "mcp"'));
    expect(pane.indexOf('key: "mcp"')).toBeLessThan(pane.indexOf('key: "speech"'));
    expect(card).toContain("createAiTranscriptionProvider");
    expect(card).not.toContain("speechTranscription.description");
    expect(card).toContain("speechTranscription.cookieBrowser");
    expect(card).not.toContain("cookieBrowserHint");
    const localToolStart = card.lastIndexOf("rounded-lg border border-slate-200 bg-card divide-y", card.indexOf('id="video-cookie-browser"'));
    const localToolEnd = card.indexOf('t("systemInfo.ytDlpPath")');
    expect(localToolStart).toBeGreaterThan(-1);
    expect(localToolStart).toBeLessThan(localToolEnd);
    expect(card.slice(localToolStart, localToolEnd)).toContain('t("systemInfo.ytDlpVersion")');
    expect(card).toContain("speechTranscription.standard");
    expect(card).toContain('value="openai-compatible"');
    expect(provider).toContain("apiKey.trim() ? { apiKey: apiKey.trim() } : {}");
    expect(card).not.toContain("updateAiTranscriptionSettings");
    expect(provider).not.toContain("@ai-sdk/openai");
    expect(provider).not.toContain("transcribe(");
    expect(card).not.toContain("title=");
    expect(provider).not.toContain("title=");
  });
});
