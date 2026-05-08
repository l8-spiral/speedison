import { test, expect } from "@playwright/test";

test("homepage loads with the Speedison title", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle(/Speedison/);
});

test("navbar 'Konfigurera' CTA scrolls to the configurator", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("link", { name: /^Konfigurera$/ }).first().click();
  await expect(page.getByRole("heading", { name: "Bygg din bil." })).toBeVisible();
});

test("configurator advances from step 1 (Märke) to step 2 (Modell)", async ({ page }) => {
  await page.goto("/#konfigurator");
  await page.getByRole("button", { name: "Mercedes" }).click();
  await expect(page.getByRole("heading", { name: /Modell \(Mercedes\)/ })).toBeVisible();
});

test("kontakt page renders address + opening hours", async ({ page }) => {
  await page.goto("/kontakt");
  await expect(page.getByText(/Mätarvägen 9A/)).toBeVisible();
  await expect(page.getByText("Mån–Fre")).toBeVisible();
});

test("integritet page renders the GDPR policy", async ({ page }) => {
  await page.goto("/integritet");
  await expect(page.getByRole("heading", { name: "Integritetspolicy" })).toBeVisible();
});
