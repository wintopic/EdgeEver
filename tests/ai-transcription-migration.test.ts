import { globSync, readFileSync } from "node:fs";
import { Database } from "bun:sqlite";
import { describe, expect, test } from "bun:test";

describe("speech transcription provider migration", () => {
  test("copies a filled-in endpoint into one selected service and leaves a cleared endpoint behind", () => {
    const db = new Database(":memory:");
    const migrations = globSync("migrations/*.sql").sort();
    const migrationIndex = migrations.findIndex((path) => path.endsWith("0062_ai_transcription_providers.sql"));

    for (const migration of migrations.slice(0, migrationIndex)) {
      db.exec(readFileSync(migration, "utf8"));
    }
    db.query("INSERT INTO workspaces (id, name, is_personal) VALUES (?, ?, 0)").run("ws_speech_off", "Off");
    db.query(
      `INSERT INTO ai_transcription_settings (
         workspace_id, base_url, model_id, api_key_encrypted
       ) VALUES (?, ?, ?, ?)`,
    ).run(
      "ws_default",
      "https://api.groq.com/openai/v1/",
      "whisper-large-v3-turbo",
      "v1.encrypted-speech-key",
    );
    db.query(
      `INSERT INTO ai_transcription_settings (
         workspace_id, base_url, model_id, api_key_encrypted
       ) VALUES (?, ?, ?, ?)`,
    ).run("ws_speech_off", "", "whisper-1", "v1.kept-but-hidden");

    for (const migration of migrations.slice(migrationIndex)) {
      db.exec(readFileSync(migration, "utf8"));
    }

    expect(db.query(
      `SELECT id, provider, display_name, base_url, api_key_encrypted, is_enabled
       FROM ai_transcription_providers WHERE workspace_id = ?`,
    ).get("ws_default")).toEqual({
      id: "atp_ws_default",
      provider: "openai-compatible",
      display_name: "api.groq.com",
      base_url: "https://api.groq.com/openai/v1",
      api_key_encrypted: "v1.encrypted-speech-key",
      is_enabled: 1,
    });
    expect(db.query(
      `SELECT id, provider_id, model_id, display_name
       FROM ai_transcription_models WHERE provider_id = ?`,
    ).get("atp_ws_default")).toEqual({
      id: "atm_ws_default",
      provider_id: "atp_ws_default",
      model_id: "whisper-large-v3-turbo",
      display_name: "whisper-large-v3-turbo",
    });
    expect(db.query(
      `SELECT default_model_id FROM ai_transcription_workspace_settings WHERE workspace_id = ?`,
    ).get("ws_default")).toEqual({ default_model_id: "atm_ws_default" });
    expect(db.query(
      `SELECT COUNT(*) AS count FROM ai_transcription_providers WHERE workspace_id = ?`,
    ).get("ws_speech_off")).toEqual({ count: 0 });
    expect(db.query(
      `SELECT api_key_encrypted FROM ai_transcription_settings WHERE workspace_id = ?`,
    ).get("ws_speech_off")).toEqual({ api_key_encrypted: "v1.kept-but-hidden" });

    db.query("DELETE FROM ai_transcription_providers WHERE id = ?").run("atp_ws_default");
    expect(db.query(
      `SELECT default_model_id FROM ai_transcription_workspace_settings WHERE workspace_id = ?`,
    ).get("ws_default")).toEqual({ default_model_id: null });
  });
});
