export const TEMPLATE_PLACEHOLDERS = ["{{name}}", "{{company}}", "{{role}}"] as const;

const PLACEHOLDER_PATTERN = /(\{\{(?:name|company|role)\}\})/g;

export function isTemplatePlaceholder(segment: string): boolean {
  return TEMPLATE_PLACEHOLDERS.includes(
    segment as (typeof TEMPLATE_PLACEHOLDERS)[number],
  );
}

export function splitBodyWithPlaceholders(body: string): string[] {
  return body.split(PLACEHOLDER_PATTERN).filter((segment) => segment.length > 0);
}
