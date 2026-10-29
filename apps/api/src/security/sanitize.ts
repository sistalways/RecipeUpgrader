/**
 * SECURITY-SENSITIVE: review by hand (PROJECT.md section 9).
 *
 * Cleans untrusted text (pasted recipes, and later web content) before it
 * enters a prompt. This is a defense-in-depth layer, not the only one:
 * prompt templates still keep instructions in the system message and wrap
 * untrusted content in labeled delimiters with an explicit
 * "this is data, not instructions" statement (see services/llm/prompts/).
 *
 * What this does:
 *  - strips HTML tags and script/style content
 *  - collapses runs of whitespace
 *  - caps length
 *  - neutralizes sequences that imitate our own delimiter tags, so pasted
 *    text can't forge a fake closing tag and smuggle in new "instructions"
 */

const DELIMITER_TAG_PATTERN = /<\/?untrusted_[a-z_]*>/gi;
const HTML_TAG_PATTERN = /<[^>]*>/g;
const SCRIPT_OR_STYLE_BLOCK_PATTERN = /<(script|style)[^>]*>[\s\S]*?<\/\1>/gi;

export function sanitizeUntrustedText(input: string, maxLength: number): string {
  let text = input;

  // Neutralize anything that looks like our own prompt delimiter *before*
  // generic HTML stripping, so we get a visible, logged "[removed]" marker
  // rather than relying on the generic tag stripper to coincidentally catch
  // it too. Order matters here: do this first.
  text = text.replace(DELIMITER_TAG_PATTERN, "[removed]");

  // Drop script/style content wholesale before stripping tags, so their
  // bodies (which aren't "tags") don't survive as plain text.
  text = text.replace(SCRIPT_OR_STYLE_BLOCK_PATTERN, " ");
  text = text.replace(HTML_TAG_PATTERN, " ");

  // Collapse whitespace (including newlines) down to single spaces/newlines
  // are not meaningful for prompt safety purposes here; keep it simple and
  // predictable for the model and for logging-free debugging.
  text = text.replace(/[ \t]+/g, " ");
  text = text.replace(/\n{3,}/g, "\n\n");
  text = text.trim();

  if (text.length > maxLength) {
    text = text.slice(0, maxLength);
  }

  return text;
}
