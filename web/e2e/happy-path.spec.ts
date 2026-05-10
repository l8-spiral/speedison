import { test, expect } from "@playwright/test";

test("homepage loads with the Speedison title", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle(/Speedison/);
});

test("navbar 'Konfigurera' CTA scrolls to the offert form", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("link", { name: /^Konfigurera$/ }).first().click();
  await expect(page.getByRole("heading", { name: "Begär offert." })).toBeVisible();
});

test("offert form shows reg-number, contact, and service fields in one step", async ({ page }) => {
  await page.goto("/#konfigurator");
  await expect(page.getByLabel("Registreringsnummer")).toBeVisible();
  await expect(page.getByLabel("Namn")).toBeVisible();
  await expect(page.getByLabel("Telefon")).toBeVisible();
  await expect(page.getByLabel("E-post")).toBeVisible();
  await expect(page.getByLabel("Beskrivning")).toBeVisible();
  await expect(page.getByRole("button", { name: "Pops & Bangs" })).toBeVisible();
});

test("toggling a service button flips its aria-pressed state", async ({ page }) => {
  await page.goto("/#konfigurator");
  const popsButton = page.getByRole("button", { name: "Pops & Bangs" });
  await expect(popsButton).toHaveAttribute("aria-pressed", "false");
  await popsButton.click();
  await expect(popsButton).toHaveAttribute("aria-pressed", "true");
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
