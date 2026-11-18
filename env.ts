import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
	server: {
		APP_URL: z.url(),
		APP_SECRET: z.string().optional(),
		DATABASE_URL: z.string().optional(),
		DISABLE_DB_WARN: z
			.string()
			.optional()
			.transform((v) => v === "true" || v === "1"),
		AUTORIZED_DOMAINS: z
			.string()
			.default("")
			.transform((str) =>
				str
					.split(",")
					.map((s) => s.trim())
					.filter((s) => s.length > 0),
			),
		SMTP_HOST: z.string().optional(),
		SMTP_PORT: z.coerce.number().optional(),
		SMTP_USER: z.string().optional(),
		SMTP_PASSWORD: z.string().optional(),
		SMTP_FROM: z.string().optional(),
		NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
		AUTH_ALLOWED_EMAILS: z
			.string()
			.default("")
			.transform((str) =>
				str
					.split(",")
					.map((email) => email.trim().toLowerCase())
					.filter(Boolean),
			),
		AUTH_WHITELISTED_DOMAINS: z
			.string()
			.default("")
			.transform((str) =>
				str
					.split(",")
					.map((s) => s.trim().toLowerCase())
					.filter((s) => s.length > 0),
			),
		AUTH_ALLOW_REGISTRATION: z
			.enum(["true", "false", "1", "0"])
			.optional()
			.transform((value) => (value ? value === "true" || value === "1" : process.env.NODE_ENV !== "production")),
		CARDDAV_ALLOWED_ORIGINS: z
			.string()
			.default("")
			.transform((value) =>
				value
					.split(",")
					.map((origin) => origin.trim())
					.filter(Boolean),
			),
		LOCALE: z.enum(["fr", "en"]).default("en"),
		VISION_PROVIDER: z.enum(["ollama", "openai", "anthropic", "gemini", "custom"]).default("ollama"),
		CUSTOM_BASE_URL: z.string().optional(),
		CUSTOM_MODEL: z.string().optional(),
		CUSTOM_API_KEY: z.string().optional(),
		OLLAMA_BASE_URL: z.string().default("http://localhost:11434"),
		OLLAMA_MODEL: z.string().default("llama3.2-vision"),
		OPENAI_API_KEY: z.string().optional(),
		OPENAI_MODEL: z.string().default("gpt-6-luna"),
		ANTHROPIC_API_KEY: z.string().optional(),
		ANTHROPIC_MODEL: z.string().default("claude-haiku-5-5"),
		GEMINI_API_KEY: z.string().optional(),
		GEMINI_MODEL: z.string().default("gemini-3.5-flash-lite"),
	},

	runtimeEnv: {
		APP_URL: process.env.APP_URL,
		DATABASE_URL: process.env.DATABASE_URL,
		DISABLE_DB_WARN: process.env.DISABLE_DB_WARN,
		APP_SECRET: process.env.APP_SECRET,
		AUTORIZED_DOMAINS: process.env.AUTORIZED_DOMAINS,
		SMTP_HOST: process.env.SMTP_HOST,
		SMTP_PORT: process.env.SMTP_PORT,
		SMTP_USER: process.env.SMTP_USER,
		SMTP_PASSWORD: process.env.SMTP_PASSWORD,
		SMTP_FROM: process.env.SMTP_FROM,

		NODE_ENV: process.env.NODE_ENV,
		AUTH_ALLOWED_EMAILS: process.env.AUTH_ALLOWED_EMAILS,
		AUTH_WHITELISTED_DOMAINS: process.env.AUTH_WHITELISTED_DOMAINS,
		AUTH_ALLOW_REGISTRATION: process.env.AUTH_ALLOW_REGISTRATION,
		CARDDAV_ALLOWED_ORIGINS: process.env.CARDDAV_ALLOWED_ORIGINS,

		LOCALE: process.env.LOCALE,
		OLLAMA_BASE_URL: process.env.OLLAMA_BASE_URL,
		OLLAMA_MODEL: process.env.OLLAMA_MODEL,
		VISION_PROVIDER: process.env.VISION_PROVIDER,
		CUSTOM_BASE_URL: process.env.CUSTOM_BASE_URL,
		CUSTOM_MODEL: process.env.CUSTOM_MODEL,
		CUSTOM_API_KEY: process.env.CUSTOM_API_KEY,
		OPENAI_API_KEY: process.env.OPENAI_API_KEY,
		OPENAI_MODEL: process.env.OPENAI_MODEL,
		ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY,
		ANTHROPIC_MODEL: process.env.ANTHROPIC_MODEL,
		GEMINI_API_KEY: process.env.GEMINI_API_KEY,
		GEMINI_MODEL: process.env.GEMINI_MODEL,
	},
	skipValidation: !!process.env.SKIP_ENV_VALIDATION,
	emptyStringAsUndefined: true,
});
