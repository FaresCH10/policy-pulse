import type { ActionItem, OfficialContact, Policy } from "./types";

export function getLiveActions(policies: Policy[]): ActionItem[] {
  return policies.map(policy => ({
    id: `${policy.id}-draft`, policyId: policy.id, kind: "email-draft",
    title: "Ask for clarification", detail: "A starting point you can edit and copy. Find the appropriate contact through the official source.",
    isDemo: false, sourceUrl: policy.sourceUrl, retrievedAt: policy.retrievedAt,
    emailTemplate: {
      subject: `Question about ${policy.shortTitle}`,
      body: `Hello,\n\nI am reading about ${policy.title} and would like to understand {{questionTopic}}.\n\nCould you point me to the current official guidance and explain any relevant exemptions?\n\nThank you,\n{{signature}}`,
      placeholders: ["questionTopic", "signature"],
    },
  }));
}

export function getOfficialLinks(policies: Policy[]): OfficialContact[] {
  return policies.flatMap(policy => policy.sourceUrl ? [{
    id: `${policy.id}-official`, policyId: policy.id, label: "Official policy source",
    channel: "web" as const, value: policy.sourceUrl, verified: true, isDemo: false,
    note: "Read the original source and follow its agency contact guidance.",
  }] : []);
}
