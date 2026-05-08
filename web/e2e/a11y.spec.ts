import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

// We assert no critical/serious violations. Moderate/minor issues surface
// during manual QA but don't block the pipeline.
function critical(violations: { impact?: string | null }[]) {
  return violations.filter((v) => v.impact === "critical" || v.impact === "serious");
}

test("homepage has no critical/serious a11y violations", async ({ page }) => {
  await page.goto("/");
  const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa"]).analyze();
  expect(critical(results.violations), JSON.stringify(critical(results.violations), null, 2)).toEqual([]);
});

test("kontakt page has no critical/serious a11y violations", async ({ page }) => {
  await page.goto("/kontakt");
  const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa"]).analyze();
  expect(critical(results.violations)).toEqual([]);
});

test("integritet page has no critical/serious a11y violations", async ({ page }) => {
  await page.goto("/integritet");
  const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa"]).analyze();
  expect(critical(results.violations)).toEqual([]);
});

test("configurator section has no critical/serious a11y violations", async ({ page }) => {
  await page.goto("/#konfigurator");
  const results = await new AxeBuilder({ page })
    .include("#konfigurator")
    .withTags(["wcag2a", "wcag2aa"])
    .analyze();
  expect(critical(results.violations)).toEqual([]);
});
