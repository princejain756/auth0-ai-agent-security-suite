/**
 * The Privacy-Aware RAG Bot (Focus: Auth0 FGA / Fine-Grained Authorization)
 * GHW Builders Week Challenge
 *
 * Enforces document-level relationship tuples via Auth0 FGA before the LLM
 * can include retrieved chunks in its RAG response. Demonstrates that a manager
 * (`user:alice`) can retrieve `document:budget_Q4` and `document:salary_bands_2026`,
 * whereas a general employee (`user:bob`) is strictly denied access to sensitive
 * documents even when they match the vector search query.
 */

export const KNOWLEDGE_BASE_DOCUMENTS = [
  {
    id: "document:engineering_onboarding",
    title: "Engineering Onboarding & Local Dev Guide",
    department: "all_staff",
    classification: "PUBLIC_INTERNAL",
    content: "All engineers receive GitHub Enterprise access, dev cluster namespaces, and VPN certificates on Day 1.",
    keywords: ["onboarding", "engineering", "vpn", "policy", "guide"]
  },
  {
    id: "document:budget_Q4",
    title: "Q4 2026 Infrastructure & Executive Budget Allocation",
    department: "management",
    classification: "RESTRICTED_LEADERSHIP",
    content: "Q4 2026 cloud compute reserve is $420,000 with $115,000 allocated to GPU inference clusters and $85,000 for security audits.",
    keywords: ["budget", "q4", "salary", "compensation", "allocation", "finance"]
  },
  {
    id: "document:salary_bands_2026",
    title: "2026 Engineering Manager & Staff Compensation Bands",
    department: "hr_and_managers",
    classification: "STRICTLY_CONFIDENTIAL",
    content: "Level L5 Senior SWE band: $165k-$195k base; Level M2 Engineering Manager band: $210k-$245k base plus 15% performance bonus.",
    keywords: ["salary", "compensation", "bands", "manager", "pay", "budget"]
  }
];

export const FGA_RELATIONSHIP_TUPLES = [
  { user: "user:alice", relation: "can_view", object: "document:engineering_onboarding" },
  { user: "user:alice", relation: "can_view", object: "document:budget_Q4" },
  { user: "user:alice", relation: "can_view", object: "document:salary_bands_2026" },
  { user: "user:bob", relation: "can_view", object: "document:engineering_onboarding" }
];

export class Auth0FgaRagBot {
  constructor(tuples = FGA_RELATIONSHIP_TUPLES) {
    this.tuples = tuples;
  }

  checkFga({ user, relation = "can_view", object }) {
    const allowed = this.tuples.some(
      (t) => t.user === user && t.relation === relation && t.object === object
    );
    return {
      user,
      relation,
      object,
      allowed,
      checkedVia: "Auth0 FGA /stores/01JGHWBUILDERS/check"
    };
  }

  queryRag({ user, roleLabel, query }) {
    const terms = query.toLowerCase().split(/\W+/).filter(Boolean);
    const candidateDocs = KNOWLEDGE_BASE_DOCUMENTS.filter((doc) =>
      terms.some((t) => doc.keywords.includes(t) || doc.title.toLowerCase().includes(t))
    );

    const fgaAuditLog = [];
    const authorizedDocs = [];
    const deniedDocs = [];

    for (const doc of candidateDocs) {
      const checkResult = this.checkFga({ user, relation: "can_view", object: doc.id });
      fgaAuditLog.push(checkResult);
      if (checkResult.allowed) {
        authorizedDocs.push(doc);
      } else {
        deniedDocs.push({ id: doc.id, title: doc.title, classification: doc.classification });
      }
    }

    const answer = authorizedDocs.length > 0
      ? `Authorized answer for ${user} (${roleLabel}): ` + authorizedDocs.map((d) => `[${d.id}] ${d.content}`).join(" | ")
      : `Access Denied by Auth0 FGA for ${user} (${roleLabel}): Matched ${deniedDocs.length} restricted document(s) (${deniedDocs.map((d) => d.id).join(", ")}), which were filtered out before LLM generation.`;

    return {
      user,
      roleLabel,
      query,
      totalVectorMatches: candidateDocs.length,
      fgaAuditLog,
      authorizedDocumentIds: authorizedDocs.map((d) => d.id),
      deniedDocuments: deniedDocs,
      answer
    };
  }
}
