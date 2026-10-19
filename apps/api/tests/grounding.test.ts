import { describe, expect, it } from "vitest";
import { groundRequirements } from "../src/domain/requirements/groundRequirements.js";
import { inferPriority } from "../src/domain/requirements/inferPriority.js";
import { routeCategory } from "../src/domain/requirements/routeCategory.js";

describe("requirement grounding and inference", () => {
  const sampleJd = `
    We are seeking a Senior Backend Engineer.
    Must have 5+ years of production experience in Node.js and TypeScript.
    Experience with distributed systems and high throughput streaming is required.
    Mentoring junior engineers and strong communication skills are essential.
    Experience with Kubernetes and Docker is a plus.
  `;

  it("drops hallucinated requirements whose evidence does not appear in the description", () => {
    const candidates = [
      {
        id: "req_grounded",
        text: "Node.js and TypeScript",
        evidence: "5+ years of production experience in Node.js and TypeScript"
      },
      {
        id: "req_hallucinated",
        text: "10 years of Rust",
        evidence: "Expertise in Rust embedded kernels"
      }
    ];

    const grounded = groundRequirements(candidates, sampleJd);
    expect(grounded.length).toBe(1);
    expect(grounded[0].id).toBe("req_grounded");
  });

  it("infers must vs nice priority from wording", () => {
    expect(inferPriority("Node.js", "Must have 5+ years of experience")).toBe("must");
    expect(inferPriority("Kubernetes", "Experience with Kubernetes is a plus")).toBe("nice");
    expect(inferPriority("GraphQL", "GraphQL is preferred but not required")).toBe("nice");
    expect(inferPriority("Python", "Knowledge of Python is a bonus")).toBe("nice");
  });

  it("routes requirements to appropriate categories", () => {
    expect(routeCategory("5 years of React and Next.js")).toBe("technical");
    expect(routeCategory("Mentoring junior developers and conducting 1-on-1s")).toBe("behavioural");
    expect(routeCategory("Designing distributed systems and high availability microservices")).toBe("system-design");
    expect(routeCategory("Deep alignment with our mission, culture and customer values")).toBe("company-fit");
  });

  it("activates system-design category when hiring stages include it", () => {
    const category = routeCategory("Backend database scaling", ["Recruiter call", "System Design Interview"]);
    expect(category).toBe("system-design");
  });
});
