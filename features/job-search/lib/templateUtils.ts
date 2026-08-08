import type { LeadChannel, Template, TemplateType } from "../types";

export function getOutreachTemplateTypeForChannel(
  channel: LeadChannel,
): TemplateType | null {
  switch (channel) {
    case "LinkedIn":
      return "LinkedIn Message";
    case "X":
      return "X DM";
    default:
      return null;
  }
}

export function buildTemplateMap(
  templates: Template[],
): Map<number, Template> {
  return new Map(
    templates
      .filter((template): template is Template & { id: number } =>
        Boolean(template.id),
      )
      .map((template) => [template.id, template]),
  );
}

export function getTemplateTitle(
  templateMap: Map<number, Template>,
  templateId: number | null | undefined,
  legacyName?: string,
): string {
  if (templateId != null) {
    return templateMap.get(templateId)?.title ?? "—";
  }
  return legacyName?.trim() || "—";
}

export function filterTemplatesByType(
  templates: Template[],
  type: TemplateType,
): Template[] {
  return templates.filter((template) => template.type === type);
}
