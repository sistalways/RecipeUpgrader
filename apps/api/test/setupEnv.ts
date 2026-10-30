// Dummy env values so config.ts's startup validation passes in tests.
// Real secrets are never used in tests; services that would call out to
// Token Factory or USDA are mocked in the tests that need them.
process.env.TOKEN_FACTORY_API_KEY ??= "test-key";
process.env.TOKEN_FACTORY_BASE_URL ??= "https://example.invalid/v1";
process.env.MODEL_FAST ??= "test-fast-model";
process.env.MODEL_REASONING ??= "test-reasoning-model";
process.env.USDA_API_KEY ??= "test-usda-key";
process.env.SUPABASE_URL ??= "https://example-project.supabase.co";
process.env.SUPABASE_ANON_KEY ??= "test-anon-key";
process.env.SUPABASE_JWKS_URL ??= "https://example-project.supabase.co/auth/v1/.well-known/jwks.json";
